import { format } from "date-fns";

// Smart tags for DOCX offer letter templates
// Uses <<Tag Name>> format compatible with docxtemplater

export const offerLetterSmartTags = [
  // Candidate
  { tag: "First Name", description: "Candidate's first name" },
  { tag: "Last Name", description: "Candidate's last name" },
  { tag: "Full Name", description: "Candidate's full name" },
  { tag: "Email", description: "Candidate's email address" },
  
  // Position
  { tag: "Job Title", description: "Position title" },
  { tag: "Department", description: "Department name" },
  { tag: "Work Location", description: "Work location name" },
  
  // Compensation
  { tag: "Basic Salary", description: "Base salary amount" },
  { tag: "Housing Allowance", description: "Housing allowance amount" },
  { tag: "Transport Allowance", description: "Transport allowance amount" },
  { tag: "Other Allowances", description: "Other allowances total" },
  { tag: "Gross Salary", description: "Total gross salary" },
  { tag: "Net Salary", description: "Net salary estimate" },
  { tag: "Currency", description: "Currency code (SAR, BHD, etc.)" },
  { tag: "Employer GOSI", description: "Employer GOSI contribution" },
  
  // Company
  { tag: "Company Name", description: "Company name" },
  { tag: "Company Legal Name", description: "Company legal name" },
  
  // Dates
  { tag: "Start Date", description: "Employment start date" },
  { tag: "Current Date", description: "Current date" },
];

export interface OfferVersionForSmartTags {
  currency_code: string | null;
  basic_salary: number | null;
  housing_allowance: number | null;
  transport_allowance: number | null;
  other_allowances: number | null;
  gross_pay_total: number | null;
  net_pay_estimate: number | null;
  employer_gosi_amount: number | null;
  start_date: string | null;
  position?: { title: string } | null;
  department?: { name: string } | null;
  work_location?: { name: string } | null;
}

export interface CandidateForSmartTags {
  first_name: string;
  last_name: string;
  email: string;
}

export interface CompanyForSmartTags {
  name: string | null;
  legal_name: string | null;
}

export function getOfferLetterSmartTagData(
  version: OfferVersionForSmartTags,
  candidate: CandidateForSmartTags,
  company: CompanyForSmartTags
): Record<string, string> {
  const formatNumber = (num: number | null): string => {
    if (num === null || num === undefined) return "0.00";
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "TBD";
    try {
      return format(new Date(dateStr), "MMMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  return {
    // Candidate
    "First Name": candidate.first_name,
    "Last Name": candidate.last_name,
    "Full Name": `${candidate.first_name} ${candidate.last_name}`,
    "Email": candidate.email,
    
    // Position
    "Job Title": version.position?.title || "",
    "Department": version.department?.name || "",
    "Work Location": version.work_location?.name || "",
    
    // Compensation
    "Basic Salary": formatNumber(version.basic_salary),
    "Housing Allowance": formatNumber(version.housing_allowance),
    "Transport Allowance": formatNumber(version.transport_allowance),
    "Other Allowances": formatNumber(version.other_allowances),
    "Gross Salary": formatNumber(version.gross_pay_total),
    "Net Salary": formatNumber(version.net_pay_estimate),
    "Currency": version.currency_code || "SAR",
    "Employer GOSI": formatNumber(version.employer_gosi_amount),
    
    // Company
    "Company Name": company.name || "",
    "Company Legal Name": company.legal_name || company.name || "",
    
    // Dates
    "Start Date": formatDate(version.start_date),
    "Current Date": format(new Date(), "MMMM d, yyyy"),
  };
}
