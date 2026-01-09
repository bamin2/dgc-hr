export interface SourceField {
  field: string;
  label: string;
  description: string;
}

export const SOURCE_FIELDS: Record<string, SourceField[]> = {
  employee: [
    { field: "first_name", label: "First Name", description: "Employee's first name" },
    { field: "last_name", label: "Last Name", description: "Employee's last name" },
    { field: "email", label: "Email", description: "Work email address" },
    { field: "phone", label: "Phone", description: "Phone number" },
    { field: "address", label: "Address", description: "Home address" },
    { field: "nationality", label: "Nationality", description: "Nationality" },
    { field: "employee_code", label: "Employee Code", description: "Unique employee ID" },
    { field: "date_of_birth", label: "Date of Birth", description: "Birth date" },
    { field: "join_date", label: "Join Date", description: "Employment start date" },
    { field: "salary", label: "Salary", description: "Current salary" },
    { field: "basic_salary", label: "Basic Salary", description: "Base salary before allowances" },
    { field: "gross_salary", label: "Gross Salary", description: "Basic salary plus all allowances" },
    { field: "total_allowances", label: "Total Allowances", description: "Sum of all monthly allowances" },
    { field: "net_deductions", label: "Net Deductions", description: "Total deductions including GOSI" },
    { field: "net_salary", label: "Net Salary", description: "Take-home pay after deductions" },
    { field: "employment_type", label: "Employment Type", description: "Full-time, Part-time, etc." },
    { field: "gender", label: "Gender", description: "Gender" },
    { field: "preferred_name", label: "Preferred Name", description: "Preferred display name" },
    { field: "country", label: "Country", description: "Country of residence" },
    { field: "pay_frequency", label: "Pay Frequency", description: "How often employee is paid" },
    { field: "worker_type", label: "Worker Type", description: "Employee or contractor" },
    { field: "passport_number", label: "Passport Number", description: "Passport number" },
    { field: "cpr_number", label: "CPR Number", description: "Civil Personal Registration number" },
  ],
  company: [
    { field: "name", label: "Company Name", description: "Company display name" },
    { field: "legal_name", label: "Legal Name", description: "Registered legal name" },
    { field: "email", label: "Email", description: "Company email" },
    { field: "phone", label: "Phone", description: "Company phone" },
    { field: "logo_url", label: "Logo URL", description: "Company logo image URL" },
    { field: "address_street", label: "Street Address", description: "Street address" },
    { field: "address_city", label: "City", description: "City" },
    { field: "address_state", label: "State/Province", description: "State or province" },
    { field: "address_country", label: "Country", description: "Country" },
    { field: "address_zip_code", label: "ZIP/Postal Code", description: "Postal code" },
    { field: "website", label: "Website", description: "Company website" },
    { field: "tax_id", label: "Tax ID", description: "Tax identification number" },
    { field: "currency", label: "Currency", description: "Default currency" },
    { field: "industry", label: "Industry", description: "Industry sector" },
  ],
  position: [
    { field: "title", label: "Job Title", description: "Position title" },
    { field: "job_description", label: "Job Description", description: "Role description" },
  ],
  department: [
    { field: "name", label: "Department Name", description: "Department name" },
    { field: "description", label: "Description", description: "Department description" },
  ],
  work_location: [
    { field: "name", label: "Location Name", description: "Work location name" },
    { field: "address", label: "Address", description: "Location address" },
    { field: "city", label: "City", description: "City" },
    { field: "country", label: "Country", description: "Country" },
    { field: "currency", label: "Currency", description: "Local currency" },
    { field: "is_remote", label: "Is Remote", description: "Whether location is remote" },
  ],
  manager: [
    { field: "first_name", label: "First Name", description: "Manager's first name" },
    { field: "last_name", label: "Last Name", description: "Manager's last name" },
    { field: "email", label: "Email", description: "Manager's email" },
    { field: "phone", label: "Phone", description: "Manager's phone" },
  ],
  system: [
    { field: "current_date", label: "Current Date", description: "Today's date" },
    { field: "current_year", label: "Current Year", description: "Current year" },
    { field: "offer_expiry_date", label: "Offer Expiry Date", description: "Calculated offer expiry" },
  ],
};

export function getFieldsForSource(source: string): SourceField[] {
  return SOURCE_FIELDS[source] || [];
}
