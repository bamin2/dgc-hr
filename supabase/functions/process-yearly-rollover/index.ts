import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RolloverResult {
  balancesCreated: number;
  carryoversApplied: number;
  errors: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the token and get the caller
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: caller },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if caller has HR or Admin role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .in("role", ["hr", "admin"])
      .limit(1)
      .maybeSingle();

    if (roleError) {
      return new Response(
        JSON.stringify({ error: "Failed to verify permissions" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden: HR or Admin role required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { fromYear } = await req.json();

    // Validate input
    if (
      typeof fromYear !== "number" ||
      fromYear < 2000 ||
      fromYear > 2100
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid fromYear parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const toYear = fromYear + 1;

    console.log(`Processing rollover from ${fromYear} to ${toYear} by user ${caller.id}`);

    const result: RolloverResult = {
      balancesCreated: 0,
      carryoversApplied: 0,
      errors: [],
    };

    // Fetch all leave types with their carryover settings
    const { data: leaveTypes, error: ltError } = await supabase
      .from("leave_types")
      .select("id, name, max_days_per_year, allow_carryover, max_carryover_days")
      .eq("is_active", true);

    if (ltError) throw ltError;

    console.log(`Found ${leaveTypes?.length || 0} active leave types`);

    // Fetch all balances for the fromYear
    const { data: currentBalances, error: balError } = await supabase
      .from("leave_balances")
      .select("*")
      .eq("year", fromYear);

    if (balError) throw balError;

    console.log(`Found ${currentBalances?.length || 0} balances for ${fromYear}`);

    // Check for existing balances in toYear
    const { data: existingNextYearBalances, error: existError } = await supabase
      .from("leave_balances")
      .select("employee_id, leave_type_id")
      .eq("year", toYear);

    if (existError) throw existError;

    const existingSet = new Set(
      existingNextYearBalances?.map(
        (b) => `${b.employee_id}-${b.leave_type_id}`
      ) || []
    );

    // Process each current balance
    const balancesToCreate: any[] = [];
    const adjustmentsToCreate: any[] = [];

    for (const balance of currentBalances || []) {
      const leaveType = leaveTypes?.find((lt) => lt.id === balance.leave_type_id);
      if (!leaveType) continue;

      const key = `${balance.employee_id}-${balance.leave_type_id}`;
      if (existingSet.has(key)) {
        console.log(`Skipping ${key} - already exists for ${toYear}`);
        continue;
      }

      // Calculate remaining days
      const remaining =
        (balance.total_days || 0) - (balance.used_days || 0);

      // Calculate carryover amount
      let carryover = 0;
      if (leaveType.allow_carryover && remaining > 0) {
        carryover = leaveType.max_carryover_days
          ? Math.min(remaining, leaveType.max_carryover_days)
          : remaining;
      }

      // Base allocation for next year
      const baseAllocation = leaveType.max_days_per_year || 0;
      const totalDays = baseAllocation + carryover;

      balancesToCreate.push({
        employee_id: balance.employee_id,
        leave_type_id: balance.leave_type_id,
        year: toYear,
        total_days: totalDays,
        used_days: 0,
        pending_days: 0,
      });

      // Create carryover adjustment record
      if (carryover > 0) {
        adjustmentsToCreate.push({
          leave_balance_id: balance.id, // Reference to the source balance
          employee_id: balance.employee_id,
          leave_type_id: balance.leave_type_id,
          adjustment_days: carryover,
          adjustment_type: "carryover",
          reason: `Carryover from ${fromYear} (${remaining} days remaining, ${carryover} days carried over)`,
        });
      }
    }

    // Insert new balances
    if (balancesToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("leave_balances")
        .insert(balancesToCreate);

      if (insertError) {
        result.errors.push(`Failed to create balances: ${insertError.message}`);
      } else {
        result.balancesCreated = balancesToCreate.length;
        console.log(`Created ${balancesToCreate.length} new balances`);
      }
    }

    // Insert carryover adjustments
    if (adjustmentsToCreate.length > 0) {
      const { error: adjError } = await supabase
        .from("leave_balance_adjustments")
        .insert(adjustmentsToCreate);

      if (adjError) {
        result.errors.push(`Failed to create adjustments: ${adjError.message}`);
      } else {
        result.carryoversApplied = adjustmentsToCreate.length;
        console.log(`Created ${adjustmentsToCreate.length} carryover adjustments`);
      }
    }

    console.log("Rollover complete:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Rollover error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
