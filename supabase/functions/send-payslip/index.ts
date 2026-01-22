import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { processTemplate, formatMonth, formatCurrency, formatDate, type TemplateData } from "../_shared/templateProcessor.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// DGC Brand Colors (matching send-email)
const DGC_DEEP_GREEN = "#0F2A28";
const DGC_DEEP_GREEN_DARK = "#0A1D1B";
const DGC_GOLD = "#C6A45E";
const DGC_OFF_WHITE = "#F7F7F5";

// Portal URL for employee access
const PORTAL_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://hr.dgcholding.com";

interface SendPayslipRequest {
  payrollRunId: string;
  employeeIds?: string[];
}

interface ResendResponse {
  id?: string;
  error?: { message: string };
}

interface CompanyData {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  document_logo_url?: string;
  address_city?: string;
  address_country?: string;
}

interface EmailTemplate {
  subject: string;
  body_content: string;
  is_active: boolean;
  use_default_template: boolean;
}

/**
 * Check if the template contains a complete HTML structure
 * (has its own html/body tags or complete table layout)
 */
function isCompleteHtmlTemplate(html: string): boolean {
  const lowerHtml = html.toLowerCase();
  return (
    lowerHtml.includes('<!doctype') ||
    lowerHtml.includes('<html') ||
    lowerHtml.includes('<body') ||
    // Also detect if it starts with a table-based email layout
    (lowerHtml.includes('<table') && lowerHtml.includes('width="100%"'))
  );
}

