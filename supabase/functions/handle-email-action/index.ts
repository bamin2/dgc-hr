import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://hr.dgcholding.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  type: "success" | "error" | "info" | "expired" | "rejected" | "reject-form",
  details?: RequestDetails,
  token?: string
): Response {
  const resultUrl = new URL(`${APP_BASE_URL}/email-action-result`);
  resultUrl.searchParams.set("title", title);
  resultUrl.searchParams.set("message", message);
  resultUrl.searchParams.set("type", type);
  resultUrl.searchParams.set("status", type);
  
  if (token) {
    resultUrl.searchParams.set("token", token);
  }
  
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

// Helper to fetch request details for display
async function fetchRequestDetails(supabase: SupabaseClient, requestType: string, requestId: string): Promise<RequestDetails> {
  if (requestType === "time_off") {
    const { data: detailsData } = await supabase
      .from("leave_requests")
      .select(`
        start_date, end_date, days_count,
        employees!inner(first_name, last_name),
        leave_types!inner(name)
      `)
      .eq("id", requestId)
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
      return {
        employeeName: `${emp.first_name} ${emp.last_name}`,
        leaveType: lt.name,
        startDate: d.start_date,
        endDate: d.end_date,
        daysCount: d.days_count,
      };
    }
  }
  return {};
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const action = url.searchParams.get("action");

    // Handle POST for rejection with reason (from frontend)
    if (req.method === "POST") {
      const body = await req.json();
      const rejectionToken = body.token as string;
      const rejectionReason = body.reason as string;

      if (!rejectionToken) {
        return new Response(JSON.stringify({ success: false, message: "Missing token" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!rejectionReason?.trim()) {
        return new Response(JSON.stringify({ success: false, message: "Please provide a reason for rejection." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return await processRejectionFromFrontend(supabase, rejectionToken, rejectionReason);
    }

    // Validate required params
    if (!token) {
      return redirectToResultPage("Invalid Link", "This link is invalid or missing required parameters.", "error");
    }

    if (!action || !["approve", "reject"].includes(action)) {
      return redirectToResultPage("Invalid Action", "The requested action is not valid.", "error");
    }

    // For reject action, redirect to frontend rejection form
    if (action === "reject") {
      // Fetch token details to get request info for display
      const { data: tokenData } = await supabase
        .from("email_action_tokens")
        .select("*")
        .eq("token", token)
        .single();

      if (!tokenData) {
        return redirectToResultPage("Invalid Link", "This link is invalid or has already been used.", "error");
      }

      const typedToken = tokenData as EmailActionToken;

      // Check expiry
      if (new Date(typedToken.expires_at) < new Date()) {
        return redirectToResultPage("Link Expired", "This approval link has expired. Please review the request in the app.", "expired");
      }

      // Check if already used
      if (typedToken.used_at) {
        return redirectToResultPage("Already Processed", "This request has already been processed.", "info");
      }

      // Fetch request details for the rejection form
      const details = await fetchRequestDetails(supabase, typedToken.request_type, typedToken.request_id);

      return redirectToResultPage(
        "Reject Leave Request",
        "Please provide a reason for rejection.",
        "reject-form",
        details,
        token
      );
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
    // Reject action - This path is now only used internally
    return redirectToResultPage("Error", "Use the rejection form to reject requests.", "error");
  }
}

// Process rejection submitted from the frontend
async function processRejectionFromFrontend(
  supabase: SupabaseClient,
  token: string,
  rejectionReason: string
): Promise<Response> {
  // 1. Validate token
  const { data: tokenData, error: tokenError } = await supabase
    .from("email_action_tokens")
    .select("*")
    .eq("token", token)
    .single();

  if (tokenError || !tokenData) {
    return new Response(JSON.stringify({ success: false, message: "This link is invalid or has already been used." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const typedToken = tokenData as EmailActionToken;

  // 2. Check if token has expired
  if (new Date(typedToken.expires_at) < new Date()) {
    return new Response(JSON.stringify({ success: false, message: "This approval link has expired. Please review the request in the app." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 3. Check if token has already been used
  if (typedToken.used_at) {
    return new Response(JSON.stringify({ success: false, message: "This request has already been processed." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 4. Verify the approval step is still pending
  const { data: stepData, error: stepError } = await supabase
    .from("request_approval_steps")
    .select("id, status, step_number, request_id, request_type")
    .eq("id", typedToken.step_id)
    .single();

  if (stepError || !stepData) {
    return new Response(JSON.stringify({ success: false, message: "The approval step could not be found." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const step = stepData as ApprovalStep;

  if (step.status !== "pending") {
    // Mark token as used anyway
    await supabase
      .from("email_action_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", typedToken.id);

    return new Response(JSON.stringify({ success: false, message: `This request has already been ${step.status}.` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 5. Process the rejection
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
    return new Response(JSON.stringify({ success: false, message: "Failed to process rejection. Please try again or use the app." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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

  console.log(`Rejection processed successfully for request ${step.request_id}`);

  return new Response(JSON.stringify({ success: true, message: "Request rejected successfully." }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
