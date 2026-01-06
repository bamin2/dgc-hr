export interface SmartTag {
  tag: string;
  field: string;
  source: "employee" | "company" | "position" | "department" | "work_location" | "manager" | "system";
  category: string;
  description: string;
}

export const smartTags: SmartTag[] = [
  // Employee fields
  { tag: "<<First Name>>", field: "first_name", source: "employee", category: "Employee", description: "Employee's first name" },
  { tag: "<<Last Name>>", field: "last_name", source: "employee", category: "Employee", description: "Employee's last name" },
  { tag: "<<Full Name>>", field: "full_name", source: "employee", category: "Employee", description: "Employee's full name" },
  { tag: "<<Email>>", field: "email", source: "employee", category: "Employee", description: "Employee's email address" },
  { tag: "<<Phone>>", field: "phone", source: "employee", category: "Employee", description: "Employee's phone number" },
  { tag: "<<Address>>", field: "address", source: "employee", category: "Employee", description: "Employee's address" },
  { tag: "<<Nationality>>", field: "nationality", source: "employee", category: "Employee", description: "Employee's nationality" },
  { tag: "<<Employee Code>>", field: "employee_code", source: "employee", category: "Employee", description: "Employee ID/code" },
  { tag: "<<Date of Birth>>", field: "date_of_birth", source: "employee", category: "Employee", description: "Employee's date of birth" },

  // Employment fields
  { tag: "<<Job Title>>", field: "title", source: "position", category: "Employment", description: "Employee's job title" },
  { tag: "<<Job Description>>", field: "job_description", source: "position", category: "Employment", description: "Job description for the position" },
  { tag: "<<Department>>", field: "name", source: "department", category: "Employment", description: "Employee's department" },
  { tag: "<<Start Date>>", field: "join_date", source: "employee", category: "Employment", description: "Employment start date" },
  { tag: "<<End Date>>", field: "end_date", source: "employee", category: "Employment", description: "Employment end date (for terminations)" },
  { tag: "<<Work Location>>", field: "name", source: "work_location", category: "Employment", description: "Work location name" },
  { tag: "<<Manager Name>>", field: "full_name", source: "manager", category: "Employment", description: "Direct manager's name" },
  { tag: "<<Contract Period>>", field: "contract_period", source: "employee", category: "Employment", description: "Duration of contract" },
  { tag: "<<Probation Period>>", field: "probation_period", source: "employee", category: "Employment", description: "Probation period duration" },
  { tag: "<<Notice Period>>", field: "notice_period", source: "employee", category: "Employment", description: "Required notice period" },

  // Compensation fields
  { tag: "<<Salary>>", field: "salary", source: "employee", category: "Compensation", description: "Monthly salary amount" },
  { tag: "<<Currency>>", field: "currency", source: "work_location", category: "Compensation", description: "Salary currency" },
  { tag: "<<Net Allowances>>", field: "net_allowances", source: "employee", category: "Compensation", description: "Total monthly allowances" },
  { tag: "<<Annual Leave Days>>", field: "annual_leave_days", source: "employee", category: "Compensation", description: "Number of annual leave days" },

  // Company fields
  { tag: "<<Company Logo>>", field: "logo_url", source: "company", category: "Company", description: "Company logo image" },
  { tag: "<<Company Name>>", field: "name", source: "company", category: "Company", description: "Company name" },
  { tag: "<<Company Legal Name>>", field: "legal_name", source: "company", category: "Company", description: "Company legal name" },
  { tag: "<<Company Address>>", field: "full_address", source: "company", category: "Company", description: "Full company address" },
  { tag: "<<Company Email>>", field: "email", source: "company", category: "Company", description: "Company email" },
  { tag: "<<Company Phone>>", field: "phone", source: "company", category: "Company", description: "Company phone number" },

  // Signature fields (for company representative)
  { tag: "<<Signature Title>>", field: "signature_title", source: "system", category: "Signature", description: "Title of the signing authority (e.g., HR Director)" },
  { tag: "<<Signature Name>>", field: "signature_name", source: "system", category: "Signature", description: "Name of the signing authority" },

  // Date fields
  { tag: "<<Current Date>>", field: "current_date", source: "system", category: "Date", description: "Today's date" },
  { tag: "<<Current Year>>", field: "current_year", source: "system", category: "Date", description: "Current year" },
  { tag: "<<Offer Expiry Date>>", field: "offer_expiry_date", source: "system", category: "Date", description: "Date by which offer must be accepted" },
];

export const smartTagCategories = [...new Set(smartTags.map(t => t.category))];

export function getTagsByCategory(category: string): SmartTag[] {
  return smartTags.filter(t => t.category === category);
}
