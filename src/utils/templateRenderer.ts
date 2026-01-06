import { format } from "date-fns";

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
}

export function renderTemplate(template: string, data: RenderData): string {
  let result = template;

  const { employee, position, department, workLocation, manager, company, endDate } = data;

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

  return result;
}
