import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOfferLetterRequest {
  offer_version_id: string;
  template_id: string;
}

async function sendEmail(to: string, subject: string, html: string, fromName: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${fromName} <onboarding@resend.dev>`,
      to: [to],
      subject,
      html,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    return { error: data, data: null };
  }
  
  return { data, error: null };
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
        position:positions(*)
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

    const formatNumber = (num: number | null): string => {
      if (num === null || num === undefined) return "0";
      return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Replace placeholders in template
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

    const renderedSubject = replacePlaceholders(template.subject_template);
    const renderedBody = replacePlaceholders(template.body_template);

    // Send email via Resend API
    const emailResponse = await sendEmail(
      candidate.email, 
      renderedSubject, 
      renderedBody, 
      `${companyName} HR`
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
        body_rendered: renderedBody,
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
        message_id: emailResponse.data?.id 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-offer-letter function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
