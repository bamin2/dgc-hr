import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface SendPayslipRequest {
  payrollRunId: string;
  employeeIds?: string[];
}

interface ResendResponse {
  id?: string;
  error?: { message: string };
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

    const { data: companySettings } = await supabase
      .from("company_settings")
      .select("name, email")
      .single();

    const companyName = companySettings?.name || "Company";
    const fromEmail = `${companyName} <${companySettings?.email || "onboarding@resend.dev"}>`;

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
  employeeName: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  netPay: string;
  currency: string;
}

function generatePayslipEmailHtml(data: PayslipEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:20px;">
    <tr><td style="background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);padding:30px;border-radius:12px 12px 0 0;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;">${data.companyName}</h1>
    </td></tr>
    <tr><td style="background-color:#ffffff;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="text-align:center;margin-bottom:20px;">
        <div style="display:inline-block;background-color:#dbeafe;border-radius:50%;width:60px;height:60px;line-height:60px;text-align:center;">
          <span style="font-size:24px;">📄</span>
        </div>
      </div>
      <h2 style="color:#18181b;margin:0 0 10px 0;font-size:20px;text-align:center;">Your Payslip is Ready</h2>
      <p style="color:#52525b;margin:0 0 20px 0;line-height:1.6;text-align:center;">Hi ${data.employeeName}, your payslip for ${formatMonth(data.payPeriodStart)} is now available.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;border-radius:8px;margin-bottom:20px;">
        <tr><td style="padding:20px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr><td style="padding:8px 0;color:#71717a;font-size:14px;">Pay Period</td><td style="padding:8px 0;color:#18181b;font-size:14px;text-align:right;">${formatDate(data.payPeriodStart)} - ${formatDate(data.payPeriodEnd)}</td></tr>
            <tr><td style="padding:8px 0;color:#71717a;font-size:14px;">Net Pay</td><td style="padding:8px 0;color:#3b82f6;font-size:18px;text-align:right;font-weight:700;">${data.currency} ${data.netPay}</td></tr>
          </table>
        </td></tr>
      </table>
      <p style="color:#52525b;margin:0 0 20px 0;line-height:1.6;text-align:center;font-size:14px;">Please log in to the HR portal to download your detailed payslip.</p>
      <p style="color:#71717a;margin:20px 0 0 0;font-size:12px;text-align:center;">This is an automated notification from ${data.companyName}</p>
    </td></tr>
  </table>
</body>
</html>`;
}