async function sendEmail(to: string[], subject: string, html: string, from: string): Promise<ResendResponse> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  const data = await response.json();
  if (!response.ok) {
    return { error: { message: data.message || "Failed to send email" } };
  }
  return { id: data.id };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasPermission = userRoles?.some(r => r.role === "hr" || r.role === "admin");
    if (!hasPermission) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { payrollRunId, employeeIds }: SendPayslipRequest = await req.json();

    if (!payrollRunId) {
      return new Response(JSON.stringify({ error: "payrollRunId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: payrollRun, error: runError } = await supabase
      .from("payroll_runs")
      .select(`
        *,
        work_location:work_locations (name, currency)
      `)
      .eq("id", payrollRunId)
      .single();

    if (runError || !payrollRun) {
      throw new Error(`Payroll run not found: ${runError?.message}`);
    }

    // Get company settings with all branding data
    const { data: companySettings } = await supabase
      .from("company_settings")
      .select("name, email, phone, website, logo_url, document_logo_url, address_city, address_country")
      .single();

    const company: CompanyData = companySettings || { name: "Company" };
    const companyName = company.name || "Company";
    const fromEmail = `${companyName} <noreply@updates.dgcholding.com>`;

    // Fetch email template from database
    const { data: emailTemplate } = await supabase
      .from("email_templates")
      .select("subject, body_content, is_active, use_default_template")
      .eq("type", "payslip_issued")
      .single();

    // Use custom template ONLY if active AND use_default_template is false
    const useCustomTemplate = emailTemplate?.is_active && 
                              emailTemplate?.body_content && 
                              !emailTemplate?.use_default_template;

    let employeesQuery = supabase
      .from("payroll_run_employees")
      .select(`
        *,
        employee:employees (
          id,
          first_name,
          last_name,
          email,
          employee_code
        )
      `)
      .eq("payroll_run_id", payrollRunId);

    if (employeeIds && employeeIds.length > 0) {
      employeesQuery = employeesQuery.in("employee_id", employeeIds);
    }

    const { data: payrollEmployees, error: empError } = await employeesQuery;

    if (empError) {
      throw new Error(`Failed to fetch employees: ${empError.message}`);
    }

    const results: Array<{ employeeId: string; success: boolean; error?: string }> = [];
    const currency = payrollRun.work_location?.currency || "SAR";

    for (const pe of payrollEmployees || []) {
      const employee = pe.employee;
      if (!employee?.email) {
        results.push({ employeeId: pe.employee_id, success: false, error: "No email" });
        continue;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("employee_id", employee.id)
        .single();

      if (profile) {
        const { data: prefs } = await supabase
          .from("notification_preferences")
          .select("email_payroll_reminders")
          .eq("user_id", profile.id)
          .single();

        if (prefs?.email_payroll_reminders === false) {
          results.push({ employeeId: pe.employee_id, success: false, error: "Email notifications disabled" });
          continue;
        }
      }

      const employeeName = `${employee.first_name} ${employee.last_name}`;
      const netPayFormatted = formatCurrency(pe.net_pay || 0, currency);
      const grossPayFormatted = formatCurrency(pe.gross_pay || pe.base_salary || 0, currency);

      let subject: string;
      let html: string;

      if (useCustomTemplate) {
        // Use custom template from database
        const templateData: TemplateData = {
          employee: {
            first_name: employee.first_name,
            last_name: employee.last_name,
            full_name: employeeName,
            email: employee.email,
            employee_code: employee.employee_code,
          },
          work_location: {
            name: payrollRun.work_location?.name,
            currency: currency,
          },
          company: {
            name: companyName,
            email: company.email,
            phone: company.phone,
            website: company.website,
            full_address: company.address_city && company.address_country 
              ? `${company.address_city}, ${company.address_country}` 
              : undefined,
          },
          payroll: {
            pay_period: formatMonth(payrollRun.pay_period_start),
            pay_period_start: payrollRun.pay_period_start,
            pay_period_end: payrollRun.pay_period_end,
            gross_pay: pe.gross_pay || pe.base_salary || 0,
            net_pay: pe.net_pay || 0,
            total_allowances: pe.total_allowances || 0,
            total_deductions: pe.total_deductions || 0,
          },
          system: {
            current_date: new Date().toISOString(),
            current_year: new Date().getFullYear().toString(),
            portal_link: `${PORTAL_BASE_URL}/my-profile?tab=documents`,
          },
        };

        // Process subject and body with smart tags
        subject = processTemplate(emailTemplate!.subject, templateData);
        const processedBody = processTemplate(emailTemplate!.body_content, templateData);
        
        // Check if template is a complete HTML document - if so, use as-is
        if (isCompleteHtmlTemplate(processedBody)) {
          html = processedBody;
        } else {
          // Wrap partial content in email template with header/footer
          html = wrapInEmailTemplate({
            companyName,
            companyLogo: company.document_logo_url || company.logo_url,
            companyPhone: company.phone,
            companyWebsite: company.website,
            companyEmail: company.email,
            companyAddress: company.address_city && company.address_country 
              ? `${company.address_city}, ${company.address_country}` 
              : undefined,
            bodyContent: processedBody,
          });
        }
      } else {
        // Fallback to hardcoded template
        subject = `Your Payslip - ${formatMonth(payrollRun.pay_period_start)}`;
        html = generatePayslipEmailHtml({
          companyName,
          companyLogo: company.document_logo_url || company.logo_url,
          companyPhone: company.phone,
          companyWebsite: company.website,
          companyEmail: company.email,
          companyAddress: company.address_city && company.address_country 
            ? `${company.address_city}, ${company.address_country}` 
            : undefined,
          employeeName,
          payPeriodStart: payrollRun.pay_period_start,
          payPeriodEnd: payrollRun.pay_period_end,
          netPay: (pe.net_pay || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          currency,
        });
      }

      try {
        const emailResult = await sendEmail([employee.email], subject, html, fromEmail);

        await supabase.from("email_logs").insert({
          recipient_email: employee.email,
          recipient_user_id: profile?.id || null,
          employee_id: employee.id,
          email_type: "payslip_issued",
          subject,
          status: emailResult.error ? "failed" : "sent",
          resend_id: emailResult.id,
          error_message: emailResult.error?.message,
          metadata: { payroll_run_id: payrollRunId, net_pay: pe.net_pay, used_custom_template: useCustomTemplate },
          sent_at: new Date().toISOString(),
        });

        results.push({ 
          employeeId: pe.employee_id, 
          success: !emailResult.error,
          error: emailResult.error?.message,
        });
      } catch (sendError: unknown) {
        const message = sendError instanceof Error ? sendError.message : "Send failed";
        results.push({ employeeId: pe.employee_id, success: false, error: message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        failed: failCount,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-payslip function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

interface EmailWrapperData {
  companyName: string;
  companyLogo?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companyEmail?: string;
  companyAddress?: string;
  bodyContent: string;
}

function wrapInEmailTemplate(data: EmailWrapperData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:${DGC_OFF_WHITE};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:20px;">
    ${generateEmailHeader(data)}
    <tr>
      <td style="background-color:#ffffff;padding:30px;">
        ${data.bodyContent}
      </td>
    </tr>
    ${generateEmailFooter(data)}
  </table>
</body>
</html>`;
}

interface PayslipEmailData {
  companyName: string;
  companyLogo?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companyEmail?: string;
  companyAddress?: string;
  employeeName: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  netPay: string;
  currency: string;
}

function generateEmailHeader(data: { companyName: string; companyLogo?: string }): string {
  // Check if logo is SVG (poor email client support)
  const isSvg = data.companyLogo?.toLowerCase().endsWith('.svg');
  
  // Use table-based fallback letter if no logo or if SVG
  const logoSection = (data.companyLogo && !isSvg)
    ? `<img src="${data.companyLogo}" alt="${data.companyName}" style="max-height:45px;max-width:150px;vertical-align:middle;" />`
    : `<table role="presentation" cellspacing="0" cellpadding="0" style="display:inline-block;vertical-align:middle;">
        <tr>
          <td bgcolor="#1a3634" style="width:45px;height:45px;background-color:#1a3634;border-radius:8px;text-align:center;font-size:20px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">
            ${data.companyName.charAt(0)}
          </td>
        </tr>
       </table>`;

  return `
    <tr>
      <td bgcolor="${DGC_DEEP_GREEN}" style="background-color:${DGC_DEEP_GREEN};background:linear-gradient(135deg,${DGC_DEEP_GREEN} 0%,${DGC_DEEP_GREEN_DARK} 100%);padding:25px 30px;border-radius:12px 12px 0 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="vertical-align:middle;">
              ${logoSection}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function generateEmailFooter(data: { companyName: string; companyPhone?: string; companyWebsite?: string; companyEmail?: string; companyAddress?: string }): string {
  const phone = data.companyPhone || "+973 17000342";
  const website = data.companyWebsite || "www.dgcholding.com";
  const email = data.companyEmail || "info@dgcholding.com";
  const address = data.companyAddress || "Manama, Kingdom of Bahrain";

  return `
    <tr>
      <td style="background-color:#f9fafb;padding:25px 30px;border-top:1px solid #e5e7eb;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="text-align:center;">
              <p style="color:#18181b;margin:0 0 8px 0;font-size:14px;font-weight:600;">${data.companyName}</p>
              <p style="color:#71717a;margin:0 0 4px 0;font-size:12px;">${address}</p>
              <p style="color:#71717a;margin:0 0 15px 0;font-size:12px;">
                <a href="tel:${phone.replace(/\s/g, '')}" style="color:#71717a;text-decoration:none;">${phone}</a>
                &nbsp;|&nbsp;
                <a href="mailto:${email}" style="color:${DGC_GOLD};text-decoration:none;">${email}</a>
              </p>
              <p style="margin:0 0 15px 0;">
                <a href="https://${website}" style="color:${DGC_GOLD};text-decoration:none;font-size:12px;font-weight:500;">${website}</a>
              </p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:15px 0;" />
              <p style="color:#a1a1aa;margin:0;font-size:11px;line-height:1.5;">
                This is an automated notification from ${data.companyName}.<br />
                Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function generatePayslipEmailHtml(data: PayslipEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:${DGC_OFF_WHITE};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:20px;">
    ${generateEmailHeader(data)}
    <tr>
      <td style="background-color:#ffffff;padding:30px;">
        <div style="text-align:center;margin-bottom:20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
            <tr>
              <td bgcolor="#e8edec" style="width:70px;height:70px;background-color:#e8edec;border-radius:50%;text-align:center;vertical-align:middle;font-size:32px;">
                💰
              </td>
            </tr>
          </table>
        </div>
        <h2 style="color:#18181b;margin:0 0 10px 0;font-size:22px;text-align:center;font-weight:600;">Your Payslip is Ready</h2>
        <p style="color:#52525b;margin:0 0 25px 0;line-height:1.6;text-align:center;font-size:15px;">Hi <strong style="color:#18181b;">${data.employeeName}</strong>, your payslip for <strong style="color:#18181b;">${formatMonth(data.payPeriodStart)}</strong> is now available.</p>
        
        <!-- Net Pay Highlight -->
        <div style="background:linear-gradient(135deg,${DGC_DEEP_GREEN} 0%,${DGC_DEEP_GREEN_DARK} 100%);border-radius:12px;padding:25px;margin-bottom:20px;text-align:center;">
          <p style="color:rgba(255,255,255,0.8);margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Net Pay</p>
          <p style="color:#ffffff;margin:0;font-size:32px;font-weight:700;">${data.currency} ${data.netPay}</p>
        </div>
        
        <!-- Pay Period Details -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fafafa;border-radius:10px;border:1px solid #e5e7eb;margin-bottom:20px;">
          <tr><td style="padding:20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr><td style="padding:10px 0;color:#71717a;font-size:13px;">Pay Period</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;font-weight:500;">${formatDate(data.payPeriodStart)} - ${formatDate(data.payPeriodEnd)}</td></tr>
              <tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-top:1px solid #e5e7eb;">Status</td><td style="padding:10px 0;text-align:right;border-top:1px solid #e5e7eb;"><span style="background-color:${DGC_GOLD}20;color:${DGC_GOLD};padding:4px 10px;border-radius:4px;font-size:12px;font-weight:600;">Issued</span></td></tr>
            </table>
          </td></tr>
        </table>
        
        <p style="color:#71717a;margin:0;font-size:13px;text-align:center;line-height:1.5;">Please log in to the HR portal to download your detailed payslip.<br />Contact HR if you have any questions about your compensation.</p>
      </td>
    </tr>
    ${generateEmailFooter(data)}
  </table>
</body>
</html>`;
}
