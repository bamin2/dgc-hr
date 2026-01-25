import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import PizZip from "npm:pizzip@3.2.0";
import Docxtemplater from "npm:docxtemplater@3.67.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CLOUDCONVERT_API_KEY = Deno.env.get("CLOUDCONVERT_API_KEY");

interface GenerateHRLetterRequest {
  request_id: string;
}

// Format date as readable string
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

// Format currency
function formatCurrency(amount: number | null | undefined, currency: string = "SAR"): string {
  const value = Number(amount) || 0;
  return `${currency} ${value.toFixed(2)}`;
}

// Get ordinal suffix
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

// Custom parser for docxtemplater
function angularParser(tag: string) {
  tag = tag.replace(/^\s+|\s+$/g, "");
  return {
    get: function (scope: Record<string, string>) {
      if (tag === ".") return scope;
      return scope[tag] ?? "";
    },
  };
}

// Convert Uint8Array to base64 in chunks to avoid stack overflow
function uint8ArrayToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let result = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    result += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(result);
}

// Convert DOCX to PDF using CloudConvert
async function convertDocxToPdf(docxBuffer: Uint8Array): Promise<Uint8Array> {
  if (!CLOUDCONVERT_API_KEY) {
    throw new Error("CLOUDCONVERT_API_KEY not configured");
  }

  const base64Docx = uint8ArrayToBase64(docxBuffer);

  const createJobResponse = await fetch("https://api.cloudconvert.com/v2/jobs", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${CLOUDCONVERT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tasks: {
        "import-file": {
          operation: "import/base64",
          file: base64Docx,
          filename: "document.docx",
        },
        "convert-to-pdf": {
          operation: "convert",
          input: "import-file",
          output_format: "pdf",
        },
        "export-file": {
          operation: "export/url",
          input: "convert-to-pdf",
        },
      },
    }),
  });

  if (!createJobResponse.ok) {
    const error = await createJobResponse.json();
    console.error("CloudConvert job creation failed:", error);
    throw new Error(`CloudConvert job creation failed: ${JSON.stringify(error)}`);
  }

  const job = await createJobResponse.json();
  const jobId = job.data.id;

  // Poll for job completion
  let attempts = 0;
  const maxAttempts = 60;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const statusResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
      headers: {
        "Authorization": `Bearer ${CLOUDCONVERT_API_KEY}`,
      },
    });

    if (!statusResponse.ok) {
      throw new Error("Failed to check job status");
    }

    const statusData = await statusResponse.json();
    const status = statusData.data.status;

    if (status === "finished") {
      const exportTask = statusData.data.tasks.find(
        (t: { name: string; status: string }) => t.name === "export-file" && t.status === "finished"
      );

      if (!exportTask?.result?.files?.[0]?.url) {
        throw new Error("Export task completed but no file URL found");
      }

      const pdfResponse = await fetch(exportTask.result.files[0].url);
      if (!pdfResponse.ok) {
        throw new Error("Failed to download converted PDF");
      }

      const pdfBuffer = await pdfResponse.arrayBuffer();
      return new Uint8Array(pdfBuffer);
    }

    if (status === "error") {
      const errorTask = statusData.data.tasks.find((t: { status: string }) => t.status === "error");
      throw new Error(`Conversion failed: ${errorTask?.message || "Unknown error"}`);
    }

    attempts++;
  }

  throw new Error("Conversion timed out");
}

