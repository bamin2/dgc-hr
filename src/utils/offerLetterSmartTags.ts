import { format } from "date-fns";
import type { SmartTag } from "@/types/organization";

// Smart tags for offer letters now come from the database (smart_tags table)
// This file provides the data mapping function to fill templates with actual values

export interface CurrentUserForSmartTags {
  name: string;
  position: string | null;
}

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
  offer_expiry_date?: string | null;
  position?: { title: string; job_description?: string | null } | null;
  department?: { name: string } | null;
  work_location?: { name: string } | null;
  manager?: { first_name: string; last_name: string } | null;
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

/**
 * Strips HTML tags and decodes common HTML entities from a string.
 * Used to convert rich text content to plain text for templates.
 */
const stripHtml = (html: string | null): string => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")      // Remove HTML tags
    .replace(/&nbsp;/g, " ")       // Replace non-breaking spaces
    .replace(/&amp;/g, "&")        // Decode common entities
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")          // Normalize whitespace
    .trim();
};

/**
 * Builds smart tag data for offer letter templates.
 * Maps database smart tag fields to actual offer/candidate/company values.
 * 
 * The keys match the "field" column in the smart_tags table (e.g., "first_name", "job_title")
 * which corresponds to what's between << and >> in templates after stripping spaces.
 */
export function getOfferLetterSmartTagData(
  version: OfferVersionForSmartTags,
  candidate: CandidateForSmartTags,
  company: CompanyForSmartTags,
  smartTags?: SmartTag[],
  currentUser?: CurrentUserForSmartTags
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

  // Calculate total allowances
  const totalAllowances = (version.housing_allowance || 0) + 
    (version.transport_allowance || 0) + 
    (version.other_allowances || 0);

  // Base data mapping - keys match the "field" column in smart_tags table
  // These are the values that will replace <<Tag Name>> in templates
  // docxtemplater uses the text between delimiters as the key
  const baseData: Record<string, string> = {
    // Employee/Candidate info (maps to database field names)
    "first_name": candidate.first_name,
    "last_name": candidate.last_name,
    "full_name": `${candidate.first_name} ${candidate.last_name}`,
    "email": candidate.email,
    
    // Position info - support both database field names and common variations
    "title": version.position?.title || "",
    "job_title": version.position?.title || "",
    "job_description": stripHtml(version.position?.job_description),
    "department": version.department?.name || "",
    "work_location": version.work_location?.name || "",
    
    // Manager info (from the offer version, not the candidate)
    "manager_name": version.manager 
      ? `${version.manager.first_name} ${version.manager.last_name}` 
      : "",
    
    // Compensation
    "basic_salary": formatNumber(version.basic_salary),
    "housing_allowance": formatNumber(version.housing_allowance),
    "transport_allowance": formatNumber(version.transport_allowance),
    "other_allowances": formatNumber(version.other_allowances),
    "net_allowances": formatNumber(totalAllowances),
    "total_allowances": formatNumber(totalAllowances),
    "gross_salary": formatNumber(version.gross_pay_total),
    "net_salary": formatNumber(version.net_pay_estimate),
    "currency": version.currency_code || "SAR",
    "employer_gosi": formatNumber(version.employer_gosi_amount),
    
    // Company
    "company_name": company.name || "",
    "company_legal_name": company.legal_name || company.name || "",
    
    // Dates - support both field names
    "start_date": formatDate(version.start_date),
    "join_date": formatDate(version.start_date),
    "offer_expiry_date": formatDate(version.offer_expiry_date),
    "current_date": format(new Date(), "MMMM d, yyyy"),
    
    // Current user / Signature info (auto-populated from logged-in user)
    "current_user_name": currentUser?.name || "",
    "current_user_position": currentUser?.position || "",
    "signature_name": currentUser?.name || "",
    "signature_title": currentUser?.position || "",
  };

  // If smart tags provided, also map using the tag display names (for backward compatibility)
  // This allows templates to use either <<first_name>> or <<First Name>>
  if (smartTags) {
    smartTags.forEach(tag => {
      // Extract the tag name without delimiters (e.g., "<<First Name>>" -> "First Name")
      const tagName = tag.tag.replace(/^<<|>>$/g, "");
      const fieldValue = baseData[tag.field];
      if (fieldValue !== undefined) {
        baseData[tagName] = fieldValue;
      }
    });
  }

  return baseData;
}
