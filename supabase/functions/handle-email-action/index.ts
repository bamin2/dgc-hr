import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// DGC Brand Colors
const DGC_DEEP_GREEN = "#0F2A28";
const DGC_GOLD = "#C6A45E";
const DGC_OFF_WHITE = "#F7F7F5";

// Type definitions
interface EmailActionToken {
  id: string;
  token: string;
  action_type: string;
  request_id: string;
  request_type: string;
  step_id: string;
  user_id: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

interface ApprovalStep {
  id: string;
  status: string;
  step_number: number;
  request_id: string;
  request_type: string;
}

interface LeaveRequest {
  employee_id: string;
  leave_type_id: string;
  days_count: number;
}

interface LeaveBalance {
  id: string;
  pending_days: number;
}

serve(async (req: Request): Promise<Response> => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const action = url.searchParams.get("action");

    // Handle POST for rejection with reason
    if (req.method === "POST") {
      const formData = await req.formData();
      const rejectionToken = formData.get("token") as string;
      const rejectionReason = formData.get("reason") as string;

      if (!rejectionToken) {
        return generateHtmlResponse("Error", "Missing token", "error");
      }

      const result = await processAction(supabase, rejectionToken, "reject", rejectionReason);
      return result;
    }

    // Validate required params
    if (!token) {
      return generateHtmlResponse("Invalid Link", "This link is invalid or missing required parameters.", "error");
    }

    if (!action || !["approve", "reject"].includes(action)) {
      return generateHtmlResponse("Invalid Action", "The requested action is not valid.", "error");
    }

    // For reject action, show the rejection form
    if (action === "reject") {
      return generateRejectionForm(token);
    }

    // For approve action, process immediately
    return await processAction(supabase, token, "approve");

  } catch (error) {
    console.error("Error in handle-email-action:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return generateHtmlResponse("Error", message, "error");
  }
});