// Process DOCX template with smart tags
async function processDocxTemplate(
  templateBuffer: ArrayBuffer,
  tagData: Record<string, string>
): Promise<Uint8Array> {
  const zip = new PizZip(templateBuffer);

  try {
    const doc = new Docxtemplater(zip, {
      delimiters: { start: "<<", end: ">>" },
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
      throw new Error(`Template error: ${errorDetails[0]?.message || "Unknown error"}`);
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

    const { request_id }: GenerateHRLetterRequest = await req.json();

    if (!request_id) {
      return new Response(
        JSON.stringify({ error: "request_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get the HR document request with template and employee data
    const { data: request, error: requestError } = await supabaseClient
      .from("hr_document_requests")
      .select(`
        *,
        template:document_templates(*),
        employee:employees(
          id, first_name, second_name, last_name, email, phone, employee_code,
          date_of_birth, nationality, gender, join_date, address, country,
          iban, bank_name, bank_account_number, salary, salary_currency_code,
          housing_allowance, transportation_allowance, gosi_registered_salary,
          department:departments!employees_department_id_fkey(id, name),
          position:positions(id, title),
          work_location:work_locations(id, name, address, city, country, currency),
          manager:employees!employees_manager_id_fkey(id, first_name, last_name)
        )
      `)
      .eq("id", request_id)
      .single();

    if (requestError || !request) {
      console.error("Request fetch error:", requestError);
      return new Response(
        JSON.stringify({ error: "Request not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const template = request.template;
    const employee = request.employee;

    if (!template?.docx_storage_path) {
      return new Response(
        JSON.stringify({ error: "Template does not have a DOCX file configured" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Download the DOCX template
    const { data: templateFile, error: downloadError } = await supabaseClient.storage
      .from("docx-templates")
      .download(template.docx_storage_path);

    if (downloadError || !templateFile) {
      console.error("Template download error:", downloadError);
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

    const currencyCode = employee?.salary_currency_code || employee?.work_location?.currency || "SAR";
    const today = new Date();
    const dayOfMonth = today.getDate();

    // Build comprehensive tag data
    const tagData: Record<string, string> = {
      // Employee - Basic Info
      "First Name": employee?.first_name || "",
      "Second Name": employee?.second_name || "",
      "Last Name": employee?.last_name || "",
      "Full Name": [employee?.first_name, employee?.second_name, employee?.last_name].filter(Boolean).join(" "),
      "Email": employee?.email || "",
      "Phone": employee?.phone || "",
      "Employee Code": employee?.employee_code || "",
      "Date of Birth": formatDate(employee?.date_of_birth),
      "Nationality": employee?.nationality || "",
      "Gender": employee?.gender || "",
      "Address": employee?.address || "",
      "Country": employee?.country || "",

      // Employee - Employment Info
      "Join Date": formatDate(employee?.join_date),
      "Job Title": employee?.position?.title || "",
      "Department": employee?.department?.name || "",
      "Work Location": employee?.work_location?.name || "",
      "Manager Name": employee?.manager ? `${employee.manager.first_name} ${employee.manager.last_name}` : "",

      // Employee - Financial Info
      "Salary": formatCurrency(employee?.salary, currencyCode),
      "Currency": currencyCode,
      "IBAN": employee?.iban || "",
      "Bank Name": employee?.bank_name || "",
      "Bank Account Number": employee?.bank_account_number || "",
      "Housing Allowance": formatCurrency(employee?.housing_allowance, currencyCode),
      "Transportation Allowance": formatCurrency(employee?.transportation_allowance, currencyCode),
      "GOSI Registered Salary": formatCurrency(employee?.gosi_registered_salary, currencyCode),

      // Company Info
      "Company Name": companySettings?.name || "",
      "Company Legal Name": companySettings?.legal_name || companySettings?.name || "",
      "Company Email": companySettings?.email || "",
      "Company Phone": companySettings?.phone || "",
      "Company Address": [
        companySettings?.address_street,
        companySettings?.address_city,
        companySettings?.address_state,
        companySettings?.address_country,
      ].filter(Boolean).join(", ") || "",
      "Company Website": companySettings?.website || "",

      // Dates
      "Current Date": formatDate(today.toISOString()),
      "Current Day": `${dayOfMonth}${getOrdinalSuffix(dayOfMonth)}`,
      "Current Month": today.toLocaleDateString("en-US", { month: "long" }),
      "Current Year": today.getFullYear().toString(),

      // Signature placeholders
      "Signature Title": "Human Resources",
      "Signature Name": companySettings?.name || "HR Department",
    };

    console.log(`Processing HR letter for ${tagData["Full Name"]}...`);

    // Process DOCX template with tag data
    const filledDocx = await processDocxTemplate(templateBuffer, tagData);
    console.log(`Template filled, size: ${filledDocx.byteLength} bytes`);

    // Convert DOCX to PDF
    console.log("Converting to PDF...");
    const pdfBuffer = await convertDocxToPdf(filledDocx);
    console.log(`PDF generated, size: ${pdfBuffer.byteLength} bytes`);

    // Generate storage path and filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const sanitizedName = template.name.replace(/[^a-zA-Z0-9]/g, "_");
    const storagePath = `${employee?.id}/${timestamp}_${sanitizedName}.pdf`;

    // Upload PDF to hr-letters bucket
    const { error: uploadError } = await supabaseClient.storage
      .from("hr-letters")
      .upload(storagePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("PDF upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: `Failed to upload PDF: ${uploadError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`PDF uploaded to: ${storagePath}`);

    // Update the request with approved status and PDF path
    const { error: updateError } = await supabaseClient
      .from("hr_document_requests")
      .update({
        status: "approved",
        pdf_storage_path: storagePath,
        processed_by: user.id,
        processed_at: new Date().toISOString(),
      })
      .eq("id", request_id);

    if (updateError) {
      console.error("Request update error:", updateError);
      return new Response(
        JSON.stringify({ error: `Failed to update request: ${updateError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Request ${request_id} approved and document generated`);

    return new Response(
      JSON.stringify({
        success: true,
        pdf_storage_path: storagePath,
        message: "Document generated successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error generating HR letter:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate document" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
