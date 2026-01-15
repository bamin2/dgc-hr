import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import PizZip from "npm:pizzip@3.2.0";
import Docxtemplater from "npm:docxtemplater@3.67.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GeneratePayslipsRequest {
  payroll_run_id: string;
  employee_ids?: string[];
  template_id?: string;
}

interface PayslipGenerationResult {
  employee_id: string;
  employee_name: string;
  success: boolean;
  pdf_storage_path?: string;
  payslip_document_id?: string;
  error?: string;
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
// This handles tags that may be split across XML elements in Word
function angularParser(tag: string) {
  tag = tag.replace(/^\s+|\s+$/g, ""); // Trim whitespace
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
  
  // Log key tag values for debugging
  console.log('Tag values being used:', {
    PAY_MONTH_YEAR: tagData.PAY_MONTH_YEAR,
    PAY_PERIOD: tagData.PAY_PERIOD,
    PAY_PERIOD_START: tagData.PAY_PERIOD_START,
    PAY_PERIOD_END: tagData.PAY_PERIOD_END,
  });
  
  try {
    const doc = new Docxtemplater(zip, {
      // Use {{ }} delimiters to avoid conflicts with XML < > characters
      delimiters: { start: '{{', end: '}}' },
      paragraphLoop: true,
      linebreaks: true,
      // Use custom parser to handle tags that may be split across XML runs
      parser: angularParser,
    });
    
    doc.render(tagData);
    
    const output = doc.getZip().generate({
      type: "uint8array",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    
    return output;
  } catch (error: any) {
    // Provide detailed error messages for template issues
    if (error.properties && error.properties.errors) {
      const errorDetails = error.properties.errors.map((e: any) => ({
        message: e.message,
        id: e.properties?.id,
        context: e.properties?.context,
        offset: e.properties?.offset,
        file: e.properties?.file,
        explanation: e.properties?.explanation,
      }));
      console.error(JSON.stringify({ error: errorDetails }, null, 2));
      
      const firstError = errorDetails[0];
      throw new Error(
        `Template error: ${firstError.message}. ` +
        `${firstError.explanation || ''} ` +
        `(file: ${firstError.file || 'unknown'}, offset: ${firstError.offset || 'unknown'}). ` +
        `Make sure placeholders use {{ }} delimiters (e.g., {{NET_PAY}}).`
      );
    }
    throw error;
  }
}

// Convert DOCX to PDF using CloudConvert API
async function convertDocxToPdf(docxContent: Uint8Array, filename: string): Promise<Uint8Array> {
  const cloudConvertApiKey = Deno.env.get("CLOUDCONVERT_API_KEY");
  
  if (!cloudConvertApiKey) {
    throw new Error("CLOUDCONVERT_API_KEY is not configured");
  }

  console.log("Creating CloudConvert job...");
  
  // Step 1: Create a job with import/upload, convert, and export tasks
  const jobResponse = await fetch("https://api.cloudconvert.com/v2/jobs", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cloudConvertApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tasks: {
        "import-docx": {
          operation: "import/upload",
        },
        "convert-to-pdf": {
          operation: "convert",
          input: "import-docx",
          input_format: "docx",
          output_format: "pdf",
        },
        "export-pdf": {
          operation: "export/url",
          input: "convert-to-pdf",
        },
      },
    }),
  });

  if (!jobResponse.ok) {
    const errorText = await jobResponse.text();
    console.error("CloudConvert job creation failed:", errorText);
    throw new Error(`CloudConvert job creation failed: ${jobResponse.status}`);
  }

  const jobData = await jobResponse.json();
  const jobId = jobData.data.id;
  const uploadTask = jobData.data.tasks.find((t: any) => t.name === "import-docx");
  
  if (!uploadTask?.result?.form) {
    console.error("No upload form in response:", JSON.stringify(jobData));
    throw new Error("CloudConvert did not provide upload form");
  }

  console.log("Uploading DOCX to CloudConvert...");
  
