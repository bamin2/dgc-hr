/**
 * Shared template processor for email templates
 * Replaces smart tags <<Tag Name>> with actual values
 */

export interface TemplateData {
  // Employee fields
  employee?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    nationality?: string;
    employee_code?: string;
    date_of_birth?: string;
    passport_number?: string;
    cpr_number?: string;
    join_date?: string;
    salary?: number;
  };
  
  // Position/Department fields
  position?: {
    title?: string;
    job_description?: string;
  };
  department?: {
    name?: string;
  };
  work_location?: {
    name?: string;
    currency?: string;
  };
  manager?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
  };
  
  // Company fields
  company?: {
    name?: string;
    legal_name?: string;
    email?: string;
    phone?: string;
    website?: string;
    logo_url?: string;
    full_address?: string;
  };
  
  // Leave-specific fields
  leave?: {
    type?: string;
    start_date?: string;
    end_date?: string;
    days_count?: number;
    reason?: string;
    rejection_reason?: string;
    reviewer_name?: string;
  };
  
  // Payroll-specific fields
  payroll?: {
    pay_period?: string;
    pay_period_start?: string;
    pay_period_end?: string;
    gross_pay?: number;
    net_pay?: number;
    total_allowances?: number;
    total_deductions?: number;
  };
  
  // System fields
  system?: {
    current_date?: string;
    current_year?: string;
  };
}

// Tag mapping: <<Tag Name>> -> path in TemplateData
const TAG_MAPPINGS: Record<string, (data: TemplateData) => string | undefined> = {
  // Employee fields
  "<<First Name>>": (d) => d.employee?.first_name,
  "<<Last Name>>": (d) => d.employee?.last_name,
  "<<Full Name>>": (d) => d.employee?.full_name || (d.employee?.first_name && d.employee?.last_name ? `${d.employee.first_name} ${d.employee.last_name}` : undefined),
  "<<Employee Name>>": (d) => d.employee?.full_name || (d.employee?.first_name && d.employee?.last_name ? `${d.employee.first_name} ${d.employee.last_name}` : undefined),
  "<<Email>>": (d) => d.employee?.email,
  "<<Phone>>": (d) => d.employee?.phone,
  "<<Address>>": (d) => d.employee?.address,
  "<<Nationality>>": (d) => d.employee?.nationality,
  "<<Employee Code>>": (d) => d.employee?.employee_code,
  "<<Date of Birth>>": (d) => d.employee?.date_of_birth ? formatDate(d.employee.date_of_birth) : undefined,
  "<<Passport Number>>": (d) => d.employee?.passport_number,
  "<<CPR Number>>": (d) => d.employee?.cpr_number,
  
  // Employment fields
  "<<Job Title>>": (d) => d.position?.title,
  "<<Job Description>>": (d) => d.position?.job_description,
  "<<Department>>": (d) => d.department?.name,
  "<<Start Date>>": (d) => d.employee?.join_date ? formatDate(d.employee.join_date) : undefined,
  "<<Work Location>>": (d) => d.work_location?.name,
  "<<Manager Name>>": (d) => d.manager?.full_name || (d.manager?.first_name && d.manager?.last_name ? `${d.manager.first_name} ${d.manager.last_name}` : undefined),
  "<<Currency>>": (d) => d.work_location?.currency,
  
  // Compensation fields
  "<<Salary>>": (d) => d.employee?.salary ? formatCurrency(d.employee.salary, d.work_location?.currency) : undefined,
  "<<Basic Salary>>": (d) => d.employee?.salary ? formatCurrency(d.employee.salary, d.work_location?.currency) : undefined,
  
  // Company fields
  "<<Company Name>>": (d) => d.company?.name,
  "<<Company Legal Name>>": (d) => d.company?.legal_name,
  "<<Company Email>>": (d) => d.company?.email,
  "<<Company Phone>>": (d) => d.company?.phone,
  "<<Company Address>>": (d) => d.company?.full_address,
  
  // Leave-specific fields
  "<<Leave Type>>": (d) => d.leave?.type,
  "<<Leave Start Date>>": (d) => d.leave?.start_date ? formatDate(d.leave.start_date) : undefined,
  "<<Leave End Date>>": (d) => d.leave?.end_date ? formatDate(d.leave.end_date) : undefined,
  "<<Leave Days Count>>": (d) => d.leave?.days_count?.toString(),
  "<<Leave Reason>>": (d) => d.leave?.reason,
  "<<Rejection Reason>>": (d) => d.leave?.rejection_reason,
  "<<Reviewer Name>>": (d) => d.leave?.reviewer_name,
  
  // Payroll-specific fields
  "<<Pay Period>>": (d) => d.payroll?.pay_period || (d.payroll?.pay_period_start ? formatMonth(d.payroll.pay_period_start) : undefined),
  "<<Gross Pay>>": (d) => d.payroll?.gross_pay !== undefined ? formatCurrency(d.payroll.gross_pay, d.work_location?.currency) : undefined,
  "<<Net Pay>>": (d) => d.payroll?.net_pay !== undefined ? formatCurrency(d.payroll.net_pay, d.work_location?.currency) : undefined,
  "<<Total Allowances>>": (d) => d.payroll?.total_allowances !== undefined ? formatCurrency(d.payroll.total_allowances, d.work_location?.currency) : undefined,
  "<<Total Deductions>>": (d) => d.payroll?.total_deductions !== undefined ? formatCurrency(d.payroll.total_deductions, d.work_location?.currency) : undefined,
  
  // System fields
  "<<Current Date>>": (d) => d.system?.current_date || formatDate(new Date().toISOString()),
  "<<Current Year>>": (d) => d.system?.current_year || new Date().getFullYear().toString(),
};

