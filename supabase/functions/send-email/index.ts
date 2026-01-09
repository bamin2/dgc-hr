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

interface EmailRequest {
  type: "leave_request_submitted" | "leave_request_approved" | "leave_request_rejected";
  leaveRequestId?: string;
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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { type, leaveRequestId }: EmailRequest = await req.json();

    // Get company settings with all branding data
    const { data: companySettings } = await supabase
      .from("company_settings")
      .select("name, email, phone, website, logo_url, address_city, address_country")
      .single();

    const company: CompanyData = companySettings || { name: "Company" };
    const companyName = company.name || "Company";
    const fromEmail = `${companyName} <noreply@updates.dgcholding.com>`;

    let emailSent = false;
    let emailResult: ResendResponse = {};

    if (type.startsWith("leave_request_") && leaveRequestId) {
      // Fetch leave request details
      const { data: leaveRequest, error: fetchError } = await supabase
        .from("leave_requests")
        .select(`
          *,
          employee:employees!leave_requests_employee_id_fkey (
            id, first_name, last_name, email, avatar_url
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

      // Get requester's user_id for notifications
      const { data: requesterProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("employee_id", leaveRequest.employee.id)
        .single();

      if (type === "leave_request_submitted") {
        // Find the pending approval step from the approval workflow (configured in Settings)
        const { data: pendingStep, error: stepError } = await supabase
          .from("request_approval_steps")
          .select(`
            id,
            step_number,
            approver_type,
            approver_user_id
          `)
          .eq("request_id", leaveRequestId)
          .eq("request_type", "time_off")
          .eq("status", "pending")
          .order("step_number", { ascending: true })
          .limit(1)
          .single();

        if (stepError) {
          console.log("No pending approval step found:", stepError.message);
        }

        if (pendingStep?.approver_user_id) {
          // Get the approver's employee details via their user_id
          const { data: approverProfile } = await supabase
            .from("profiles")
            .select("employee_id")
            .eq("id", pendingStep.approver_user_id)
            .single();

          if (approverProfile?.employee_id) {
            const { data: approver } = await supabase
              .from("employees")
              .select("id, first_name, last_name, email")
              .eq("id", approverProfile.employee_id)
              .single();

            if (approver?.email) {
              // Check approver's notification preferences
              const { data: prefs } = await supabase
                .from("notification_preferences")
                .select("email_leave_submissions")
                .eq("user_id", pendingStep.approver_user_id)
                .single();

              if (prefs?.email_leave_submissions !== false) {
                const html = generateLeaveSubmittedHtml({
                  companyName,
                  companyLogo: company.logo_url,
                  companyPhone: company.phone,
                  companyWebsite: company.website,
                  companyEmail: company.email,
                  companyAddress: company.address_city && company.address_country 
                    ? `${company.address_city}, ${company.address_country}` 
                    : undefined,
                  employeeName,
                  leaveType: leaveTypeName,
                  startDate: leaveRequest.start_date,
                  endDate: leaveRequest.end_date,
                  daysCount: leaveRequest.days_count,
                  reason: leaveRequest.reason,
                });

                const result = await sendEmail(
                  [approver.email],
                  `Leave Request: ${employeeName} - ${leaveTypeName}`,
                  html,
                  fromEmail
                );

                emailResult = result;
                emailSent = true;

                // Log the email
                await supabase.from("email_logs").insert({
                  recipient_email: approver.email,
                  recipient_user_id: pendingStep.approver_user_id,
                  employee_id: approver.id,
                  email_type: type,
                  subject: `Leave Request: ${employeeName} - ${leaveTypeName}`,
                  status: result.error ? "failed" : "sent",
                  resend_id: result.id,
                  error_message: result.error?.message,
                  metadata: { leave_request_id: leaveRequestId },
                  sent_at: new Date().toISOString(),
                });
              }

              // Create in-app notification for the approver
              await supabase.from("notifications").insert({
                user_id: pendingStep.approver_user_id,
                type: "approval",
                title: "New Leave Request",
                message: `${employeeName} has submitted a ${leaveTypeName} request for ${leaveRequest.days_count} day${leaveRequest.days_count !== 1 ? "s" : ""}`,
                priority: "medium",
                action_url: "/approvals",
                actor_name: employeeName,
                actor_avatar: leaveRequest.employee.avatar_url,
                metadata: { request_id: leaveRequestId, request_type: "time_off" },
              });
            }
          }
        }

        // Create confirmation notification for the requester
        if (requesterProfile?.id) {
          await supabase.from("notifications").insert({
            user_id: requesterProfile.id,
            type: "leave_request",
            title: "Leave Request Submitted",
            message: `Your ${leaveTypeName} request for ${leaveRequest.days_count} day${leaveRequest.days_count !== 1 ? "s" : ""} has been submitted and is pending approval`,
            priority: "low",
            action_url: "/approvals?tab=my-requests",
            metadata: { request_id: leaveRequestId },
          });
        }
      } else if (type === "leave_request_approved" || type === "leave_request_rejected") {
        // Notify employee
        if (requesterProfile) {
          const { data: prefs } = await supabase
            .from("notification_preferences")
            .select("email_leave_approvals")
            .eq("user_id", requesterProfile.id)
            .single();

          if (prefs?.email_leave_approvals !== false) {
            const reviewerName = leaveRequest.reviewer
              ? `${leaveRequest.reviewer.first_name} ${leaveRequest.reviewer.last_name}`
              : undefined;

            const emailData = {
              companyName,
              companyLogo: company.logo_url,
              companyPhone: company.phone,
              companyWebsite: company.website,
              companyEmail: company.email,
              companyAddress: company.address_city && company.address_country 
                ? `${company.address_city}, ${company.address_country}` 
                : undefined,
              employeeName,
              leaveType: leaveTypeName,
              startDate: leaveRequest.start_date,
              endDate: leaveRequest.end_date,
              daysCount: leaveRequest.days_count,
              reviewerName,
              rejectionReason: leaveRequest.rejection_reason,
            };

            const html =
              type === "leave_request_approved"
                ? generateLeaveApprovedHtml(emailData)
                : generateLeaveRejectedHtml(emailData);

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
              recipient_user_id: requesterProfile.id,
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

          // Create in-app notification for the requester
          const notificationTitle = type === "leave_request_approved" 
            ? "Leave Request Approved" 
            : "Leave Request Rejected";
          const notificationMessage = type === "leave_request_approved"
            ? `Your ${leaveTypeName} request has been approved`
            : `Your ${leaveTypeName} request has been rejected${leaveRequest.rejection_reason ? `: ${leaveRequest.rejection_reason}` : ""}`;

          await supabase.from("notifications").insert({
            user_id: requesterProfile.id,
            type: "approval",
            title: notificationTitle,
            message: notificationMessage,
            priority: type === "leave_request_approved" ? "medium" : "high",
            action_url: "/approvals?tab=my-requests",
            metadata: { request_id: leaveRequestId, status: type === "leave_request_approved" ? "approved" : "rejected" },
          });
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

// Inline email templates with branding
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface LeaveEmailData {
  companyName: string;
  companyLogo?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companyEmail?: string;
  companyAddress?: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason?: string;
  rejectionReason?: string;
  reviewerName?: string;
}

function generateEmailHeader(data: LeaveEmailData, gradientColors: { from: string; to: string } = { from: BRAND_PRIMARY, to: BRAND_PRIMARY_DARK }): string {
  const logoSection = data.companyLogo 
    ? `<img src="${data.companyLogo}" alt="${data.companyName}" style="max-height:45px;max-width:150px;margin-right:15px;vertical-align:middle;" />`
    : `<div style="display:inline-block;width:45px;height:45px;background:rgba(255,255,255,0.2);border-radius:8px;margin-right:15px;vertical-align:middle;text-align:center;line-height:45px;font-size:20px;font-weight:bold;color:white;">${data.companyName.charAt(0)}</div>`;

  return `
    <tr>
      <td style="background:linear-gradient(135deg,${gradientColors.from} 0%,${gradientColors.to} 100%);padding:25px 30px;border-radius:12px 12px 0 0;">
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

function generateEmailFooter(data: LeaveEmailData): string {
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

function generateLeaveSubmittedHtml(data: LeaveEmailData): string {
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
          <span style="display:inline-block;background:linear-gradient(135deg,${BRAND_PRIMARY} 0%,${BRAND_PRIMARY_DARK} 100%);color:#ffffff;font-size:11px;font-weight:600;padding:6px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">Action Required</span>
        </div>
        <h2 style="color:#18181b;margin:0 0 15px 0;font-size:22px;text-align:center;font-weight:600;">Leave Request Submitted</h2>
        <p style="color:#52525b;margin:0 0 25px 0;line-height:1.6;text-align:center;font-size:15px;"><strong style="color:#18181b;">${data.employeeName}</strong> has submitted a leave request that requires your review.</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fafafa;border-radius:10px;border:1px solid #e5e7eb;margin-bottom:20px;">
          <tr><td style="padding:20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #e5e7eb;">Leave Type</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;font-weight:600;border-bottom:1px solid #e5e7eb;"><span style="background-color:${BRAND_PRIMARY}15;color:${BRAND_PRIMARY};padding:4px 10px;border-radius:4px;">${data.leaveType}</span></td></tr>
              <tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #e5e7eb;">Start Date</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;border-bottom:1px solid #e5e7eb;">${formatDate(data.startDate)}</td></tr>
              <tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #e5e7eb;">End Date</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;border-bottom:1px solid #e5e7eb;">${formatDate(data.endDate)}</td></tr>
              <tr><td style="padding:10px 0;color:#71717a;font-size:13px;">Total Duration</td><td style="padding:10px 0;color:${BRAND_PRIMARY};font-size:16px;text-align:right;font-weight:700;">${data.daysCount} day${data.daysCount !== 1 ? "s" : ""}</td></tr>
            </table>
          </td></tr>
        </table>
        ${data.reason ? `<div style="background-color:#f0f9ff;border-left:4px solid ${BRAND_PRIMARY};padding:15px 18px;margin-bottom:20px;border-radius:0 8px 8px 0;"><p style="color:#71717a;margin:0 0 5px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Reason</p><p style="color:#18181b;margin:0;font-size:14px;line-height:1.5;">${data.reason}</p></div>` : ""}
        <p style="color:#71717a;margin:0;font-size:13px;text-align:center;line-height:1.5;">Please log in to the HR portal to review and approve this request.</p>
      </td>
    </tr>
    ${generateEmailFooter(data)}
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
    ${generateEmailHeader(data, { from: "#22c55e", to: "#16a34a" })}
    <tr>
      <td style="background-color:#ffffff;padding:30px;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="display:inline-block;background-color:#dcfce7;border-radius:50%;width:70px;height:70px;line-height:70px;text-align:center;"><span style="font-size:32px;">✓</span></div>
        </div>
        <h2 style="color:#18181b;margin:0 0 10px 0;font-size:22px;text-align:center;font-weight:600;">Leave Request Approved</h2>
        <p style="color:#52525b;margin:0 0 25px 0;line-height:1.6;text-align:center;font-size:15px;">Hi <strong style="color:#18181b;">${data.employeeName}</strong>, great news! Your leave request has been approved${data.reviewerName ? ` by <strong style="color:#18181b;">${data.reviewerName}</strong>` : ""}.</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;margin-bottom:20px;">
          <tr><td style="padding:20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #bbf7d0;">Leave Type</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;font-weight:600;border-bottom:1px solid #bbf7d0;"><span style="background-color:#22c55e15;color:#16a34a;padding:4px 10px;border-radius:4px;">${data.leaveType}</span></td></tr>
              <tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #bbf7d0;">Start Date</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;border-bottom:1px solid #bbf7d0;">${formatDate(data.startDate)}</td></tr>
              <tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #bbf7d0;">End Date</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;border-bottom:1px solid #bbf7d0;">${formatDate(data.endDate)}</td></tr>
              <tr><td style="padding:10px 0;color:#71717a;font-size:13px;">Total Duration</td><td style="padding:10px 0;color:#16a34a;font-size:16px;text-align:right;font-weight:700;">${data.daysCount} day${data.daysCount !== 1 ? "s" : ""}</td></tr>
            </table>
          </td></tr>
        </table>
        <p style="color:#71717a;margin:0;font-size:13px;text-align:center;line-height:1.5;">Enjoy your time off! Don't forget to set your out-of-office message if needed.</p>
      </td>
    </tr>
    ${generateEmailFooter(data)}
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
    ${generateEmailHeader(data, { from: "#ef4444", to: "#dc2626" })}
    <tr>
      <td style="background-color:#ffffff;padding:30px;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="display:inline-block;background-color:#fee2e2;border-radius:50%;width:70px;height:70px;line-height:70px;text-align:center;"><span style="font-size:32px;">✗</span></div>
        </div>
        <h2 style="color:#18181b;margin:0 0 10px 0;font-size:22px;text-align:center;font-weight:600;">Leave Request Rejected</h2>
        <p style="color:#52525b;margin:0 0 25px 0;line-height:1.6;text-align:center;font-size:15px;">Hi <strong style="color:#18181b;">${data.employeeName}</strong>, unfortunately your leave request has been declined${data.reviewerName ? ` by <strong style="color:#18181b;">${data.reviewerName}</strong>` : ""}.</p>
        ${data.rejectionReason ? `<div style="background-color:#fef2f2;border-left:4px solid #ef4444;padding:15px 18px;margin-bottom:20px;border-radius:0 8px 8px 0;"><p style="color:#b91c1c;margin:0 0 5px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Rejection Reason</p><p style="color:#7f1d1d;margin:0;font-size:14px;line-height:1.5;">${data.rejectionReason}</p></div>` : ""}
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fafafa;border-radius:10px;border:1px solid #e5e7eb;margin-bottom:20px;">
          <tr><td style="padding:20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #e5e7eb;">Leave Type</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;font-weight:600;border-bottom:1px solid #e5e7eb;">${data.leaveType}</td></tr>
              <tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #e5e7eb;">Requested Dates</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;border-bottom:1px solid #e5e7eb;">${formatShortDate(data.startDate)} - ${formatShortDate(data.endDate)}</td></tr>
              <tr><td style="padding:10px 0;color:#71717a;font-size:13px;">Duration</td><td style="padding:10px 0;color:#71717a;font-size:14px;text-align:right;">${data.daysCount} day${data.daysCount !== 1 ? "s" : ""}</td></tr>
            </table>
          </td></tr>
        </table>
        <p style="color:#71717a;margin:0;font-size:13px;text-align:center;line-height:1.5;">If you have questions, please speak with your manager or HR department.</p>
      </td>
    </tr>
    ${generateEmailFooter(data)}
  </table>
</body>
</html>`;
}
