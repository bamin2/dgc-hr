import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Brand colors
const BRAND_PRIMARY = "#804EEC";
const BRAND_PRIMARY_DARK = "#6B3FD4";

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
  document_logo_url?: string; // Preferred logo for documents/emails
  address_city?: string;
  address_country?: string;
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
      const netPay = (pe.net_pay || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      const html = generatePayslipEmailHtml({
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
        netPay,
        currency,
      });

      const subject = `Your Payslip - ${formatMonth(payrollRun.pay_period_start)}`;

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
          metadata: { payroll_run_id: payrollRunId, net_pay: pe.net_pay },
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatMonth(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
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

function generateEmailHeader(data: PayslipEmailData): string {
  const logoSection = data.companyLogo 
    ? `<img src="${data.companyLogo}" alt="${data.companyName}" style="max-height:45px;max-width:150px;margin-right:15px;vertical-align:middle;" />`
    : `<div style="display:inline-block;width:45px;height:45px;background:rgba(255,255,255,0.2);border-radius:8px;margin-right:15px;vertical-align:middle;text-align:center;line-height:45px;font-size:20px;font-weight:bold;color:white;">${data.companyName.charAt(0)}</div>`;

  return `
    <tr>
      <td style="background:linear-gradient(135deg,${BRAND_PRIMARY} 0%,${BRAND_PRIMARY_DARK} 100%);padding:25px 30px;border-radius:12px 12px 0 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="vertical-align:middle;">
              ${logoSection}
              <span style="color:#ffffff;font-size:22px;font-weight:600;vertical-align:middle;">${data.companyName}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function generateEmailFooter(data: PayslipEmailData): string {
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
                <a href="mailto:${email}" style="color:${BRAND_PRIMARY};text-decoration:none;">${email}</a>
              </p>
              <p style="margin:0 0 15px 0;">
                <a href="https://${website}" style="color:${BRAND_PRIMARY};text-decoration:none;font-size:12px;font-weight:500;">${website}</a>
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
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:20px;">
    ${generateEmailHeader(data)}
    <tr>
      <td style="background-color:#ffffff;padding:30px;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="display:inline-block;background:linear-gradient(135deg,${BRAND_PRIMARY}20 0%,${BRAND_PRIMARY}10 100%);border-radius:50%;width:70px;height:70px;line-height:70px;text-align:center;">
            <span style="font-size:32px;">💰</span>
          </div>
        </div>
        <h2 style="color:#18181b;margin:0 0 10px 0;font-size:22px;text-align:center;font-weight:600;">Your Payslip is Ready</h2>
        <p style="color:#52525b;margin:0 0 25px 0;line-height:1.6;text-align:center;font-size:15px;">Hi <strong style="color:#18181b;">${data.employeeName}</strong>, your payslip for <strong style="color:#18181b;">${formatMonth(data.payPeriodStart)}</strong> is now available.</p>
        
        <!-- Net Pay Highlight -->
        <div style="background:linear-gradient(135deg,${BRAND_PRIMARY} 0%,${BRAND_PRIMARY_DARK} 100%);border-radius:12px;padding:25px;margin-bottom:20px;text-align:center;">
          <p style="color:rgba(255,255,255,0.8);margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Net Pay</p>
          <p style="color:#ffffff;margin:0;font-size:32px;font-weight:700;">${data.currency} ${data.netPay}</p>
        </div>
        
        <!-- Pay Period Details -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fafafa;border-radius:10px;border:1px solid #e5e7eb;margin-bottom:20px;">
          <tr><td style="padding:20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr><td style="padding:10px 0;color:#71717a;font-size:13px;">Pay Period</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;font-weight:500;">${formatDate(data.payPeriodStart)} - ${formatDate(data.payPeriodEnd)}</td></tr>
              <tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-top:1px solid #e5e7eb;">Status</td><td style="padding:10px 0;text-align:right;border-top:1px solid #e5e7eb;"><span style="background-color:#dcfce7;color:#16a34a;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:600;">Issued</span></td></tr>
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
