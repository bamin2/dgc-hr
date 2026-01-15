/**
 * Payslip Template Generator Utility
 * 
 * Handles DOCX template processing and PDF generation for payslips
 */

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { PayslipTemplateSettings } from "@/types/payslip-template";

// Smart tag data interface
export interface PayslipTagData {
  // Employee info
  EMPLOYEE_FIRST_NAME: string;
  EMPLOYEE_LAST_NAME: string;
  EMPLOYEE_FULL_NAME: string;
  EMPLOYEE_CODE: string;
  EMPLOYEE_EMAIL: string;
  EMPLOYEE_DEPARTMENT: string;
  EMPLOYEE_JOB_TITLE: string;
  EMPLOYEE_JOIN_DATE: string;
  
  // Company info
  COMPANY_NAME: string;
  COMPANY_ADDRESS: string;
  COMPANY_LOGO_URL: string;
  
  // Pay period
  PAY_PERIOD_START: string;
  PAY_PERIOD_END: string;
  PAY_PERIOD_MONTH: string;
  PAY_PERIOD_YEAR: string;
  
  // Compensation
  BASE_SALARY: string;
  GROSS_PAY: string;
  NET_PAY: string;
  TOTAL_ALLOWANCES: string;
  TOTAL_DEDUCTIONS: string;
  
  // GOSI
  GOSI_EMPLOYEE_CONTRIBUTION: string;
  GOSI_EMPLOYER_CONTRIBUTION: string;
  
  // Allowances breakdown (dynamic)
  ALLOWANCES: Array<{ name: string; amount: string }>;
  
  // Deductions breakdown (dynamic)
  DEDUCTIONS: Array<{ name: string; amount: string }>;
  
  // Generated info
  GENERATED_DATE: string;
  GENERATED_TIME: string;
  CURRENCY: string;
  
  // Custom fields
  [key: string]: string | Array<{ name: string; amount: string }>;
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number, 
  currencyCode: string = 'BHD', 
  decimals: number = 2
): string {
  const formatted = amount.toFixed(decimals);
  return `${currencyCode} ${formatted}`;
}

/**
 * Format a negative number according to settings
 */
export function formatNegative(
  amount: number, 
  currencyCode: string = 'BHD', 
  decimals: number = 2,
  format: 'minus_prefix' = 'minus_prefix'
): string {
  if (amount >= 0) {
    return formatCurrency(amount, currencyCode, decimals);
  }
  
  switch (format) {
    case 'minus_prefix':
    default:
      return `-${formatCurrency(Math.abs(amount), currencyCode, decimals)}`;
  }
}

/**
 * Download a DOCX template from Supabase storage
 */
export async function downloadTemplate(storagePath: string): Promise<ArrayBuffer> {
  const { data, error } = await supabase.storage
    .from('payslip-templates')
    .download(storagePath);
  
  if (error) throw error;
  
  return await data.arrayBuffer();
}

/**
 * Process a DOCX template with smart tag data
 */
export function processTemplate(
  templateContent: ArrayBuffer,
  tagData: PayslipTagData
): Blob {
  const zip = new PizZip(templateContent);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '<<', end: '>>' },
  });
  
  // Render the document with tag data
  doc.render(tagData);
  
  // Generate the output
  const output = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  
  return output;
}

/**
 * Parse a DOCX template and extract smart tags
 */
export async function extractTags(storagePath: string): Promise<string[]> {
  try {
    const templateContent = await downloadTemplate(storagePath);
    const zip = new PizZip(templateContent);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '<<', end: '>>' },
    });
    
    // Get all tags from the template
    const text = doc.getFullText();
    const tagRegex = /<<([^>]+)>>/g;
    const tags: string[] = [];
    let match;
    
    while ((match = tagRegex.exec(text)) !== null) {
      if (!tags.includes(match[1])) {
        tags.push(match[1]);
      }
    }
    
    return tags;
  } catch (error) {
    console.error('Error extracting tags:', error);
    return [];
  }
}

/**
 * Build tag data from payroll run employee data
 */
