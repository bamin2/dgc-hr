import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GeneratePayslipsRequest {
  payroll_run_id: string;
  employee_ids?: string[]; // Optional: specific employees, if not provided generate for all
  template_id?: string; // Optional: specific template, if not provided use default
}

interface PayslipGenerationResult {
  employee_id: string;
  employee_name: string;
  success: boolean;
  pdf_storage_path?: string;
  payslip_document_id?: string;
  error?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { payroll_run_id, employee_ids, template_id }: GeneratePayslipsRequest = await req.json();

    if (!payroll_run_id) {
      return new Response(
        JSON.stringify({ error: "payroll_run_id is required" }),
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

    // Get employees in this payroll run
    let employeesQuery = supabaseClient
      .from("payroll_run_employees")
      .select(`
        *,
        employee:employees(
          id, first_name, last_name, employee_code, email,
          department:departments!employees_department_id_fkey(name),
          position:positions(title),
          work_location_id
        )
      `)
      .eq("payroll_run_id", payroll_run_id);

    if (employee_ids && employee_ids.length > 0) {
      employeesQuery = employeesQuery.in("employee_id", employee_ids);
    }

    const { data: payrollEmployees, error: empError } = await employeesQuery;

    if (empError) {
      console.error("Error fetching employees:", empError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch payroll employees" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get template
    let selectedTemplate;
    if (template_id) {
      const { data } = await supabaseClient
        .from("payslip_templates")
        .select("*")
        .eq("id", template_id)
        .eq("status", "active")
        .single();
      selectedTemplate = data;
    } else {
      // Try to find default template for the location first
      const { data: locationTemplate } = await supabaseClient
        .from("payslip_templates")
        .select("*")
        .eq("status", "active")
        .eq("is_default", true)
        .eq("work_location_id", payrollRun.work_location_id)
        .single();

      if (locationTemplate) {
        selectedTemplate = locationTemplate;
      } else {
        // Fall back to global default
        const { data: globalTemplate } = await supabaseClient
          .from("payslip_templates")
          .select("*")
          .eq("status", "active")
          .eq("is_default", true)
          .is("work_location_id", null)
          .single();
        selectedTemplate = globalTemplate;
      }
    }

    if (!selectedTemplate) {
      return new Response(
        JSON.stringify({ error: "No active payslip template found" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get company settings
    const { data: companySettings } = await supabaseClient
      .from("company_settings")
      .select("*")
      .single();

    const results: PayslipGenerationResult[] = [];
    const periodStart = payrollRun.pay_period_start;
    const periodEnd = payrollRun.pay_period_end;
    const currencyCode = payrollRun.work_location?.currency || "BHD";

    // Process each employee
    for (const payrollEmployee of payrollEmployees || []) {
      const emp = payrollEmployee.employee;
      const employeeName = `${emp.first_name} ${emp.last_name}`;
      
      try {
        // Generate simple PDF placeholder
        // In production, this would use DOCX template processing
        const pdfContent = generateSimplePDF({
          employee: emp,
          payrollData: {
            base_salary: payrollEmployee.base_salary,
            housing_allowance: payrollEmployee.housing_allowance || 0,
            transportation_allowance: payrollEmployee.transportation_allowance || 0,
            gross_pay: payrollEmployee.gross_pay,
            gosi_deduction: payrollEmployee.gosi_deduction || 0,
            total_deductions: payrollEmployee.total_deductions,
            net_pay: payrollEmployee.net_pay,
          },
          periodStart,
          periodEnd,
          company: companySettings,
          currency: currencyCode,
        });

        // Generate storage path
        const year = new Date(periodStart).getFullYear();
        const month = String(new Date(periodStart).getMonth() + 1).padStart(2, "0");
        const employeeCode = emp.employee_code || emp.id.substring(0, 8);
        const storagePath = `${year}/${month}/${employeeCode}_${periodStart}_${periodEnd}.pdf`;

        // Upload to storage
        const { error: uploadError } = await supabaseClient.storage
          .from("payslips")
          .upload(storagePath, pdfContent, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Check if document already exists
        const { data: existingDoc } = await supabaseClient
          .from("payslip_documents")
          .select("id")
          .eq("payroll_run_id", payroll_run_id)
          .eq("employee_id", emp.id)
          .eq("status", "generated")
          .single();

        let payslipDocId: string;

        if (existingDoc) {
          // Update existing
          const { data: updated, error: updateError } = await supabaseClient
            .from("payslip_documents")
            .update({
              template_id: selectedTemplate.id,
              pdf_storage_path: storagePath,
              generated_at: new Date().toISOString(),
              currency_code: currencyCode,
            })
            .eq("id", existingDoc.id)
            .select("id")
            .single();

          if (updateError) throw updateError;
          payslipDocId = updated.id;
        } else {
          // Create new
          const { data: created, error: createError } = await supabaseClient
            .from("payslip_documents")
            .insert({
              payroll_run_id,
              employee_id: emp.id,
              template_id: selectedTemplate.id,
              period_start: periodStart,
              period_end: periodEnd,
              currency_code: currencyCode,
              pdf_storage_path: storagePath,
              status: "generated",
              metadata: {
                template_name: selectedTemplate.name,
                template_version: selectedTemplate.version_number,
              },
            })
            .select("id")
            .single();

          if (createError) throw createError;
          payslipDocId = created.id;
        }

        // Create notification for employee
        if (emp.user_id) {
          await supabaseClient.from("notifications").insert({
            user_id: emp.user_id,
            type: "payroll",
            title: "Payslip Available",
            message: `Your payslip for ${formatMonthYear(periodStart)} is now available.`,
            priority: "medium",
            action_url: `/my-profile/payslip/${payslipDocId}`,
          });
        }

        results.push({
          employee_id: emp.id,
          employee_name: employeeName,
          success: true,
          pdf_storage_path: storagePath,
          payslip_document_id: payslipDocId,
        });
      } catch (error) {
        console.error(`Error generating payslip for ${employeeName}:`, error);
        results.push({
          employee_id: emp.id,
          employee_name: employeeName,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated ${successCount} payslips${failCount > 0 ? `, ${failCount} failed` : ""}`,
        results,
        template_used: {
          id: selectedTemplate.id,
          name: selectedTemplate.name,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in generate-payslips function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Simple PDF generation (placeholder - in production use proper PDF library)
function generateSimplePDF(data: {
  employee: any;
  payrollData: any;
  periodStart: string;
  periodEnd: string;
  company: any;
  currency: string;
}): Uint8Array {
  // This is a minimal PDF structure
  // In production, you would use a proper PDF library or DOCX-to-PDF conversion
  const employeeName = `${data.employee.first_name} ${data.employee.last_name}`;
  const content = `
PAYSLIP
${data.company?.name || 'Company Name'}

Employee: ${employeeName}
Employee ID: ${data.employee.employee_code || 'N/A'}
Department: ${data.employee.department?.name || 'N/A'}
Position: ${data.employee.position?.title || 'N/A'}

Pay Period: ${data.periodStart} to ${data.periodEnd}

EARNINGS
Base Salary: ${data.currency} ${data.payrollData.base_salary?.toFixed(2) || '0.00'}
Housing Allowance: ${data.currency} ${data.payrollData.housing_allowance?.toFixed(2) || '0.00'}
Transport Allowance: ${data.currency} ${data.payrollData.transportation_allowance?.toFixed(2) || '0.00'}
Gross Pay: ${data.currency} ${data.payrollData.gross_pay?.toFixed(2) || '0.00'}

DEDUCTIONS
GOSI: ${data.currency} ${data.payrollData.gosi_deduction?.toFixed(2) || '0.00'}
Total Deductions: ${data.currency} ${data.payrollData.total_deductions?.toFixed(2) || '0.00'}

NET PAY: ${data.currency} ${data.payrollData.net_pay?.toFixed(2) || '0.00'}

Generated: ${new Date().toISOString()}
This is a computer-generated document.
  `.trim();

  // Create a simple PDF
  const pdf = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 595 842]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${content.length + 100}
>>
stream
BT
/F1 10 Tf
50 780 Td
12 TL
${content.split('\n').map(line => `(${line.replace(/[()\\]/g, '\\$&')}) '`).join('\n')}
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000${(366 + content.length).toString().padStart(3, '0')} 00000 n 

trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${416 + content.length}
%%EOF`;

  return new TextEncoder().encode(pdf);
}

function formatMonthYear(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

serve(handler);
