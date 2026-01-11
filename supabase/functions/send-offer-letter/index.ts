import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import Docxtemplater from "npm:docxtemplater@3.67.6";
// @ts-ignore
import PizZip from "npm:pizzip@3.2.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const CLOUDCONVERT_API_KEY = Deno.env.get("CLOUDCONVERT_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOfferLetterRequest {
  offer_version_id: string;
  template_id: string;
}

async function sendEmailWithAttachment(
  to: string,
  subject: string,
  html: string,
  fromName: string,
  attachment?: { filename: string; content: string }
) {
  const body: Record<string, unknown> = {
    from: `${fromName} <onboarding@resend.dev>`,
    to: [to],
    subject,
    html,
  };

  if (attachment) {
    body.attachments = [attachment];
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  
  if (!response.ok) {
    return { error: data, data: null };
  }
  
  return { data, error: null };
}

async function downloadTemplate(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download template: ${response.statusText}`);
  }
  return response.arrayBuffer();
}

function fillDocxTemplate(templateBuffer: ArrayBuffer, data: Record<string, string>): Uint8Array {
  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "<<", end: ">>" },
  });

  doc.render(data);

  const output = doc.getZip().generate({
    type: "uint8array",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  return output;
}

async function convertDocxToPdf(docxBuffer: Uint8Array): Promise<Uint8Array> {
  if (!CLOUDCONVERT_API_KEY) {
    throw new Error("CLOUDCONVERT_API_KEY not configured");
  }

  // Create a job with import, convert, and export tasks
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
          file: btoa(String.fromCharCode(...docxBuffer)),
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
  const maxAttempts = 60; // 60 seconds max
  
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
      // Find the export task and get the file URL
      const exportTask = statusData.data.tasks.find(
        (t: { name: string; status: string }) => t.name === "export-file" && t.status === "finished"
      );

      if (!exportTask?.result?.files?.[0]?.url) {
        throw new Error("Export task completed but no file URL found");
      }

      // Download the PDF
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

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { offer_version_id, template_id }: SendOfferLetterRequest = await req.json();

    if (!offer_version_id || !template_id) {
      return new Response(
        JSON.stringify({ error: "offer_version_id and template_id are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch offer version with related data
    const { data: version, error: versionError } = await supabase
      .from("offer_versions")
      .select(`
        *,
        offer:offers!inner(
          *,
          candidate:candidates!inner(*)
        ),
        work_location:work_locations(*),
        department:departments(*),
        position:positions(id, title, job_description)
      `)
      .eq("id", offer_version_id)
      .single();

    if (versionError || !version) {
      console.error("Error fetching offer version:", versionError);
      return new Response(
        JSON.stringify({ error: "Offer version not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch template
    const { data: template, error: templateError } = await supabase
      .from("offer_letter_templates")
      .select("*")
      .eq("id", template_id)
      .single();

    if (templateError || !template) {
      console.error("Error fetching template:", templateError);
      return new Response(
        JSON.stringify({ error: "Template not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch company settings
    const { data: companySettings } = await supabase
      .from("company_settings")
      .select("*")
      .single();

    const candidate = version.offer.candidate;
    const candidateName = `${candidate.first_name} ${candidate.last_name}`;
    const companyName = companySettings?.name || "Company";

    // Fetch active smart tags from database for consistent tag mapping
    const { data: smartTags } = await supabase
      .from("smart_tags")
      .select("*")
      .eq("is_active", true);

    const formatNumber = (num: number | null): string => {
      if (num === null || num === undefined) return "0.00";
      return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDate = (dateStr: string | null): string => {
      if (!dateStr) return "TBD";
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      } catch {
        return dateStr;
      }
    };

    let renderedSubject = template.subject_template || `Offer Letter - ${companyName}`;
    let renderedBody = "";
    let pdfAttachment: { filename: string; content: string } | undefined;

    if (template.template_type === "docx" && template.docx_template_url) {
      // Handle DOCX template
      console.log("Processing DOCX template...");

      // Calculate total allowances
      const totalAllowances = (version.housing_allowance || 0) + 
        (version.transport_allowance || 0) + 
        (version.other_allowances || 0);

      // Base data mapping using field names from database smart_tags
      const baseData: Record<string, string> = {
        // Employee/Candidate info
        "first_name": candidate.first_name,
        "last_name": candidate.last_name,
        "full_name": candidateName,
        "email": candidate.email,
        
        // Position info - support both database field names and common variations
        "title": version.position?.title || "",
        "job_title": version.position?.title || "",
        "job_description": version.position?.job_description || "",
        "department": version.department?.name || "",
        "work_location": version.work_location?.name || "",
        
        // Compensation
        "basic_salary": formatNumber(version.basic_salary),
        "housing_allowance": formatNumber(version.housing_allowance),
        "transport_allowance": formatNumber(version.transport_allowance),
        "other_allowances": formatNumber(version.other_allowances),
        "net_allowances": formatNumber(totalAllowances),
        "total_allowances": formatNumber(totalAllowances),
        "gross_salary": formatNumber(version.gross_pay_total),
        "net_salary": formatNumber(version.net_pay_estimate),
        "currency": version.currency_code || "SAR",
        "employer_gosi": formatNumber(version.employer_gosi_amount),
        
        // Company
        "company_name": companyName,
        "company_legal_name": companySettings?.legal_name || companyName,
        
        // Dates - support both field names
        "start_date": formatDate(version.start_date),
        "join_date": formatDate(version.start_date),
        "current_date": new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };

      // Build smart tag data with both field names and display names for flexibility
      const smartTagData: Record<string, string> = { ...baseData };
      
      // Add mappings using tag display names from database (e.g., "First Name" from "<<First Name>>")
      if (smartTags) {
        for (const tag of smartTags) {
          const tagName = tag.tag.replace(/^<<|>>$/g, ""); // Extract "First Name" from "<<First Name>>"
          const fieldValue = baseData[tag.field];
          if (fieldValue !== undefined) {
            smartTagData[tagName] = fieldValue;
          }
        }
      }

      // Download and fill the template
      const templateBuffer = await downloadTemplate(template.docx_template_url);
      const filledDocx = fillDocxTemplate(templateBuffer, smartTagData);

      // Convert to PDF
      console.log("Converting to PDF...");
      const pdfBuffer = await convertDocxToPdf(filledDocx);

      // Prepare attachment
      const base64Pdf = btoa(String.fromCharCode(...pdfBuffer));
      pdfAttachment = {
        filename: `offer-letter-${candidate.first_name}-${candidate.last_name}.pdf`,
        content: base64Pdf,
      };

      // Replace placeholders in subject
      renderedSubject = renderedSubject
        .replace(/{candidate_name}/g, candidateName)
        .replace(/{job_title}/g, version.position?.title || "Position")
        .replace(/{company_name}/g, companyName);

      // Simple email body for PDF attachment
      renderedBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Dear ${candidate.first_name},</h2>
          <p>Please find attached your official offer letter from ${companyName}.</p>
          <p>We are excited to extend this offer to you for the position of <strong>${version.position?.title || "the role"}</strong>.</p>
          <p>Please review the attached document carefully. If you have any questions, don't hesitate to reach out to us.</p>
          <p>We look forward to welcoming you to our team!</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>${companyName} HR Team</strong></p>
        </div>
      `;
    } else {
      // Handle HTML template (existing logic)
      const replacePlaceholders = (text: string): string => {
        return text
          .replace(/{candidate_name}/g, candidateName)
          .replace(/{candidate_first_name}/g, candidate.first_name)
          .replace(/{candidate_last_name}/g, candidate.last_name)
          .replace(/{job_title}/g, version.position?.title || "Position")
          .replace(/{department}/g, version.department?.name || "Department")
          .replace(/{work_location}/g, version.work_location?.name || "Location")
          .replace(/{start_date}/g, version.start_date || "TBD")
          .replace(/{currency}/g, version.currency_code || "USD")
          .replace(/{basic_salary}/g, formatNumber(version.basic_salary))
          .replace(/{housing_allowance}/g, formatNumber(version.housing_allowance))
          .replace(/{transport_allowance}/g, formatNumber(version.transport_allowance))
          .replace(/{other_allowances}/g, formatNumber(version.other_allowances))
          .replace(/{gross_pay_total}/g, formatNumber(version.gross_pay_total))
          .replace(/{net_pay_estimate}/g, formatNumber(version.net_pay_estimate))
          .replace(/{employer_gosi_amount}/g, formatNumber(version.employer_gosi_amount))
          .replace(/{company_name}/g, companyName)
          .replace(/{current_date}/g, new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }));
      };

      renderedSubject = replacePlaceholders(template.subject_template || "");
      renderedBody = replacePlaceholders(template.body_template || "");
    }

    // Send email via Resend API
    console.log("Sending email...");
    const emailResponse = await sendEmailWithAttachment(
      candidate.email,
      renderedSubject,
      renderedBody,
      `${companyName} HR`,
      pdfAttachment
    );

    const emailSent = !emailResponse.error;
    const now = new Date().toISOString();

    // Create offer_emails record
    const { error: emailLogError } = await supabase
      .from("offer_emails")
      .insert({
        offer_version_id,
        to_email: candidate.email,
        subject: renderedSubject,
        body_rendered: template.template_type === "docx" ? "[PDF Attachment]" : renderedBody,
        status: emailSent ? "sent" : "failed",
        provider_message_id: emailResponse.data?.id || null,
        error_message: emailResponse.error?.message || null,
        sent_at: emailSent ? now : null,
      });

    if (emailLogError) {
      console.error("Error logging email:", emailLogError);
    }

    if (!emailSent) {
      console.error("Email sending failed:", emailResponse.error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email", 
          details: emailResponse.error?.message 
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update offer_version status to 'sent' and set sent_at
    const { error: versionUpdateError } = await supabase
      .from("offer_versions")
      .update({ 
        status: "sent", 
        sent_at: now 
      })
      .eq("id", offer_version_id);

    if (versionUpdateError) {
      console.error("Error updating version status:", versionUpdateError);
    }

    // Update offer status to 'sent'
    const { error: offerUpdateError } = await supabase
      .from("offers")
      .update({ status: "sent" })
      .eq("id", version.offer.id);

    if (offerUpdateError) {
      console.error("Error updating offer status:", offerUpdateError);
    }

    // Update candidate status to 'offer_sent'
    const { error: candidateUpdateError } = await supabase
      .from("candidates")
      .update({ status: "offer_sent" })
      .eq("id", candidate.id);

    if (candidateUpdateError) {
      console.error("Error updating candidate status:", candidateUpdateError);
    }

    console.log("Offer letter sent successfully:", emailResponse.data?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_id: emailResponse.data?.id,
        template_type: template.template_type,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-offer-letter function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