export function buildTagData(
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    employee_code: string | null;
    email: string;
    join_date: string | null;
    department?: { name: string } | null;
    position?: { title: string } | null;
  },
  payrollData: {
    base_salary: number;
    gross_salary: number;
    net_salary: number;
    total_allowances: number;
    total_deductions: number;
    gosi_employee?: number;
    gosi_employer?: number;
    allowances?: Array<{ name: string; amount: number }>;
    deductions?: Array<{ name: string; amount: number }>;
  },
  periodStart: string,
  periodEnd: string,
  company: {
    name: string;
    address?: string;
    logo_url?: string;
  },
  currencyCode: string = 'BHD',
  settings: PayslipTemplateSettings
): PayslipTagData {
  const decimals = settings.layout.decimals;
  
  return {
    // Employee info
    EMPLOYEE_FIRST_NAME: employee.first_name,
    EMPLOYEE_LAST_NAME: employee.last_name,
    EMPLOYEE_FULL_NAME: `${employee.first_name} ${employee.last_name}`,
    EMPLOYEE_CODE: employee.employee_code || '',
    EMPLOYEE_EMAIL: employee.email,
    EMPLOYEE_DEPARTMENT: employee.department?.name || '',
    EMPLOYEE_JOB_TITLE: employee.position?.title || '',
    EMPLOYEE_JOIN_DATE: employee.join_date 
      ? format(new Date(employee.join_date), 'dd MMM yyyy') 
      : '',
    
    // Company info
    COMPANY_NAME: company.name,
    COMPANY_ADDRESS: company.address || '',
    COMPANY_LOGO_URL: company.logo_url || '',
    
    // Pay period
    PAY_PERIOD_START: format(new Date(periodStart), 'dd MMM yyyy'),
    PAY_PERIOD_END: format(new Date(periodEnd), 'dd MMM yyyy'),
    PAY_PERIOD_MONTH: format(new Date(periodStart), 'MMMM'),
    PAY_PERIOD_YEAR: format(new Date(periodStart), 'yyyy'),
    
    // Compensation
    BASE_SALARY: formatCurrency(payrollData.base_salary, currencyCode, decimals),
    GROSS_PAY: formatCurrency(payrollData.gross_salary, currencyCode, decimals),
    NET_PAY: formatCurrency(payrollData.net_salary, currencyCode, decimals),
    TOTAL_ALLOWANCES: formatCurrency(payrollData.total_allowances, currencyCode, decimals),
    TOTAL_DEDUCTIONS: formatNegative(-payrollData.total_deductions, currencyCode, decimals),
    
    // GOSI
    GOSI_EMPLOYEE_CONTRIBUTION: formatCurrency(payrollData.gosi_employee || 0, currencyCode, decimals),
    GOSI_EMPLOYER_CONTRIBUTION: formatCurrency(payrollData.gosi_employer || 0, currencyCode, decimals),
    
    // Allowances breakdown
    ALLOWANCES: (payrollData.allowances || []).map(a => ({
      name: a.name,
      amount: formatCurrency(a.amount, currencyCode, decimals),
    })),
    
    // Deductions breakdown
    DEDUCTIONS: (payrollData.deductions || []).map(d => ({
      name: d.name,
      amount: formatNegative(-d.amount, currencyCode, decimals),
    })),
    
    // Generated info
    GENERATED_DATE: format(new Date(), 'dd MMM yyyy'),
    GENERATED_TIME: format(new Date(), 'h:mm a'),
    CURRENCY: currencyCode,
  };
}

/**
 * Upload generated payslip PDF to storage
 */
export async function uploadPayslipPDF(
  pdfBlob: Blob,
  employeeCode: string,
  periodStart: string,
  periodEnd: string
): Promise<string> {
  const year = format(new Date(periodStart), 'yyyy');
  const month = format(new Date(periodStart), 'MM');
  const startDate = format(new Date(periodStart), 'yyyy-MM-dd');
  const endDate = format(new Date(periodEnd), 'yyyy-MM-dd');
  
  const storagePath = `${year}/${month}/${employeeCode}_${startDate}_${endDate}.pdf`;
  
  const { error } = await supabase.storage
    .from('payslips')
    .upload(storagePath, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true,
    });
  
  if (error) throw error;
  
  return storagePath;
}

/**
 * Get list of available smart tags for payslips
 */
export const PAYSLIP_SMART_TAGS = [
  // Employee
  { name: 'EMPLOYEE_FIRST_NAME', category: 'Employee', description: 'Employee first name' },
  { name: 'EMPLOYEE_LAST_NAME', category: 'Employee', description: 'Employee last name' },
  { name: 'EMPLOYEE_FULL_NAME', category: 'Employee', description: 'Employee full name' },
  { name: 'EMPLOYEE_CODE', category: 'Employee', description: 'Employee ID/code' },
  { name: 'EMPLOYEE_EMAIL', category: 'Employee', description: 'Employee email address' },
  { name: 'EMPLOYEE_DEPARTMENT', category: 'Employee', description: 'Department name' },
  { name: 'EMPLOYEE_JOB_TITLE', category: 'Employee', description: 'Job title/position' },
  { name: 'EMPLOYEE_JOIN_DATE', category: 'Employee', description: 'Date of joining' },
  
  // Company
  { name: 'COMPANY_NAME', category: 'Company', description: 'Company name' },
  { name: 'COMPANY_ADDRESS', category: 'Company', description: 'Company address' },
  { name: 'COMPANY_LOGO_URL', category: 'Company', description: 'Company logo URL' },
  
  // Pay Period
  { name: 'PAY_PERIOD_START', category: 'Pay Period', description: 'Period start date' },
  { name: 'PAY_PERIOD_END', category: 'Pay Period', description: 'Period end date' },
  { name: 'PAY_PERIOD_MONTH', category: 'Pay Period', description: 'Pay period month name' },
  { name: 'PAY_PERIOD_YEAR', category: 'Pay Period', description: 'Pay period year' },
  
  // Compensation
  { name: 'BASE_SALARY', category: 'Compensation', description: 'Base/gross salary' },
  { name: 'GROSS_PAY', category: 'Compensation', description: 'Total gross pay' },
  { name: 'NET_PAY', category: 'Compensation', description: 'Net pay after deductions' },
  { name: 'TOTAL_ALLOWANCES', category: 'Compensation', description: 'Total allowances amount' },
  { name: 'TOTAL_DEDUCTIONS', category: 'Compensation', description: 'Total deductions amount' },
  
  // GOSI
  { name: 'GOSI_EMPLOYEE_CONTRIBUTION', category: 'GOSI', description: 'Employee GOSI contribution' },
  { name: 'GOSI_EMPLOYER_CONTRIBUTION', category: 'GOSI', description: 'Employer GOSI contribution' },
  
  // Generated
  { name: 'GENERATED_DATE', category: 'Generated', description: 'Document generation date' },
  { name: 'GENERATED_TIME', category: 'Generated', description: 'Document generation time' },
  { name: 'CURRENCY', category: 'Generated', description: 'Currency code' },
];
