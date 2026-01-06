import { format, addDays } from "date-fns";

// Helper to replace both plain and HTML-encoded versions of tags
function replaceTag(content: string, tag: string, value: string): string {
  const plainPattern = new RegExp(`<<${tag}>>`, 'g');
  const encodedPattern = new RegExp(`&lt;&lt;${tag}&gt;&gt;`, 'g');
  return content.replace(plainPattern, value).replace(encodedPattern, value);
}

interface EmployeeData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  nationality?: string;
  employee_code?: string;
  date_of_birth?: string;
  join_date?: string;
  salary?: number;
  contract_period?: string;
  probation_period?: string;
  notice_period?: string;
  net_allowances?: number;
  annual_leave_days?: number;
}

interface PositionData {
  title?: string;
  job_description?: string;
}

interface DepartmentData {
  name?: string;
}

interface WorkLocationData {
  name?: string;
  currency?: string;
}

interface ManagerData {
  first_name?: string;
  last_name?: string;
}

interface CompanyData {
  name?: string;
  legal_name?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_country?: string;
  address_zip_code?: string;
}

interface RenderData {
  employee?: EmployeeData;
  position?: PositionData;
  department?: DepartmentData;
  workLocation?: WorkLocationData;
  manager?: ManagerData;
  company?: CompanyData;
  endDate?: string;
  offerExpiryDays?: number;
  signatureTitle?: string;
  signatureName?: string;
}

export function renderTemplate(template: string, data: RenderData): string {
  let result = template;

  const { employee, position, department, workLocation, manager, company, endDate, offerExpiryDays = 7 } = data;

  // Employee fields
  if (employee) {
    result = replaceTag(result, "First Name", employee.first_name || "");
    result = replaceTag(result, "Last Name", employee.last_name || "");
    result = replaceTag(result, "Full Name", `${employee.first_name || ""} ${employee.last_name || ""}`.trim());
    result = replaceTag(result, "Email", employee.email || "");
    result = replaceTag(result, "Phone", employee.phone || "");
    result = replaceTag(result, "Address", employee.address || "");
    result = replaceTag(result, "Nationality", employee.nationality || "");
    result = replaceTag(result, "Employee Code", employee.employee_code || "");
    result = replaceTag(result, "Date of Birth", employee.date_of_birth ? format(new Date(employee.date_of_birth), "MMMM d, yyyy") : "");
    result = replaceTag(result, "Start Date", employee.join_date ? format(new Date(employee.join_date), "MMMM d, yyyy") : "");
    result = replaceTag(result, "Salary", employee.salary?.toLocaleString() || "");
    result = replaceTag(result, "Contract Period", employee.contract_period || "One Year");
    result = replaceTag(result, "Probation Period", employee.probation_period || "3 months");
    result = replaceTag(result, "Notice Period", employee.notice_period || "30 days");
    result = replaceTag(result, "Net Allowances", employee.net_allowances?.toLocaleString() || "0");
    result = replaceTag(result, "Annual Leave Days", employee.annual_leave_days?.toString() || "21");
  }

  // Position fields
  if (position) {
    result = replaceTag(result, "Job Title", position.title || "");
    result = replaceTag(result, "Job Description", position.job_description || "");
  }

  // Department fields
  if (department) {
    result = replaceTag(result, "Department", department.name || "");
  }

  // Work location fields
  if (workLocation) {
    result = replaceTag(result, "Work Location", workLocation.name || "");
    result = replaceTag(result, "Currency", workLocation.currency || "USD");
  }

  // Manager fields
  if (manager) {
    result = replaceTag(result, "Manager Name", `${manager.first_name || ""} ${manager.last_name || ""}`.trim());
  }

  // Company fields
  if (company) {
    result = replaceTag(result, "Company Name", company.name || "");
    result = replaceTag(result, "Company Legal Name", company.legal_name || company.name || "");
    result = replaceTag(result, "Company Email", company.email || "");
    result = replaceTag(result, "Company Phone", company.phone || "");
    
    // Handle company logo - render as image tag for HTML templates
    if (company.logo_url) {
      const logoImg = `<img src="${company.logo_url}" alt="${company.name || 'Company'} Logo" style="max-height: 80px; width: auto;" />`;
      result = replaceTag(result, "Company Logo", logoImg);
    } else {
      result = replaceTag(result, "Company Logo", "");
    }
    
    const addressParts = [
      company.address_street,
      company.address_city,
      company.address_state,
      company.address_zip_code,
      company.address_country
    ].filter(Boolean);
    result = replaceTag(result, "Company Address", addressParts.join(", "));
  }

  // End date (for experience certificates)
  result = replaceTag(result, "End Date", endDate ? format(new Date(endDate), "MMMM d, yyyy") : "Present");

  // Signature fields
  result = replaceTag(result, "Signature Title", data.signatureTitle || "");
  result = replaceTag(result, "Signature Name", data.signatureName || "");

  // System fields
  result = replaceTag(result, "Current Date", format(new Date(), "MMMM d, yyyy"));
  result = replaceTag(result, "Current Year", new Date().getFullYear().toString());
  result = replaceTag(result, "Offer Expiry Date", format(addDays(new Date(), offerExpiryDays), "MMMM d, yyyy"));

  return result;
}