// Legacy Handlebars-style tag mappings for backward compatibility with seeded templates
const LEGACY_TAG_MAPPINGS: Record<string, (data: TemplateData) => string | undefined> = {
  // Employee fields
  "{{employeeName}}": (d) => d.employee?.full_name || (d.employee?.first_name && d.employee?.last_name ? `${d.employee.first_name} ${d.employee.last_name}` : undefined),
  "{{firstName}}": (d) => d.employee?.first_name,
  "{{lastName}}": (d) => d.employee?.last_name,
  "{{email}}": (d) => d.employee?.email,
  
  // Leave fields
  "{{leaveType}}": (d) => d.leave?.type,
  "{{startDate}}": (d) => d.leave?.start_date ? formatShortDate(d.leave.start_date) : undefined,
  "{{endDate}}": (d) => d.leave?.end_date ? formatShortDate(d.leave.end_date) : undefined,
  "{{daysCount}}": (d) => d.leave?.days_count?.toString(),
  "{{reason}}": (d) => d.leave?.reason,
  "{{reviewerName}}": (d) => d.leave?.reviewer_name,
  "{{rejectionReason}}": (d) => d.leave?.rejection_reason,
  
  // Payroll fields
  "{{payPeriod}}": (d) => d.payroll?.pay_period || (d.payroll?.pay_period_start ? formatMonth(d.payroll.pay_period_start) : undefined),
  "{{netPay}}": (d) => d.payroll?.net_pay !== undefined ? formatCurrency(d.payroll.net_pay, d.work_location?.currency) : undefined,
  "{{grossPay}}": (d) => d.payroll?.gross_pay !== undefined ? formatCurrency(d.payroll.gross_pay, d.work_location?.currency) : undefined,
  "{{currency}}": (d) => d.work_location?.currency || "",
  
  // Company fields
  "{{companyName}}": (d) => d.company?.name,
  "{{companyEmail}}": (d) => d.company?.email,
  
  // System/misc
  "{{portalLink}}": () => "#",
};

/**
 * Format a date string to a readable format
 */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      weekday: "long", 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a date to month/year format
 */
export function formatMonth(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/**
 * Format a short date (e.g., "Jan 15, 2026")
 */
export function formatShortDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a currency value
 */
export function formatCurrency(amount: number, currency?: string): string {
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${formatted}` : formatted;
}

/**
 * Process a template string by replacing smart tags with actual values
 * Supports both new <<Tag Name>> syntax and legacy {{tagName}} syntax
 * @param template The template string with smart tag placeholders
 * @param data The data to use for replacement
 * @returns The processed template string
 */
export function processTemplate(template: string, data: TemplateData): string {
  let result = template;
  
  // Handle conditional sections first {{#fieldName}}...{{/fieldName}}
  result = processConditionalSections(result, data);
  
  // Process legacy Handlebars-style tags ({{tagName}}) for backward compatibility
  for (const [tag, getValue] of Object.entries(LEGACY_TAG_MAPPINGS)) {
    const value = getValue(data);
    if (value !== undefined) {
      // Escape special regex characters in the tag
      const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(escapedTag, "g"), value);
    }
  }
  
  // Process new smart tags (<<Tag Name>>)
  for (const [tag, getValue] of Object.entries(TAG_MAPPINGS)) {
    const value = getValue(data);
    if (value !== undefined) {
      // Escape special regex characters in the tag
      const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(escapedTag, "g"), value);
    }
  }
  
  return result;
}

/**
 * Process conditional sections in the template
 * Syntax: {{#fieldName}}content shown if field exists{{/fieldName}}
 */
function processConditionalSections(template: string, data: TemplateData): string {
  // Match {{#field}}content{{/field}}
  const conditionalRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  
  return template.replace(conditionalRegex, (_match, field, content) => {
    // Check if the field has a value
    const hasValue = checkFieldHasValue(field, data);
    return hasValue ? content : "";
  });
}

/**
 * Check if a field has a truthy value in the data
 */
function checkFieldHasValue(field: string, data: TemplateData): boolean {
  const fieldLower = field.toLowerCase();
  
  // Check common fields
  switch (fieldLower) {
    case "reviewername":
    case "reviewer_name":
      return !!data.leave?.reviewer_name;
    case "rejectionreason":
    case "rejection_reason":
      return !!data.leave?.rejection_reason;
    case "leavereason":
    case "leave_reason":
    case "reason":
      return !!data.leave?.reason;
    case "managername":
    case "manager_name":
      return !!(data.manager?.full_name || (data.manager?.first_name && data.manager?.last_name));
    default:
      return false;
  }
}

/**
 * Convert HTML content to plain text (for email subjects or preview text)
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
