import { useCompanySettings } from "@/contexts/CompanySettingsContext";

interface EmailTemplatePreviewProps {
  templateType: string;
  subject: string;
  bodyContent: string;
}

// Sample data for preview
const sampleData: Record<string, Record<string, string>> = {
  leave_request_submitted: {
    employeeName: "John Smith",
    leaveType: "Annual Leave",
    startDate: "Monday, Jan 15, 2026",
    endDate: "Wednesday, Jan 17, 2026",
    daysCount: "3",
    reason: "Family vacation to the beach",
  },
  leave_request_approved: {
    employeeName: "John Smith",
    leaveType: "Annual Leave",
    startDate: "Monday, Jan 15, 2026",
    endDate: "Wednesday, Jan 17, 2026",
    daysCount: "3",
    reviewerName: "Sarah Johnson",
  },
  leave_request_rejected: {
    employeeName: "John Smith",
    leaveType: "Annual Leave",
    startDate: "Monday, Jan 15, 2026",
    endDate: "Wednesday, Jan 17, 2026",
    daysCount: "3",
    reviewerName: "Sarah Johnson",
    rejectionReason: "Team coverage is insufficient during this period. Please consider alternative dates.",
  },
  payslip_issued: {
    employeeName: "John Smith",
    payPeriod: "January 2026",
    netPay: "3,500.00",
    currency: "BHD",
  },
};

function replaceVariables(content: string, data: Record<string, string>): string {
  let result = content;
  
  // Replace simple variables {{variableName}}
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  
  // Handle conditional blocks {{#variableName}}...{{/variableName}}
  for (const [key, value] of Object.entries(data)) {
    const conditionalRegex = new RegExp(`\\{\\{#${key}\\}\\}([\\s\\S]*?)\\{\\{\\/${key}\\}\\}`, "g");
    if (value) {
      // If value exists, keep the content but remove the conditional tags
      result = result.replace(conditionalRegex, "$1");
    } else {
      // If value is empty, remove the entire block
      result = result.replace(conditionalRegex, "");
    }
  }
  
  // Remove any remaining conditional blocks for undefined variables
  result = result.replace(/\{{#\w+\}\}[\s\S]*?\{\{\/\w+\}\}/g, "");
  
  return result;
}

export function EmailTemplatePreview({ templateType, subject, bodyContent }: EmailTemplatePreviewProps) {
  const { settings } = useCompanySettings();
  const data = sampleData[templateType] || {};
  
  const processedSubject = replaceVariables(subject, data);
  const processedBody = replaceVariables(bodyContent, data);
  
  const companyName = settings.name || "Company";
  const companyLogo = (settings as any).documentLogoUrl || (settings as any).logoUrl;
  const companyPhone = settings.phone || "+973 17000342";
  const companyWebsite = settings.website || "www.company.com";
  const companyEmail = settings.email || "info@company.com";
  const companyAddress = (settings as any).addressCity && (settings as any).addressCountry 
    ? `${(settings as any).addressCity}, ${(settings as any).addressCountry}` 
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
            dangerouslySetInnerHTML={{ __html: processedBody }}
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
