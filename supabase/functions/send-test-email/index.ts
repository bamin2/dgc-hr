import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Brand colors
const BRAND_PRIMARY = "#804EEC";
const BRAND_PRIMARY_DARK = "#6B3FD4";

interface TestEmailRequest {
  subject: string;
  bodyContent: string;
  recipientEmail: string;
}

interface ResendResponse {
  id?: string;
  error?: { message: string };
}

interface CompanyData {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  document_logo_url?: string;
  address_city?: string;
  address_country?: string;
}

async function sendEmail(to: string[], subject: string, html: string, from: string): Promise<ResendResponse> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  const data = await response.json();
  if (!response.ok) {
    return { error: { message: data.message || "Failed to send email" } };
  }
  return { id: data.id };
}

function generateEmailHeader(companyName: string, companyLogo?: string): string {
  const logoSection = companyLogo 
    ? `<img src="${companyLogo}" alt="${companyName}" style="max-height:45px;max-width:150px;margin-right:15px;vertical-align:middle;" />`
    : `<div style="display:inline-block;width:45px;height:45px;background:rgba(255,255,255,0.2);border-radius:8px;margin-right:15px;vertical-align:middle;text-align:center;line-height:45px;font-size:20px;font-weight:bold;color:white;">${companyName.charAt(0)}</div>`;

  return `
    <tr>
      <td style="background:linear-gradient(135deg,${BRAND_PRIMARY} 0%,${BRAND_PRIMARY_DARK} 100%);padding:25px 30px;border-radius:12px 12px 0 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="vertical-align:middle;">
              ${logoSection}
              <span style="color:#ffffff;font-size:22px;font-weight:600;vertical-align:middle;">${companyName}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function generateEmailFooter(company: CompanyData): string {
  const phone = company.phone || "+973 17000342";
  const website = company.website || "www.dgcholding.com";
  const email = company.email || "info@dgcholding.com";
  const address = company.address_city && company.address_country 
    ? `${company.address_city}, ${company.address_country}` 
    : "Manama, Kingdom of Bahrain";

  return `
    <tr>
      <td style="background-color:#f9fafb;padding:25px 30px;border-top:1px solid #e5e7eb;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="text-align:center;">
              <p style="color:#18181b;margin:0 0 8px 0;font-size:14px;font-weight:600;">${company.name}</p>
              <p style="color:#71717a;margin:0 0 4px 0;font-size:12px;">${address}</p>
              <p style="color:#71717a;margin:0 0 15px 0;font-size:12px;">
                <a href="tel:${phone.replace(/\s/g, '')}" style="color:#71717a;text-decoration:none;">${phone}</a>
                &nbsp;|&nbsp;
                <a href="mailto:${email}" style="color:${BRAND_PRIMARY};text-decoration:none;">${email}</a>
              </p>
              <p style="margin:0 0 15px 0;">
                <a href="https://${website}" style="color:${BRAND_PRIMARY};text-decoration:none;font-size:12px;font-weight:500;">${website}</a>
              </p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:15px 0;" />
              <p style="color:#a1a1aa;margin:0;font-size:11px;line-height:1.5;">
                This is a test email from ${company.name}.<br />
                Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function generateTestEmailHtml(company: CompanyData, bodyContent: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:30px 15px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
              ${generateEmailHeader(company.name, company.document_logo_url || company.logo_url)}
              <tr>
                <td style="padding:30px;">
                  <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
                    <p style="margin:0;color:#92400e;font-size:14px;font-weight:500;">
                      🧪 This is a test email
                    </p>
                    <p style="margin:4px 0 0 0;color:#92400e;font-size:12px;">
                      Variables are shown with sample data for preview purposes.
                    </p>
                  </div>
                  ${bodyContent}
                </td>
              </tr>
              ${generateEmailFooter(company)}
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify the caller's JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if caller has Admin role (send-test-email should be admin only)
    const { data: roleData, error: roleError } = await supabase
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

    const { subject, bodyContent, recipientEmail }: TestEmailRequest = await req.json();

    if (!subject || !bodyContent || !recipientEmail) {
      throw new Error("Missing required fields: subject, bodyContent, and recipientEmail are required");
    }

    // Get company settings
    const { data: companySettings } = await supabase
      .from("company_settings")
      .select("name, email, phone, website, logo_url, document_logo_url, address_city, address_country")
      .single();

    const company: CompanyData = companySettings || { name: "Company" };
    const fromEmail = `${company.name} <noreply@updates.dgcholding.com>`;

    // Generate the full email HTML
    const html = generateTestEmailHtml(company, bodyContent);

    // Send the test email
    const result = await sendEmail([recipientEmail], `[TEST] ${subject}`, html, fromEmail);

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Log the test email
    await supabase.from("email_logs").insert({
      recipient_email: recipientEmail,
      email_type: "test_email",
      subject: `[TEST] ${subject}`,
      status: "sent",
      resend_id: result.id,
      metadata: { test: true },
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true, message: "Test email sent successfully", id: result.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-test-email function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
