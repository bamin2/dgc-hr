import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://hr.dgcholding.com";

// DGC Brand Colors (for rejection form)
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

interface RequestDetails {
  employeeName?: string;
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  daysCount?: number;
  rejectionReason?: string;
}

// Helper function to redirect to the frontend result page
function redirectToResultPage(
  title: string,
  message: string,
  type: "success" | "error" | "info" | "expired" | "rejected",
  details?: RequestDetails
): Response {
  const resultUrl = new URL(`${APP_BASE_URL}/email-action-result`);
  resultUrl.searchParams.set("title", title);
  resultUrl.searchParams.set("message", message);
  resultUrl.searchParams.set("type", type);
  resultUrl.searchParams.set("status", type);
  
  if (details) {
    if (details.employeeName) resultUrl.searchParams.set("employeeName", details.employeeName);
    if (details.leaveType) resultUrl.searchParams.set("leaveType", details.leaveType);
    if (details.startDate) resultUrl.searchParams.set("startDate", details.startDate);
    if (details.endDate) resultUrl.searchParams.set("endDate", details.endDate);
    if (details.daysCount) resultUrl.searchParams.set("daysCount", String(details.daysCount));
    if (details.rejectionReason) resultUrl.searchParams.set("rejectionReason", details.rejectionReason);
  }

  console.log(`Redirecting to: ${resultUrl.toString()}`);
  
  return new Response(null, {
    status: 302,
    headers: {
      Location: resultUrl.toString(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
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
        return redirectToResultPage("Error", "Missing token", "error");
      }

      return await processAction(supabase, rejectionToken, "reject", rejectionReason);
    }

    // Validate required params
    if (!token) {
      return redirectToResultPage("Invalid Link", "This link is invalid or missing required parameters.", "error");
    }

    if (!action || !["approve", "reject"].includes(action)) {
      return redirectToResultPage("Invalid Action", "The requested action is not valid.", "error");
    }

    // For reject action, show the rejection form (kept as HTML since it needs to POST)
    if (action === "reject") {
      return generateRejectionForm(token);
    }

    // For approve action, process immediately
    return await processAction(supabase, token, "approve");

  } catch (error) {
    console.error("Error in handle-email-action:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return redirectToResultPage("Error", message, "error");
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
    return redirectToResultPage("Invalid Link", "This link is invalid or has already been used.", "error");
  }

  const typedToken = tokenData as EmailActionToken;

  // 2. Check if token has expired
  if (new Date(typedToken.expires_at) < new Date()) {
    return redirectToResultPage(
      "Link Expired",
      "This approval link has expired. Please review the request in the app.",
      "expired"
    );
  }

  // 3. Check if token has already been used
  if (typedToken.used_at) {
    return redirectToResultPage(
      "Already Processed",
      "This request has already been processed.",
      "info"
    );
  }

  // 4. Verify the approval step is still pending
  const { data: stepData, error: stepError } = await supabase
    .from("request_approval_steps")
    .select("id, status, step_number, request_id, request_type")
    .eq("id", typedToken.step_id)
    .single();

  if (stepError || !stepData) {
    return redirectToResultPage("Error", "The approval step could not be found.", "error");
  }

  const step = stepData as ApprovalStep;

  if (step.status !== "pending") {
    // Mark token as used anyway
    await supabase
      .from("email_action_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", typedToken.id);

    return redirectToResultPage(
      "Already Processed",
      `This request has already been ${step.status}.`,
      "info"
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
      return redirectToResultPage("Error", "Failed to process approval. Please try again or use the app.", "error");
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
          startDate: d.start_date,
          endDate: d.end_date,
          daysCount: d.days_count,
        };
      }
    }

    return redirectToResultPage(
      "Request Approved",
      "The leave request has been approved successfully.",
      "success",
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
      return redirectToResultPage("Error", "Failed to process rejection. Please try again or use the app.", "error");
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
          startDate: d.start_date,
          endDate: d.end_date,
          daysCount: d.days_count,
        };
      }
    }

    return redirectToResultPage(
      "Request Rejected",
      "The leave request has been rejected.",
      "rejected",
      rejectRequestDetails
    );
  }
}

// Rejection form is kept as HTML since it needs to POST back to the edge function
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
      background: #fff;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(15, 42, 40, 0.12);
      max-width: 440px;
      width: 100%;
      border-top: 4px solid ${DGC_DEEP_GREEN};
    }
    .icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #fee2e2;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 28px;
      color: #dc2626;
    }
    h1 {
      color: ${DGC_DEEP_GREEN};
      font-size: 24px;
      text-align: center;
      margin-bottom: 12px;
    }
    p {
      color: #52525b;
      text-align: center;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    label {
      display: block;
      color: ${DGC_DEEP_GREEN};
      font-weight: 500;
      margin-bottom: 8px;
    }
    textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #d4d4d8;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      min-height: 100px;
      margin-bottom: 20px;
    }
    textarea:focus {
      outline: none;
      border-color: ${DGC_GOLD};
      box-shadow: 0 0 0 3px ${DGC_GOLD}33;
    }
    button {
      width: 100%;
      padding: 14px;
      background: #dc2626;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover {
      background: #b91c1c;
    }
    .error {
      background: #fee2e2;
      color: #dc2626;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
      font-size: 14px;
    }
    .cancel {
      display: block;
      text-align: center;
      margin-top: 16px;
      color: #71717a;
      text-decoration: none;
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
    <a href="${APP_BASE_URL}/approvals" class="cancel">Cancel and review in app</a>
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