  // Step 2: Upload the DOCX file
  const formData = new FormData();
  for (const [key, value] of Object.entries(uploadTask.result.form.parameters)) {
    formData.append(key, value as string);
  }
  // Create a proper ArrayBuffer from Uint8Array for Blob compatibility
  const docxArrayBuffer = new ArrayBuffer(docxContent.byteLength);
  new Uint8Array(docxArrayBuffer).set(docxContent);
  formData.append("file", new Blob([docxArrayBuffer], { 
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
  }), filename);
  const uploadResponse = await fetch(uploadTask.result.form.url, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error("CloudConvert upload failed:", errorText);
    throw new Error(`CloudConvert upload failed: ${uploadResponse.status}`);
  }

  console.log("Waiting for CloudConvert conversion...");
  
  // Step 3: Poll for job completion
  let attempts = 0;
  const maxAttempts = 60; // 60 seconds timeout
  let exportUrl: string | null = null;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const statusResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
      headers: {
        "Authorization": `Bearer ${cloudConvertApiKey}`,
      },
    });

    if (!statusResponse.ok) {
      throw new Error(`Failed to check job status: ${statusResponse.status}`);
    }

    const statusData = await statusResponse.json();
    const job = statusData.data;

    if (job.status === "finished") {
      const exportTask = job.tasks.find((t: any) => t.name === "export-pdf");
      if (exportTask?.result?.files?.[0]?.url) {
        exportUrl = exportTask.result.files[0].url;
        break;
      }
    } else if (job.status === "error") {
      const errorTask = job.tasks.find((t: any) => t.status === "error");
      console.error("CloudConvert job failed:", JSON.stringify(errorTask));
      throw new Error(`CloudConvert conversion failed: ${errorTask?.message || "Unknown error"}`);
    }

    attempts++;
  }

  if (!exportUrl) {
    throw new Error("CloudConvert conversion timed out");
  }

  console.log("Downloading converted PDF...");
  
  // Step 4: Download the converted PDF
  const pdfResponse = await fetch(exportUrl);
  if (!pdfResponse.ok) {
    throw new Error(`Failed to download PDF: ${pdfResponse.status}`);
  }

  const pdfBuffer = await pdfResponse.arrayBuffer();
  return new Uint8Array(pdfBuffer);
}

const handler = async (req: Request): Promise<Response> => {
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
          id, first_name, last_name, employee_code, email, join_date, gosi_registered_salary,
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

    // Check if template has a DOCX file
    if (!selectedTemplate.docx_storage_path) {
      return new Response(
        JSON.stringify({ error: "Template does not have a DOCX file uploaded" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Using template: ${selectedTemplate.name}, DOCX path: ${selectedTemplate.docx_storage_path}`);

    // Download the DOCX template from storage
    const { data: templateFile, error: downloadError } = await supabaseClient.storage
      .from("payslip-templates")
      .download(selectedTemplate.docx_storage_path);

    if (downloadError || !templateFile) {
      console.error("Error downloading template:", downloadError);
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

    const results: PayslipGenerationResult[] = [];
    const periodStart = payrollRun.pay_period_start;
    const periodEnd = payrollRun.pay_period_end;
    const currencyCode = payrollRun.work_location?.currency || "BHD";

    // Process each employee
    for (const payrollEmployee of payrollEmployees || []) {
      const emp = payrollEmployee.employee;
      const employeeName = `${emp.first_name} ${emp.last_name}`;
      
      try {
        console.log(`Processing payslip for ${employeeName}...`);

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
          
          // Earnings - raw amounts
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

        // Process DOCX template with tag data
        const filledDocx = await processDocxTemplate(templateBuffer, tagData);
        console.log(`Template filled, size: ${filledDocx.byteLength} bytes`);

        // Convert DOCX to PDF using CloudConvert
        const pdfContent = await convertDocxToPdf(
          filledDocx, 
          `payslip_${emp.employee_code || emp.id}_${periodStart}.docx`
        );
        console.log(`PDF generated, size: ${pdfContent.byteLength} bytes`);

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

        console.log(`Successfully generated payslip for ${employeeName}`);
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

serve(handler);