async function processAction(
  supabase: SupabaseClient,
  token: string,
  action: "approve" | "reject",
  rejectionReason?: string
): Promise<Response> {
  // 1. Validate token
  const { data: tokenData, error: tokenError } = await supabase
    .from("email_action_tokens")
    .select("*")
    .eq("token", token)
    .single();

  if (tokenError || !tokenData) {
    return generateHtmlResponse("Invalid Link", "This link is invalid or has already been used.", "error");
  }

  const typedToken = tokenData as EmailActionToken;

  // 2. Check if token has expired
  if (new Date(typedToken.expires_at) < new Date()) {
    return generateHtmlResponse(
      "Link Expired",
      "This approval link has expired. Please review the request in the app.",
      "expired",
      "/approvals"
    );
  }

  // 3. Check if token has already been used
  if (typedToken.used_at) {
    return generateHtmlResponse(
      "Already Processed",
      "This request has already been processed.",
      "info",
      "/approvals"
    );
  }

  // 4. Verify the approval step is still pending
  const { data: stepData, error: stepError } = await supabase
    .from("request_approval_steps")
    .select("id, status, step_number, request_id, request_type")
    .eq("id", typedToken.step_id)
    .single();

  if (stepError || !stepData) {
    return generateHtmlResponse("Error", "The approval step could not be found.", "error");
  }

  const step = stepData as ApprovalStep;

  if (step.status !== "pending") {
    // Mark token as used anyway
    await supabase
      .from("email_action_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", typedToken.id);

    return generateHtmlResponse(
      "Already Processed",
      `This request has already been ${step.status}.`,
      "info",
      "/approvals"
    );
  }

  if (stepError || !step) {
    return generateHtmlResponse("Error", "The approval step could not be found.", "error");
  }

  if (step.status !== "pending") {
    // Mark token as used anyway
    await supabase
      .from("email_action_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenData.id);

    return generateHtmlResponse(
      "Already Processed",
      `This request has already been ${step.status}.`,
      "info",
      "/approvals"
    );
  }

  // 5. Process the action
  if (action === "approve") {
    // Update the current step to approved
    const { error: stepUpdateError } = await supabase
      .from("request_approval_steps")
      .update({
        status: "approved",
        acted_at: new Date().toISOString(),
        acted_by: typedToken.user_id,
      })
      .eq("id", step.id);

    if (stepUpdateError) {
      console.error("Failed to update approval step:", stepUpdateError);
      return generateHtmlResponse("Error", "Failed to process approval. Please try again or use the app.", "error", "/approvals");
    }

    // Check if there are more steps
    const { data: nextStepData } = await supabase
      .from("request_approval_steps")
      .select("id")
      .eq("request_id", step.request_id)
      .eq("request_type", step.request_type)
      .eq("status", "queued")
      .order("step_number", { ascending: true })
      .limit(1)
      .single();

    if (nextStepData) {
      // Activate the next step
      await supabase
        .from("request_approval_steps")
        .update({ status: "pending" })
        .eq("id", (nextStepData as { id: string }).id);
    } else {
      // No more steps - approve the request
      if (step.request_type === "time_off") {
        // Get leave request details for balance update
        const { data: leaveRequestData } = await supabase
          .from("leave_requests")
          .select("employee_id, leave_type_id, days_count")
          .eq("id", step.request_id)
          .single();

        if (leaveRequestData) {
          const leaveRequest = leaveRequestData as LeaveRequest;

          // Update leave request status
          await supabase
            .from("leave_requests")
            .update({
              status: "approved",
              reviewed_at: new Date().toISOString(),
            })
            .eq("id", step.request_id);

          // Update leave balance
          const currentYear = new Date().getFullYear();
          await supabase.rpc("update_leave_balance_on_approval", {
            p_employee_id: leaveRequest.employee_id,
            p_leave_type_id: leaveRequest.leave_type_id,
            p_days: leaveRequest.days_count,
            p_year: currentYear,
          });

          // Send approval notification email
          await supabase.functions.invoke("send-email", {
            body: {
              type: "leave_request_approved",
              leaveRequestId: step.request_id,
            },
          });
        }
      }
    }

    // 6. Mark token as used
    await supabase
      .from("email_action_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", typedToken.id);

    // Also mark the reject token for the same step as used
    await supabase
      .from("email_action_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("step_id", step.id)
      .eq("action_type", "reject")
      .is("used_at", null);

    // Fetch request details for the response page
    let requestDetails: RequestDetails = {};
    if (step.request_type === "time_off") {
      const { data: detailsData } = await supabase
        .from("leave_requests")
        .select(`
          start_date, end_date, days_count,
          employees!inner(first_name, last_name),
          leave_types!inner(name)
        `)
        .eq("id", step.request_id)
        .single();

      if (detailsData) {
        const d = detailsData as unknown as {
          start_date: string;
          end_date: string;
          days_count: number;
          employees: { first_name: string; last_name: string };
          leave_types: { name: string };
        };
        const emp = Array.isArray(d.employees) ? d.employees[0] : d.employees;
        const lt = Array.isArray(d.leave_types) ? d.leave_types[0] : d.leave_types;
        requestDetails = {
          employeeName: `${emp.first_name} ${emp.last_name}`,
          leaveType: lt.name,
          startDate: new Date(d.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          endDate: new Date(d.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          daysCount: d.days_count,
        };
      }
    }

    return generateHtmlResponse(
      "Request Approved",
      "The leave request has been approved successfully.",
      "success",
      "/approvals",
      requestDetails
    );

  } else {
    // Reject action
    if (!rejectionReason?.trim()) {
      return generateRejectionForm(token, "Please provide a reason for rejection.");
    }

    // Update the current step to rejected
    const { error: rejectStepError } = await supabase
      .from("request_approval_steps")
      .update({
        status: "rejected",
        acted_at: new Date().toISOString(),
        acted_by: typedToken.user_id,
        comment: rejectionReason,
      })
      .eq("id", step.id);

    if (rejectStepError) {
      console.error("Failed to update rejection step:", rejectStepError);
      return generateHtmlResponse("Error", "Failed to process rejection. Please try again or use the app.", "error", "/approvals");
    }

    // Cancel any queued steps
    await supabase
      .from("request_approval_steps")
      .update({ status: "cancelled" })
      .eq("request_id", step.request_id)
      .eq("request_type", step.request_type)
      .eq("status", "queued");

    // Update the leave request
    if (step.request_type === "time_off") {
      const { data: leaveRequestData } = await supabase
        .from("leave_requests")
        .select("employee_id, leave_type_id, days_count")
        .eq("id", step.request_id)
        .single();

      await supabase
        .from("leave_requests")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", step.request_id);

      if (leaveRequestData) {
        const leaveRequest = leaveRequestData as LeaveRequest;

        // Restore pending days to balance
        const currentYear = new Date().getFullYear();
        const { data: balanceData } = await supabase
          .from("leave_balances")
          .select("id, pending_days")
          .eq("employee_id", leaveRequest.employee_id)
          .eq("leave_type_id", leaveRequest.leave_type_id)
          .eq("year", currentYear)
          .single();

        if (balanceData) {
          const balance = balanceData as LeaveBalance;
          await supabase
            .from("leave_balances")
            .update({
              pending_days: Math.max(0, (balance.pending_days || 0) - leaveRequest.days_count),
            })
            .eq("id", balance.id);
        }

        // Send rejection notification email
        await supabase.functions.invoke("send-email", {
          body: {
            type: "leave_request_rejected",
            leaveRequestId: step.request_id,
          },
        });
      }
    }

    // 6. Mark token as used
    await supabase
      .from("email_action_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", typedToken.id);

    // Also mark the approve token for the same step as used
    await supabase
      .from("email_action_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("step_id", step.id)
      .eq("action_type", "approve")
      .is("used_at", null);

    // Fetch request details for the response page
    let rejectRequestDetails: RequestDetails = { rejectionReason };
    if (step.request_type === "time_off") {
      const { data: detailsData } = await supabase
        .from("leave_requests")
        .select(`
          start_date, end_date, days_count,
          employees!inner(first_name, last_name),
          leave_types!inner(name)
        `)
        .eq("id", step.request_id)
        .single();

      if (detailsData) {
        const d = detailsData as unknown as {
          start_date: string;
          end_date: string;
          days_count: number;
          employees: { first_name: string; last_name: string };
          leave_types: { name: string };
        };
        const emp = Array.isArray(d.employees) ? d.employees[0] : d.employees;
        const lt = Array.isArray(d.leave_types) ? d.leave_types[0] : d.leave_types;
        rejectRequestDetails = {
          ...rejectRequestDetails,
          employeeName: `${emp.first_name} ${emp.last_name}`,
          leaveType: lt.name,
          startDate: new Date(d.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          endDate: new Date(d.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          daysCount: d.days_count,
        };
      }
    }

    return generateHtmlResponse(
      "Request Rejected",
      "The leave request has been rejected.",
      "rejected",
      "/approvals",
      rejectRequestDetails
    );
  }
}

function generateRejectionForm(token: string, errorMessage?: string): Response {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reject Leave Request</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, ${DGC_OFF_WHITE} 0%, #e8e8e4 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      max-width: 480px;
      width: 100%;
      padding: 40px;
    }
    .icon {
      width: 64px;
      height: 64px;
      background: #fef2f2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 28px;
    }
    h1 {
      color: #18181b;
      font-size: 24px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 8px;
    }
    p {
      color: #71717a;
      text-align: center;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 14px;
    }
    label {
      display: block;
      color: #374151;
      font-weight: 500;
      margin-bottom: 8px;
      font-size: 14px;
    }
    textarea {
      width: 100%;
      min-height: 120px;
      padding: 12px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      margin-bottom: 24px;
    }
    textarea:focus {
      outline: none;
      border-color: ${DGC_GOLD};
      box-shadow: 0 0 0 3px ${DGC_GOLD}20;
    }
    button {
      width: 100%;
      background: #ef4444;
      color: white;
      border: none;
      padding: 14px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover {
      background: #dc2626;
    }
    .cancel {
      display: block;
      text-align: center;
      color: #71717a;
      text-decoration: none;
      margin-top: 16px;
      font-size: 14px;
    }
    .cancel:hover {
      color: #18181b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✗</div>
    <h1>Reject Leave Request</h1>
    <p>Please provide a reason for rejecting this request. The employee will be notified with this explanation.</p>
    ${errorMessage ? `<div class="error">${errorMessage}</div>` : ""}
    <form method="POST">
      <input type="hidden" name="token" value="${token}" />
      <label for="reason">Rejection Reason</label>
      <textarea id="reason" name="reason" placeholder="Enter the reason for rejection..." required></textarea>
      <button type="submit">Reject Request</button>
    </form>
    <a href="/approvals" class="cancel">Cancel and review in app</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}

interface RequestDetails {
  employeeName?: string;
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  daysCount?: number;
  rejectionReason?: string;
}

function generateHtmlResponse(
  title: string,
  message: string,
  type: "success" | "error" | "info" | "expired" | "rejected",
  appUrl?: string,
  details?: RequestDetails
): Response {
  // SVG icons for cross-browser compatibility
  const icons = {
    success: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
    error: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>`,
    info: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>`,
    expired: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    rejected: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6m0-6l6 6"/></svg>`,
  };

  const colors = {
    success: { iconBg: "#dcfce7" },
    error: { iconBg: "#fee2e2" },
    info: { iconBg: "#dbeafe" },
    expired: { iconBg: "#fef3c7" },
    rejected: { iconBg: "#fee2e2" },
  };

  const c = colors[type];
  const icon = icons[type];

  // Build details card HTML if details are provided
  let detailsHtml = "";
  if (details && (details.employeeName || details.leaveType || details.startDate)) {
    detailsHtml = `
    <div class="details-card">
      ${details.employeeName ? `<div class="detail-row"><span class="detail-label">Employee</span><span class="detail-value">${details.employeeName}</span></div>` : ""}
      ${details.leaveType ? `<div class="detail-row"><span class="detail-label">Leave Type</span><span class="detail-value">${details.leaveType}</span></div>` : ""}
      ${details.startDate && details.endDate ? `<div class="detail-row"><span class="detail-label">Dates</span><span class="detail-value">${details.startDate} - ${details.endDate}</span></div>` : ""}
      ${details.daysCount ? `<div class="detail-row"><span class="detail-label">Duration</span><span class="detail-value">${details.daysCount} day${details.daysCount > 1 ? "s" : ""}</span></div>` : ""}
      ${details.rejectionReason ? `<div class="detail-row rejection-reason"><span class="detail-label">Reason</span><span class="detail-value">${details.rejectionReason}</span></div>` : ""}
    </div>`;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, ${DGC_OFF_WHITE} 0%, #e8e8e4 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card-wrapper {
      max-width: 480px;
      width: 100%;
    }
    .header {
      background: ${DGC_DEEP_GREEN};
      padding: 20px 24px;
      border-radius: 16px 16px 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .header-logo {
      color: ${DGC_GOLD};
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 2px;
    }
    .container {
      background: white;
      border-radius: 0 0 16px 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      padding: 40px;
      text-align: center;
    }
    .icon {
      width: 80px;
      height: 80px;
      background: ${c.iconBg};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    h1 {
      color: #18181b;
      font-size: 26px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .message {
      color: #71717a;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .details-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 28px;
      text-align: left;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #6b7280;
      font-size: 13px;
      font-weight: 500;
    }
    .detail-value {
      color: #111827;
      font-size: 14px;
      font-weight: 600;
    }
    .rejection-reason .detail-value {
      color: #dc2626;
    }
    .notification-note {
      color: #6b7280;
      font-size: 13px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .notification-note svg {
      flex-shrink: 0;
    }
    .btn {
      display: inline-block;
      background: ${DGC_GOLD};
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.2s;
    }
    .btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  </style>
</head>
<body>
  <div class="card-wrapper">
    <div class="header">
      <div class="header-logo">DGC</div>
    </div>
    <div class="container">
      <div class="icon">${icon}</div>
      <h1>${title}</h1>
      <p class="message">${message}</p>
      ${detailsHtml}
      ${type === "success" || type === "rejected" ? `
      <div class="notification-note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        The employee has been notified
      </div>` : ""}
      ${appUrl ? `<a href="${appUrl}" class="btn">Open Dashboard</a>` : ""}
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
