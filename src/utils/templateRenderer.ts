import { format, addDays } from "date-fns";

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
}

export function renderTemplate(template: string, data: RenderData): string {
  let result = template;

  const { employee, position, department, workLocation, manager, company, endDate, offerExpiryDays = 7 } = data;

  // Employee fields
  if (employee) {
    result = result.replace(/<<First Name>>/g, employee.first_name || "");
    result = result.replace(/<<Last Name>>/g, employee.last_name || "");
    result = result.replace(/<<Full Name>>/g, `${employee.first_name || ""} ${employee.last_name || ""}`.trim());
    result = result.replace(/<<Email>>/g, employee.email || "");
    result = result.replace(/<<Phone>>/g, employee.phone || "");
    result = result.replace(/<<Address>>/g, employee.address || "");
    result = result.replace(/<<Nationality>>/g, employee.nationality || "");
    result = result.replace(/<<Employee Code>>/g, employee.employee_code || "");
    result = result.replace(/<<Date of Birth>>/g, employee.date_of_birth ? format(new Date(employee.date_of_birth), "MMMM d, yyyy") : "");
    result = result.replace(/<<Start Date>>/g, employee.join_date ? format(new Date(employee.join_date), "MMMM d, yyyy") : "");
    result = result.replace(/<<Salary>>/g, employee.salary?.toLocaleString() || "");
    result = result.replace(/<<Contract Period>>/g, employee.contract_period || "One Year");
    result = result.replace(/<<Probation Period>>/g, employee.probation_period || "3 months");
    result = result.replace(/<<Notice Period>>/g, employee.notice_period || "30 days");
    result = result.replace(/<<Net Allowances>>/g, employee.net_allowances?.toLocaleString() || "0");
    result = result.replace(/<<Annual Leave Days>>/g, employee.annual_leave_days?.toString() || "21");
  }

  // Position fields
  if (position) {
    result = result.replace(/<<Job Title>>/g, position.title || "");
  }

  // Department fields
  if (department) {
    result = result.replace(/<<Department>>/g, department.name || "");
  }

  // Work location fields
  if (workLocation) {
    result = result.replace(/<<Work Location>>/g, workLocation.name || "");
    result = result.replace(/<<Currency>>/g, workLocation.currency || "USD");
  }

  // Manager fields
  if (manager) {
    result = result.replace(/<<Manager Name>>/g, `${manager.first_name || ""} ${manager.last_name || ""}`.trim());
  }

  // Company fields
  if (company) {
    result = result.replace(/<<Company Name>>/g, company.name || "");
    result = result.replace(/<<Company Legal Name>>/g, company.legal_name || company.name || "");
    result = result.replace(/<<Company Email>>/g, company.email || "");
    result = result.replace(/<<Company Phone>>/g, company.phone || "");
    
    // Handle company logo - render as image tag for HTML templates
    if (company.logo_url) {
      result = result.replace(/<<Company Logo>>/g, `<img src="${company.logo_url}" alt="${company.name || 'Company'} Logo" style="max-height: 80px; width: auto;" />`);
    } else {
      result = result.replace(/<<Company Logo>>/g, "");
    }
    
    const addressParts = [
      company.address_street,
      company.address_city,
      company.address_state,
      company.address_zip_code,
      company.address_country
    ].filter(Boolean);
    result = result.replace(/<<Company Address>>/g, addressParts.join(", "));
  }

  // End date (for experience certificates)
  result = result.replace(/<<End Date>>/g, endDate ? format(new Date(endDate), "MMMM d, yyyy") : "Present");

  // System fields
  result = result.replace(/<<Current Date>>/g, format(new Date(), "MMMM d, yyyy"));
  result = result.replace(/<<Current Year>>/g, new Date().getFullYear().toString());
  result = result.replace(/<<Offer Expiry Date>>/g, format(addDays(new Date(), offerExpiryDays), "MMMM d, yyyy"));

  return result;
}
