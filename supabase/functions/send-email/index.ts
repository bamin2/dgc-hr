import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface EmailRequest {
  type: "leave_request_submitted" | "leave_request_approved" | "leave_request_rejected";
  leaveRequestId?: string;
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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { type, leaveRequestId }: EmailRequest = await req.json();

    // Get company settings
    const { data: companySettings } = await supabase
      .from("company_settings")
      .select("name, email")
      .single();

    const companyName = companySettings?.name || "Company";
    const fromEmail = `${companyName} <${companySettings?.email || "onboarding@resend.dev"}>`;

    let emailSent = false;
    let emailResult: ResendResponse = {};

    if (type.startsWith("leave_request_") && leaveRequestId) {
      // Fetch leave request details
      const { data: leaveRequest, error: fetchError } = await supabase
        .from("leave_requests")
        .select(`
          *,
          employee:employees!leave_requests_employee_id_fkey (
            id, first_name, last_name, email, manager_id,
            manager:employees!employees_manager_id_fkey (id, first_name, last_name, email, user_id)
          ),
          leave_type:leave_types (id, name),
          reviewer:employees!leave_requests_reviewed_by_fkey (id, first_name, last_name)
        `)
        .eq("id", leaveRequestId)
        .single();

      if (fetchError || !leaveRequest) {
        throw new Error(`Leave request not found: ${fetchError?.message}`);
      }

      const employeeName = `${leaveRequest.employee.first_name} ${leaveRequest.employee.last_name}`;
      const employeeEmail = leaveRequest.employee.email;
      const leaveTypeName = leaveRequest.leave_type?.name || "Leave";

      if (type === "leave_request_submitted") {
        // Notify manager if exists
        const manager = leaveRequest.employee.manager;
        if (manager?.email) {
          // Check manager's notification preferences
          const { data: prefs } = await supabase
            .from("notification_preferences")
            .select("email_leave_submissions")
            .eq("user_id", manager.user_id)
            .single();

          if (prefs?.email_leave_submissions !== false) {
            const html = generateLeaveSubmittedHtml({
              companyName,
              employeeName,
              leaveType: leaveTypeName,
              startDate: leaveRequest.start_date,
              endDate: leaveRequest.end_date,
              daysCount: leaveRequest.days_count,
              reason: leaveRequest.reason,
            });

            const result = await sendEmail(
              [manager.email],
              `Leave Request: ${employeeName} - ${leaveTypeName}`,
              html,
              fromEmail
            );

            emailResult = result;
            emailSent = true;

            // Log the email
            await supabase.from("email_logs").insert({
              recipient_email: manager.email,
              recipient_user_id: manager.user_id,
              employee_id: manager.id,
              email_type: type,
              subject: `Leave Request: ${employeeName} - ${leaveTypeName}`,
              status: result.error ? "failed" : "sent",
              resend_id: result.id,
              error_message: result.error?.message,
              metadata: { leave_request_id: leaveRequestId },
              sent_at: new Date().toISOString(),
            });
          }
        }
      } else if (type === "leave_request_approved" || type === "leave_request_rejected") {
        // Notify employee
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("employee_id", leaveRequest.employee.id)
          .single();

        if (profile) {
          const { data: prefs } = await supabase
            .from("notification_preferences")
            .select("email_leave_approvals")
            .eq("user_id", profile.id)
            .single();

          if (prefs?.email_leave_approvals !== false) {
            const reviewerName = leaveRequest.reviewer
              ? `${leaveRequest.reviewer.first_name} ${leaveRequest.reviewer.last_name}`
              : undefined;

            const html =
              type === "leave_request_approved"
                ? generateLeaveApprovedHtml({
                    companyName,
                    employeeName,
                    leaveType: leaveTypeName,
                    startDate: leaveRequest.start_date,
                    endDate: leaveRequest.end_date,
                    daysCount: leaveRequest.days_count,
                    reviewerName,
                  })
                : generateLeaveRejectedHtml({
                    companyName,
                    employeeName,
                    leaveType: leaveTypeName,
                    startDate: leaveRequest.start_date,
                    endDate: leaveRequest.end_date,
                    daysCount: leaveRequest.days_count,
                    rejectionReason: leaveRequest.rejection_reason,
                    reviewerName,
                  });

            const subject =
              type === "leave_request_approved"
                ? `Leave Request Approved - ${leaveTypeName}`
                : `Leave Request Rejected - ${leaveTypeName}`;

            const result = await sendEmail([employeeEmail], subject, html, fromEmail);

            emailResult = result;
            emailSent = true;

            // Log the email
            await supabase.from("email_logs").insert({
              recipient_email: employeeEmail,
              recipient_user_id: profile.id,
              employee_id: leaveRequest.employee.id,
              email_type: type,
              subject,
              status: result.error ? "failed" : "sent",
              resend_id: result.id,
              error_message: result.error?.message,
              metadata: { leave_request_id: leaveRequestId },
              sent_at: new Date().toISOString(),
            });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, emailSent, result: emailResult }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-email function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

// Inline email templates
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface LeaveEmailData {
  companyName: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason?: string;
  rejectionReason?: string;
  reviewerName?: string;
}

function generateLeaveSubmittedHtml(data: LeaveEmailData): string {
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
      <h2 style="color:#18181b;margin:0 0 20px 0;font-size:20px;">Leave Request Submitted</h2>
      <p style="color:#52525b;margin:0 0 20px 0;line-height:1.6;"><strong>${data.employeeName}</strong> has submitted a leave request that requires your review.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;border-radius:8px;margin-bottom:20px;">
        <tr><td style="padding:20px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr><td style="padding:8px 0;color:#71717a;font-size:14px;">Leave Type</td><td style="padding:8px 0;color:#18181b;font-size:14px;text-align:right;font-weight:600;">${data.leaveType}</td></tr>
            <tr><td style="padding:8px 0;color:#71717a;font-size:14px;">From</td><td style="padding:8px 0;color:#18181b;font-size:14px;text-align:right;">${formatDate(data.startDate)}</td></tr>
            <tr><td style="padding:8px 0;color:#71717a;font-size:14px;">To</td><td style="padding:8px 0;color:#18181b;font-size:14px;text-align:right;">${formatDate(data.endDate)}</td></tr>
            <tr><td style="padding:8px 0;color:#71717a;font-size:14px;">Duration</td><td style="padding:8px 0;color:#18181b;font-size:14px;text-align:right;font-weight:600;">${data.daysCount} day${data.daysCount !== 1 ? "s" : ""}</td></tr>
            ${data.reason ? `<tr><td colspan="2" style="padding:12px 0 0 0;border-top:1px solid #e4e4e7;color:#52525b;font-size:14px;"><strong>Reason:</strong> ${data.reason}</td></tr>` : ""}
          </table>
        </td></tr>
      </table>
      <p style="color:#71717a;margin:20px 0 0 0;font-size:12px;text-align:center;">This is an automated notification from ${data.companyName}</p>
    </td></tr>
  </table>
</body>
</html>`;
}

function generateLeaveApprovedHtml(data: LeaveEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:20px;">
    <tr><td style="background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);padding:30px;border-radius:12px 12px 0 0;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;">${data.companyName}</h1>
    </td></tr>
    <tr><td style="background-color:#ffffff;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
      <h2 style="color:#18181b;margin:0 0 10px 0;font-size:20px;text-align:center;">✓ Leave Request Approved</h2>
      <p style="color:#52525b;margin:0 0 20px 0;line-height:1.6;text-align:center;">Hi ${data.employeeName}, your leave request has been approved${data.reviewerName ? ` by ${data.reviewerName}` : ""}.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;border-radius:8px;margin-bottom:20px;">
        <tr><td style="padding:20px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr><td style="padding:8px 0;color:#71717a;font-size:14px;">Leave Type</td><td style="padding:8px 0;color:#18181b;font-size:14px;text-align:right;font-weight:600;">${data.leaveType}</td></tr>
            <tr><td style="padding:8px 0;color:#71717a;font-size:14px;">From</td><td style="padding:8px 0;color:#18181b;font-size:14px;text-align:right;">${formatDate(data.startDate)}</td></tr>
            <tr><td style="padding:8px 0;color:#71717a;font-size:14px;">To</td><td style="padding:8px 0;color:#18181b;font-size:14px;text-align:right;">${formatDate(data.endDate)}</td></tr>
            <tr><td style="padding:8px 0;color:#71717a;font-size:14px;">Duration</td><td style="padding:8px 0;color:#18181b;font-size:14px;text-align:right;font-weight:600;">${data.daysCount} day${data.daysCount !== 1 ? "s" : ""}</td></tr>
          </table>
        </td></tr>
      </table>
      <p style="color:#71717a;margin:20px 0 0 0;font-size:12px;text-align:center;">This is an automated notification from ${data.companyName}</p>
    </td></tr>
  </table>
</body>
</html>`;
}

function generateLeaveRejectedHtml(data: LeaveEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:20px;">
    <tr><td style="background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);padding:30px;border-radius:12px 12px 0 0;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;">${data.companyName}</h1>
    </td></tr>
    <tr><td style="background-color:#ffffff;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
      <h2 style="color:#18181b;margin:0 0 10px 0;font-size:20px;text-align:center;">✗ Leave Request Rejected</h2>
      <p style="color:#52525b;margin:0 0 20px 0;line-height:1.6;text-align:center;">Hi ${data.employeeName}, your leave request has been rejected${data.reviewerName ? ` by ${data.reviewerName}` : ""}.</p>
      ${data.rejectionReason ? `<div style="background-color:#fef2f2;border-left:4px solid #ef4444;padding:15px;margin-bottom:20px;border-radius:4px;"><p style="color:#991b1b;margin:0;font-size:14px;"><strong>Reason:</strong> ${data.rejectionReason}</p></div>` : ""}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;border-radius:8px;margin-bottom:20px;">
        <tr><td style="padding:20px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr><td style="padding:8px 0;color:#71717a;font-size:14px;">Leave Type</td><td style="padding:8px 0;color:#18181b;font-size:14px;text-align:right;font-weight:600;">${data.leaveType}</td></tr>
            <tr><td style="padding:8px 0;color:#71717a;font-size:14px;">From</td><td style="padding:8px 0;color:#18181b;font-size:14px;text-align:right;">${formatDate(data.startDate)}</td></tr>
            <tr><td style="padding:8px 0;color:#71717a;font-size:14px;">To</td><td style="padding:8px 0;color:#18181b;font-size:14px;text-align:right;">${formatDate(data.endDate)}</td></tr>
            <tr><td style="padding:8px 0;color:#71717a;font-size:14px;">Duration</td><td style="padding:8px 0;color:#18181b;font-size:14px;text-align:right;font-weight:600;">${data.daysCount} day${data.daysCount !== 1 ? "s" : ""}</td></tr>
          </table>
        </td></tr>
      </table>
      <p style="color:#71717a;margin:20px 0 0 0;font-size:12px;text-align:center;">This is an automated notification from ${data.companyName}</p>
    </td></tr>
  </table>
</body>
</html>`;
}
