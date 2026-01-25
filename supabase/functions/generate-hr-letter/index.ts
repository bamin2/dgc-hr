import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Docxtemplater from "https://esm.sh/docxtemplater@3.50.0";
import PizZip from "https://esm.sh/pizzip@3.1.7";
import { format } from "https://esm.sh/date-fns@3.6.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// DGC Brand Colors for email
const DGC_DEEP_GREEN = "#0F2A28";
const DGC_DEEP_GREEN_DARK = "#0A1D1B";
const DGC_GOLD = "#C6A45E";
const DGC_OFF_WHITE = "#F7F7F5";

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

// deno-lint-ignore no-explicit-any
async function fetchSmartTags(supabaseClient: any): Promise<Map<string, { field: string; source: string }>> {
  const { data: tags, error } = await supabaseClient
    .from("smart_tags")
    .select("tag, field, source")
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching smart tags:", error);
    return new Map();
  }

  const tagMap = new Map<string, { field: string; source: string }>();
  // deno-lint-ignore no-explicit-any
  for (const tag of (tags || []) as any[]) {
    const cleanTag = tag.tag.replace(/<<|>>/g, "");
    tagMap.set(cleanTag, { field: tag.field, source: tag.source });
  }
  return tagMap;
}

// deno-lint-ignore no-explicit-any
async function fetchEmployeeData(supabaseClient: any, employeeId: string) {
  const { data: employee, error: empError } = await supabaseClient
    .from("employees")
    .select(`
      *,
      department:departments!employees_department_id_fkey(id, name),
      position:positions!employees_position_id_fkey(id, title),
      manager(id, first_name, last_name),
      work_location:work_locations!employees_work_location_id_fkey(id, name, country, currency)
    `)
    .eq("id", employeeId)
    .single();

  if (empError) throw new Error(`Failed to fetch employee: ${empError.message}`);
  return employee;
}

// deno-lint-ignore no-explicit-any
async function fetchCompanySettings(supabaseClient: any) {
  const { data: company, error: companyError } = await supabaseClient
    .from("company_settings")
    .select("*")
    .limit(1)
    .single();

  if (companyError) throw new Error(`Failed to fetch company: ${companyError.message}`);
  return company;
}

// deno-lint-ignore no-explicit-any
async function fetchEmployeeAllowances(supabaseClient: any, employeeId: string) {
  const { data: allowances } = await supabaseClient
    .from("employee_allowances")
    .select(`
      *,
      template:allowance_templates(name, amount, amount_type)
    `)
    .eq("employee_id", employeeId);

  return allowances || [];
}

function buildTagData(
  // deno-lint-ignore no-explicit-any
  employee: any,
  // deno-lint-ignore no-explicit-any
  company: any,
  // deno-lint-ignore no-explicit-any
  allowances: any[],
  smartTags: Map<string, { field: string; source: string }>
): Record<string, string> {
  const tagData: Record<string, string> = {};
  const baseSalary = Number(employee.salary) || 0;
  const currency = (employee.work_location as Record<string, unknown>)?.currency as string || employee.salary_currency_code as string || "BHD";

  // Calculate totals
  let totalAllowances = 0;
  for (const allowance of allowances) {
    totalAllowances += allowance.custom_amount || allowance.template?.amount || 0;
  }
  const grossSalary = baseSalary + totalAllowances;

  // Build full company address
  const addressParts = [
    company.address_street,
    company.address_city,
    company.address_state,
    company.address_zip_code,
    company.address_country
  ].filter(Boolean);
  const fullAddress = addressParts.join(", ");

  // Process each smart tag
  for (const [tagName, { field, source }] of smartTags) {
    let value = "";

    if (source === "employee") {
      switch (field) {
        case "full_name":
          value = employee.full_name as string || `${employee.first_name} ${employee.last_name}`;
          break;
        case "basic_salary":
          value = `${currency} ${baseSalary.toLocaleString()}`;
          break;
        case "gross_salary":
          value = `${currency} ${grossSalary.toLocaleString()}`;
          break;
        case "total_allowances":
        case "net_allowances":
          value = `${currency} ${totalAllowances.toLocaleString()}`;
          break;
        case "net_salary":
          value = `${currency} ${grossSalary.toLocaleString()}`;
          break;
        case "salary":
          value = `${currency} ${baseSalary.toLocaleString()}`;
          break;
        case "join_date":
          value = employee.join_date ? format(new Date(employee.join_date as string), "MMMM d, yyyy") : "";
          break;
        case "date_of_birth":
          value = employee.date_of_birth ? format(new Date(employee.date_of_birth as string), "MMMM d, yyyy") : "";
          break;
        default:
          value = String(employee[field] || "");
      }
    } else if (source === "department") {
      const dept = employee.department as Record<string, unknown> | null;
      if (field === "department") value = dept?.name as string || "";
      else value = String(dept?.[field] || "");
    } else if (source === "position") {
      const pos = employee.position as Record<string, unknown> | null;
      if (field === "job_title" || field === "position") value = pos?.title as string || "";
      else value = String(pos?.[field] || "");
    } else if (source === "work_location") {
      const loc = employee.work_location as Record<string, unknown> | null;
      if (field === "currency") value = loc?.currency as string || currency;
      else value = String(loc?.[field] || "");
    } else if (source === "company") {
      switch (field) {
        case "company_name":
          value = company.name as string || "";
          break;
        case "company_legal_name":
          value = company.legal_name as string || company.name as string || "";
          break;
        case "company_full_address":
          value = fullAddress;
          break;
        case "company_email":
          value = company.email as string || "";
          break;
        case "company_phone":
          value = company.phone as string || "";
          break;
        case "company_logo_url":
          value = company.document_logo_url as string || company.logo_url as string || "";
          break;
        default:
          value = String(company[field] || "");
      }
    } else if (source === "system") {
      switch (field) {
        case "current_date":
          value = format(new Date(), "MMMM d, yyyy");
          break;
        case "current_year":
          value = new Date().getFullYear().toString();
          break;
        default:
          value = "";
      }
    }

    tagData[tagName] = value;
  }

  return tagData;
}

