import { useMemo } from "react";
import DOMPurify from "dompurify";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { useActiveSmartTags } from "@/hooks/useSmartTags";
import { renderTemplate, RenderData } from "@/utils/templateRenderer";

interface EmailTemplatePreviewProps {
  templateType: string;
  subject: string;
  bodyContent: string;
}

// Sample data for preview - now using RenderData format for templateRenderer
const sampleRenderData: Record<string, RenderData & { customFields?: Record<string, string> }> = {
  leave_request_submitted: {
    employee: {
      first_name: "John",
      last_name: "Smith",
      email: "john.smith@company.com",
    },
    customFields: {
      leave_type: "Annual Leave",
      leave_start_date: "Monday, Jan 15, 2026",
      leave_end_date: "Wednesday, Jan 17, 2026",
      leave_days_count: "3",
      leave_reason: "Family vacation to the beach",
    },
  },
  leave_request_approved: {
    employee: {
      first_name: "John",
      last_name: "Smith",
      email: "john.smith@company.com",
    },
    customFields: {
      leave_type: "Annual Leave",
      leave_start_date: "Monday, Jan 15, 2026",
      leave_end_date: "Wednesday, Jan 17, 2026",
      leave_days_count: "3",
      reviewer_name: "Sarah Johnson",
    },
  },
  leave_request_rejected: {
    employee: {
      first_name: "John",
      last_name: "Smith",
      email: "john.smith@company.com",
    },
    customFields: {
      leave_type: "Annual Leave",
      leave_start_date: "Monday, Jan 15, 2026",
      leave_end_date: "Wednesday, Jan 17, 2026",
      leave_days_count: "3",
      reviewer_name: "Sarah Johnson",
      rejection_reason: "Team coverage is insufficient during this period. Please consider alternative dates.",
    },
  },
  payslip_issued: {
    employee: {
      first_name: "John",
      last_name: "Smith",
      email: "john.smith@company.com",
      salary: 5000,
      net_salary: 3500,
    },
    customFields: {
      pay_period: "January 2026",
      net_pay: "3,500.00",
      gross_pay: "5,000.00",
      total_deductions: "1,500.00",
      total_earnings: "5,000.00",
    },
  },
};

// Helper to replace custom email-specific fields
function replaceCustomFields(content: string, customFields?: Record<string, string>): string {
  if (!customFields) return content;
  
  let result = content;
  for (const [field, value] of Object.entries(customFields)) {
    // Convert field name to tag format (e.g., leave_type -> <<Leave Type>>)
    const tagName = field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Replace both plain and HTML-encoded versions
    const plainPattern = new RegExp(`<<${tagName}>>`, 'gi');
    const encodedPattern = new RegExp(`&lt;&lt;${tagName}&gt;&gt;`, 'gi');
    result = result.replace(plainPattern, value).replace(encodedPattern, value);
  }
  
  return result;
}

export function EmailTemplatePreview({ templateType, subject, bodyContent }: EmailTemplatePreviewProps) {
  const { settings } = useCompanySettings();
  const { data: smartTags } = useActiveSmartTags();
  
  const sampleData = sampleRenderData[templateType] || { employee: { first_name: "John", last_name: "Smith" } };
  
  // Add company data from settings - access nested branding and address objects
  const renderData: RenderData = useMemo(() => ({
    ...sampleData,
    company: {
      name: settings.name || "Company",
      email: settings.email || "info@company.com",
      phone: settings.phone || "+973 17000342",
      logo_url: settings.branding?.logoUrl,
      document_logo_url: settings.branding?.documentLogoUrl,
      address_city: settings.address?.city,
      address_country: settings.address?.country,
      website: settings.website,
    },
  }), [sampleData, settings]);
  
  // Process templates using the shared renderer
  const processedSubject = useMemo(() => {
    let result = renderTemplate(subject, renderData, smartTags || []);
    result = replaceCustomFields(result, sampleData.customFields);
    return result;
  }, [subject, renderData, smartTags, sampleData.customFields]);
  
  const processedBody = useMemo(() => {
    let result = renderTemplate(bodyContent, renderData, smartTags || []);
    result = replaceCustomFields(result, sampleData.customFields);
    return result;
  }, [bodyContent, renderData, smartTags, sampleData.customFields]);
  
  const companyName = settings.name || "Company";
  const companyLogo = settings.branding?.documentLogoUrl || settings.branding?.logoUrl;
  const companyPhone = settings.phone || "+973 17000342";
  const companyWebsite = settings.website || "www.company.com";
  const companyEmail = settings.email || "info@company.com";
  const companyAddress = settings.address?.city && settings.address?.country 
    ? `${settings.address.city}, ${settings.address.country}` 
    : "City, Country";

  // Determine header gradient based on template type
  const getGradient = () => {
    if (templateType === "leave_request_approved") {
      return "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)";
    }
    if (templateType === "leave_request_rejected") {
      return "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    }
    return "linear-gradient(135deg, #804EEC 0%, #6B3FD4 100%)";
  };

  return (
    <div className="space-y-4">
      {/* Subject Preview */}
      <div className="bg-muted/30 rounded-lg p-3 border">
        <p className="text-xs text-muted-foreground mb-1">Subject:</p>
        <p className="font-medium">{processedSubject}</p>
      </div>

      {/* Email Preview */}
      <div className="bg-[#f4f4f5] rounded-lg p-4 sm:p-6">
        <div className="max-w-[600px] mx-auto">
          {/* Email Header */}
          <div 
            className="rounded-t-xl p-6"
            style={{ background: getGradient() }}
          >
            <div className="flex items-center gap-3">
              {companyLogo ? (
                <img 
                  src={companyLogo} 
                  alt={companyName} 
                  className="h-[45px] max-w-[150px] object-contain"
                />
              ) : (
                <div className="w-[45px] h-[45px] bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {companyName.charAt(0)}
                </div>
              )}
              <span className="text-white text-xl font-semibold">{companyName}</span>
            </div>
          </div>

          {/* Email Body */}
          <div 
            className="bg-white p-6"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(processedBody) }}
          />

          {/* Email Footer */}
          <div className="bg-[#f9fafb] p-6 rounded-b-xl border-t text-center">
            <p className="text-[#18181b] font-semibold text-sm mb-2">{companyName}</p>
            <p className="text-[#71717a] text-xs mb-1">{companyAddress}</p>
            <p className="text-[#71717a] text-xs mb-3">
              <a href={`tel:${companyPhone.replace(/\s/g, "")}`} className="text-[#71717a] no-underline">
                {companyPhone}
              </a>
              {" | "}
              <a href={`mailto:${companyEmail}`} className="text-primary no-underline">
                {companyEmail}
              </a>
            </p>
            <a href={`https://${companyWebsite}`} className="text-primary text-xs font-medium no-underline">
              {companyWebsite}
            </a>
            <hr className="border-[#e5e7eb] my-4" />
            <p className="text-[#a1a1aa] text-[11px] leading-relaxed">
              This is an automated notification from {companyName}.<br />
              Please do not reply directly to this email.
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        This preview uses sample data. Actual emails will contain real employee information.
      </p>
    </div>
  );
}
