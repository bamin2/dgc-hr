import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import PizZip from "npm:pizzip@3.2.0";
import Docxtemplater from "npm:docxtemplater@3.67.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PreviewPayslipRequest {
  template_id: string;
  payroll_run_id: string;
  employee_id: string;
}

// Format currency with proper decimal places
function formatCurrency(amount: number | string | null | undefined, currency: string): string {
  const value = Number(amount) || 0;
  return `${currency} ${value.toFixed(2)}`;
}

// Sum amounts from array fields (other_allowances, other_deductions)
function sumArrayField(items: Array<{amount: number; name?: string}> | null | undefined): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

// Format date as readable string
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatMonthYear(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Custom angular expression parser for docxtemplater
function angularParser(tag: string) {
  tag = tag.replace(/^\s+|\s+$/g, "");
  return {
    get: function (scope: Record<string, string>) {
      if (tag === ".") {
        return scope;
      }
      return scope[tag] ?? "";
    },
  };
}

// Process DOCX template with smart tags
async function processDocxTemplate(
  templateBuffer: ArrayBuffer,
  tagData: Record<string, string>
): Promise<Uint8Array> {
  const zip = new PizZip(templateBuffer);
  
  try {
    const doc = new Docxtemplater(zip, {
      delimiters: { start: '{{', end: '}}' },
      paragraphLoop: true,
      linebreaks: true,
      parser: angularParser,
    });
    
    doc.render(tagData);
    
    const output = doc.getZip().generate({
      type: "uint8array",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    
    return output;
  } catch (error: any) {
    if (error.properties && error.properties.errors) {
      const errorDetails = error.properties.errors.map((e: any) => ({
        message: e.message,
        id: e.properties?.id,
        explanation: e.properties?.explanation,
      }));
      console.error("Template errors:", JSON.stringify(errorDetails, null, 2));
      throw new Error(`Template error: ${errorDetails[0]?.message || 'Unknown error'}`);
    }
    throw error;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify the caller's JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if caller has HR or Admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["hr", "admin"])
      .limit(1)
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden: HR or Admin role required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { template_id, payroll_run_id, employee_id }: PreviewPayslipRequest = await req.json();

    if (!template_id || !payroll_run_id || !employee_id) {
      return new Response(
        JSON.stringify({ error: "template_id, payroll_run_id, and employee_id are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get template
    const { data: template, error: templateError } = await supabaseClient
      .from("payslip_templates")
      .select("*")
      .eq("id", template_id)
      .single();

    if (templateError || !template) {
      return new Response(
        JSON.stringify({ error: "Template not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!template.docx_storage_path) {
      return new Response(
        JSON.stringify({ error: "Template does not have a DOCX file uploaded" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get payroll run details
    const { data: payrollRun, error: runError } = await supabaseClient
      .from("payroll_runs")
      .select("*, work_location:work_locations(*)")
      .eq("id", payroll_run_id)
      .single();

    if (runError || !payrollRun) {
      return new Response(
        JSON.stringify({ error: "Payroll run not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get employee payroll data
    const { data: payrollEmployee, error: empError } = await supabaseClient
      .from("payroll_run_employees")
      .select(`
        *,
        employee:employees(
          id, first_name, last_name, employee_code, email, join_date, gosi_registered_salary,
          department:departments!employees_department_id_fkey(name),
          position:positions(title)
        )
      `)
      .eq("payroll_run_id", payroll_run_id)
      .eq("employee_id", employee_id)
      .single();

    if (empError || !payrollEmployee) {
      return new Response(
        JSON.stringify({ error: "Employee payroll data not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Download the DOCX template from storage
    const { data: templateFile, error: downloadError } = await supabaseClient.storage
      .from("payslip-templates")
      .download(template.docx_storage_path);

    if (downloadError || !templateFile) {
      return new Response(
        JSON.stringify({ error: `Failed to download template: ${downloadError?.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const templateBuffer = await templateFile.arrayBuffer();
    console.log(`Template downloaded, size: ${templateBuffer.byteLength} bytes`);

    // Get company settings
    const { data: companySettings } = await supabaseClient
      .from("company_settings")
      .select("*")
      .single();

    const emp = payrollEmployee.employee;
    const employeeName = `${emp.first_name} ${emp.last_name}`;
    const periodStart = payrollRun.pay_period_start;
    const periodEnd = payrollRun.pay_period_end;
    const currencyCode = payrollRun.work_location?.currency || "BHD";

    // Build tag data for template replacement
    const tagData: Record<string, string> = {
      // Employee info
      EMPLOYEE_FULL_NAME: employeeName,
      EMPLOYEE_FIRST_NAME: emp.first_name || '',
      EMPLOYEE_LAST_NAME: emp.last_name || '',
      EMPLOYEE_CODE: emp.employee_code || '',
      EMPLOYEE_EMAIL: emp.email || '',
      DEPARTMENT: emp.department?.name || '',
      POSITION: emp.position?.title || '',
      START_DATE: emp.join_date ? formatDate(emp.join_date) : '',
      JOIN_DATE: emp.join_date ? formatDate(emp.join_date) : '',
      GOSI_REGISTERED_SALARY: formatCurrency(emp.gosi_registered_salary, currencyCode),
      
      // Company info
      COMPANY_NAME: companySettings?.name || '',
      COMPANY_LEGAL_NAME: companySettings?.legal_name || companySettings?.name || '',
      COMPANY_ADDRESS: [
        companySettings?.address_street,
        companySettings?.address_city,
        companySettings?.address_state,
        companySettings?.address_country
      ].filter(Boolean).join(', ') || '',
      
      // Pay period
      PAY_PERIOD_START: formatDate(periodStart),
      PAY_PERIOD_END: formatDate(periodEnd),
      PAY_PERIOD: `${formatDate(periodStart)} - ${formatDate(periodEnd)}`,
      PAY_MONTH_YEAR: formatMonthYear(periodStart),
      
      // Earnings
      BASE_SALARY: formatCurrency(payrollEmployee.base_salary, currencyCode),
      HOUSING_ALLOWANCE: formatCurrency(payrollEmployee.housing_allowance, currencyCode),
      TRANSPORTATION_ALLOWANCE: formatCurrency(payrollEmployee.transportation_allowance, currencyCode),
      OTHER_ALLOWANCES: formatCurrency(sumArrayField(payrollEmployee.other_allowances), currencyCode),
      GROSS_PAY: formatCurrency(payrollEmployee.gross_pay, currencyCode),
      TOTAL_EARNINGS: formatCurrency(payrollEmployee.gross_pay, currencyCode),
      
      // Deductions
      GOSI_DEDUCTION: formatCurrency(payrollEmployee.gosi_deduction, currencyCode),
      OTHER_DEDUCTIONS: formatCurrency(sumArrayField(payrollEmployee.other_deductions), currencyCode),
      LOAN_DEDUCTION: formatCurrency(payrollEmployee.loan_deduction ?? 0, currencyCode),
      TOTAL_DEDUCTIONS: formatCurrency(payrollEmployee.total_deductions, currencyCode),
      
      // Net pay
      NET_PAY: formatCurrency(payrollEmployee.net_pay, currencyCode),
      
      // Currency
      CURRENCY: currencyCode,
      
      // Metadata
      GENERATED_DATE: formatDate(new Date().toISOString()),
      PAYSLIP_ID: payrollEmployee.id || '',
    };

    console.log(`Processing preview for ${employeeName}...`);

    // Process DOCX template with tag data
    const filledDocx = await processDocxTemplate(templateBuffer, tagData);
    console.log(`Template filled, size: ${filledDocx.byteLength} bytes`);

    // Generate filename
    const monthYear = formatMonthYear(periodStart).replace(' ', '_');
    const filename = `preview_${monthYear}_${emp.employee_code || emp.first_name}.docx`;

    // Return the filled DOCX as a downloadable file
    return new Response(new Uint8Array(filledDocx).buffer as ArrayBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating preview:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate preview" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