async function processDocxTemplate(templateBuffer: ArrayBuffer, tagData: Record<string, string>): Promise<Uint8Array> {
  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "<<", end: ">>" },
  });

  doc.render(tagData);
  const output = doc.getZip().generate({ type: "uint8array" });
  return output;
}

async function convertDocxToPdf(docxBuffer: Uint8Array): Promise<Uint8Array> {
  const cloudConvertApiKey = Deno.env.get("CLOUDCONVERT_API_KEY");
  if (!cloudConvertApiKey) throw new Error("CLOUDCONVERT_API_KEY not configured");

  // Create job
  const jobResponse = await fetch("https://api.cloudconvert.com/v2/jobs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cloudConvertApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tasks: {
        "import-my-file": { operation: "import/base64", file: uint8ArrayToBase64(docxBuffer), filename: "document.docx" },
        "convert-my-file": { operation: "convert", input: "import-my-file", output_format: "pdf" },
        "export-my-file": { operation: "export/url", input: "convert-my-file" },
      },
    }),
  });

  if (!jobResponse.ok) throw new Error(`CloudConvert job creation failed: ${await jobResponse.text()}`);
  const jobData = await jobResponse.json();
  const jobId = jobData.data.id;

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60;
  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const statusResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${cloudConvertApiKey}` },
    });
    const statusData = await statusResponse.json();

    if (statusData.data.status === "finished") {
      const exportTask = statusData.data.tasks.find((t: { name: string }) => t.name === "export-my-file");
      if (exportTask?.result?.files?.[0]?.url) {
        const pdfResponse = await fetch(exportTask.result.files[0].url);
        return new Uint8Array(await pdfResponse.arrayBuffer());
      }
      throw new Error("No PDF file in export");
    } else if (statusData.data.status === "error") {
      throw new Error(`CloudConvert error: ${JSON.stringify(statusData.data.tasks)}`);
    }
    attempts++;
  }
  throw new Error("CloudConvert timeout");
}

function generateHRLetterEmail(
  employeeName: string,
  templateName: string,
  // deno-lint-ignore no-explicit-any
  company: any
): string {
  const logoUrl = company.email_logo_url || company.document_logo_url || company.logo_url;
  const logoSection = logoUrl 
    ? `<img src="${logoUrl}" alt="${company.name}" style="max-height:45px;max-width:150px;margin-right:15px;vertical-align:middle;" />`
    : `<div style="display:inline-block;width:45px;height:45px;background:rgba(255,255,255,0.2);border-radius:8px;margin-right:15px;vertical-align:middle;text-align:center;line-height:45px;font-size:20px;font-weight:bold;color:white;">${(company.name as string || "C").charAt(0)}</div>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:${DGC_OFF_WHITE};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:20px;">
    <tr>
      <td style="background:linear-gradient(135deg,${DGC_DEEP_GREEN} 0%,${DGC_DEEP_GREEN_DARK} 100%);padding:25px 30px;border-radius:12px 12px 0 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="vertical-align:middle;">
              ${logoSection}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background-color:#ffffff;padding:30px;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="display:inline-block;background:linear-gradient(135deg,${DGC_GOLD}20 0%,${DGC_GOLD}10 100%);border-radius:50%;width:70px;height:70px;line-height:70px;text-align:center;">
            <span style="font-size:32px;">📄</span>
          </div>
        </div>
        
        <h2 style="color:#18181b;margin:0 0 10px 0;font-size:22px;text-align:center;font-weight:600;">Your ${templateName} is Ready</h2>
        
        <p style="color:#52525b;margin:0 0 25px 0;line-height:1.6;text-align:center;font-size:15px;">
          Hi <strong style="color:#18181b;">${employeeName}</strong>, your requested <strong style="color:${DGC_GOLD};">${templateName}</strong> has been generated and is attached to this email.
        </p>
        
        <div style="background-color:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;padding:15px 20px;margin-bottom:20px;text-align:center;">
          <p style="color:#16a34a;margin:0;font-size:14px;font-weight:500;">
            ✓ Document attached as PDF
          </p>
        </div>
        
        <p style="color:#71717a;margin:0;font-size:13px;text-align:center;line-height:1.5;">
          You can also view and download this document from your profile in the HR portal.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color:#f9fafb;padding:25px 30px;border-top:1px solid #e5e7eb;border-radius:0 0 12px 12px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="text-align:center;">
              <p style="color:#18181b;margin:0 0 8px 0;font-size:14px;font-weight:600;">${company.name}</p>
              <p style="color:#a1a1aa;margin:0;font-size:11px;line-height:1.5;">
                This is an automated notification. Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { request_id } = await req.json();
    if (!request_id) throw new Error("request_id is required");

    console.log(`Processing HR letter request: ${request_id}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch request with template
    const { data: request, error: requestError } = await supabaseClient
      .from("hr_document_requests")
      .select(`
        *,
        template:document_templates(id, name, category, docx_storage_path),
        employee:employees(id, user_id, first_name, last_name, email, full_name)
      `)
      .eq("id", request_id)
      .single();

    if (requestError || !request) throw new Error(`Request not found: ${requestError?.message}`);

    const template = request.template as { id: string; name: string; docx_storage_path?: string } | null;
    const employee = request.employee as { id: string; user_id: string; first_name: string; last_name: string; email: string; full_name?: string } | null;

    if (!template?.docx_storage_path) throw new Error("Template has no DOCX file");
    if (!employee) throw new Error("Employee not found");

    console.log(`Template: ${template.name}, Employee: ${employee.first_name} ${employee.last_name}`);

    // Download DOCX template
    const { data: templateFile, error: downloadError } = await supabaseClient.storage
      .from("docx-templates")
      .download(template.docx_storage_path);

    if (downloadError || !templateFile) throw new Error(`Failed to download template: ${downloadError?.message}`);

    // Fetch data for tag replacement
    const [smartTags, employeeData, companySettings, allowances] = await Promise.all([
      fetchSmartTags(supabaseClient),
      fetchEmployeeData(supabaseClient, employee.id),
      fetchCompanySettings(supabaseClient),
      fetchEmployeeAllowances(supabaseClient, employee.id),
    ]);

    // Build tag data and process template
    const tagData = buildTagData(employeeData, companySettings, allowances, smartTags);
    console.log("Processing template with tags...");

    const filledDocx = await processDocxTemplate(await templateFile.arrayBuffer(), tagData);
    console.log("Template filled, converting to PDF...");

    const pdfBuffer = await convertDocxToPdf(filledDocx);
    console.log("PDF generated successfully");

    // Upload PDF to storage
    const timestamp = Date.now();
    const safeTemplateName = template.name.replace(/[^a-zA-Z0-9]/g, "_");
    const storagePath = `${employee.user_id}/${timestamp}_${safeTemplateName}.pdf`;

    const { error: uploadError } = await supabaseClient.storage
      .from("hr-letters")
      .upload(storagePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    console.log(`PDF uploaded to: ${storagePath}`);

    // Update request status
    const { error: updateError } = await supabaseClient
      .from("hr_document_requests")
      .update({
        status: "approved",
        pdf_storage_path: storagePath,
        processed_at: new Date().toISOString(),
      })
      .eq("id", request_id);

    if (updateError) throw new Error(`Failed to update request: ${updateError.message}`);

    // Send email with PDF attachment
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey && employee.email) {
      try {
        const resend = new Resend(resendApiKey);
        const employeeName = employee.full_name || `${employee.first_name} ${employee.last_name}`;
        const emailHtml = generateHRLetterEmail(employeeName, template.name, companySettings);

        await resend.emails.send({
          from: `HR <noreply@${companySettings.website?.replace('www.', '') || 'dgcholding.com'}>`,
          to: [employee.email],
          subject: `Your ${template.name} is Ready`,
          html: emailHtml,
          attachments: [
            {
              filename: `${template.name}.pdf`,
              content: uint8ArrayToBase64(pdfBuffer),
            },
          ],
        });
        console.log(`Email sent to ${employee.email}`);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({ success: true, pdf_storage_path: storagePath }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating HR letter:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
