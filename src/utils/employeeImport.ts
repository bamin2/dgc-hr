import { TablesInsert } from "@/integrations/supabase/types";

export interface ParsedEmployee {
  employmentNumber: string;
  employeeName: string;
  hiringDate: string;
  birthDate: string;
  nationality: string;
  gender: string;
  email: string;
  phoneNumber: string;
  mobileNumber: string;
  position: string;
  workLocation: string;
  department: string;
  workType: string;
  directManager: string;
  status: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MappedEmployee {
  parsed: ParsedEmployee;
  validation: ValidationResult;
  dbRecord: TablesInsert<"employees"> | null;
}

// Result of duplicate email validation
export interface DuplicateEmailResult {
  duplicatesInDb: string[];
  duplicatesInFile: { email: string; rows: number[] }[];
}

// Parse CSV content into rows
export function parseCSV(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

// Map CSV headers to our expected format
const HEADER_MAP: Record<string, keyof ParsedEmployee> = {
  'employment number': 'employmentNumber',
  'employee name': 'employeeName',
  'hiring date': 'hiringDate',
  'birth date': 'birthDate',
  'nationality': 'nationality',
  'gender': 'gender',
  'email': 'email',
  'phone number': 'phoneNumber',
  'mobile number': 'mobileNumber',
  'position': 'position',
  'work location': 'workLocation',
  'department': 'department',
  'work type': 'workType',
  'direct manager': 'directManager',
  'current employee status': 'status',
};

// Parse CSV rows into ParsedEmployee objects
export function parseCSVToEmployees(rows: string[][]): ParsedEmployee[] {
  if (rows.length < 2) return [];
  
  const headers = rows[0].map(h => h.toLowerCase().trim());
  const headerIndices: Record<keyof ParsedEmployee, number> = {} as any;
  
  headers.forEach((header, index) => {
    const mappedKey = HEADER_MAP[header];
    if (mappedKey) {
      headerIndices[mappedKey] = index;
    }
  });
  
  return rows.slice(1).map(row => ({
    employmentNumber: row[headerIndices.employmentNumber] || '',
    employeeName: row[headerIndices.employeeName] || '',
    hiringDate: row[headerIndices.hiringDate] || '',
    birthDate: row[headerIndices.birthDate] || '',
    nationality: row[headerIndices.nationality] || '',
    gender: row[headerIndices.gender] || '',
    email: row[headerIndices.email] || '',
    phoneNumber: row[headerIndices.phoneNumber] || '',
    mobileNumber: row[headerIndices.mobileNumber] || '',
    position: row[headerIndices.position] || '',
    workLocation: row[headerIndices.workLocation] || '',
    department: row[headerIndices.department] || '',
    workType: row[headerIndices.workType] || '',
    directManager: row[headerIndices.directManager] || '',
    status: row[headerIndices.status] || '',
  }));
}

// Parse name into first and last name
export function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

// Parse date from various formats (e.g., "Sep 03, 2017", "Jan 01 2024")
export function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  return null;
}

// Map status to database enum
function mapStatus(status: string): "active" | "on_leave" | "on_boarding" | "probation" | "terminated" {
  const normalized = status.toLowerCase().trim();
  switch (normalized) {
    case 'active': return 'active';
    case 'terminated': return 'terminated';
    case 'on leave': return 'on_leave';
    case 'probation': return 'probation';
    case 'onboarding':
    case 'on boarding': return 'on_boarding';
    default: return 'active';
  }
}

// Map gender to database enum
function mapGender(gender: string): "male" | "female" | null {
  const normalized = gender.toLowerCase().trim();
  if (normalized === 'male') return 'male';
  if (normalized === 'female') return 'female';
  return null;
}

// Map work type to database enum
function mapWorkType(workType: string): "full_time" | "part_time" | "contract" | null {
  const normalized = workType.toLowerCase().trim();
  switch (normalized) {
    case 'full time':
    case 'full-time':
    case 'fulltime': return 'full_time';
    case 'part time':
    case 'part-time':
    case 'parttime': return 'part_time';
    case 'contract': return 'contract';
    case 'intern':
    case 'internship': return 'contract'; // Map intern to contract as intern isn't in enum
    default: return null;
  }
}

// Validate email format
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Check for duplicate emails against database and within file
export function checkDuplicateEmails(
  parsedEmployees: ParsedEmployee[],
  existingEmails: string[]
): DuplicateEmailResult {
  const existingEmailsLower = existingEmails.map(e => e.toLowerCase());
  const duplicatesInDb: string[] = [];
  const emailRowMap: Record<string, number[]> = {};
  
  parsedEmployees.forEach((emp, index) => {
    const email = emp.email.toLowerCase().trim();
    if (!email) return;
    
    // Check against database
    if (existingEmailsLower.includes(email) && !duplicatesInDb.includes(email)) {
      duplicatesInDb.push(email);
    }
    
    // Track occurrences in file
    if (!emailRowMap[email]) {
      emailRowMap[email] = [];
    }
    emailRowMap[email].push(index + 1); // 1-indexed row
  });
  
  // Find duplicates within file
  const duplicatesInFile = Object.entries(emailRowMap)
    .filter(([, rows]) => rows.length > 1)
    .map(([email, rows]) => ({ email, rows }));
  
  return { duplicatesInDb, duplicatesInFile };
}

// Validate a parsed employee row
export function validateEmployee(
  parsed: ParsedEmployee,
  existingEmails: string[] = [],
  emailsInCurrentBatch: string[] = []
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  if (!parsed.employeeName.trim()) {
    errors.push('Employee name is required');
  }
  if (!parsed.email.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(parsed.email)) {
    errors.push('Invalid email format');
  } else {
    const emailLower = parsed.email.toLowerCase().trim();
    
    // Check against database
    if (existingEmails.map(e => e.toLowerCase()).includes(emailLower)) {
      errors.push('Email already exists in database');
    }
    
    // Check against current batch (earlier rows)
    if (emailsInCurrentBatch.map(e => e.toLowerCase()).includes(emailLower)) {
      errors.push('Duplicate email in this file');
    }
  }
  
  // Warnings for optional but recommended fields
  if (!parsed.department.trim()) {
    warnings.push('No department specified');
  }
  if (!parsed.position.trim()) {
    warnings.push('No position specified');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Map parsed employee to database insert format
export function mapToDbEmployee(
  parsed: ParsedEmployee,
  departments: { id: string; name: string }[],
  positions: { id: string; title: string }[],
  existingEmployees: { id: string; first_name: string; last_name: string }[]
): TablesInsert<"employees"> | null {
  const { firstName, lastName } = parseName(parsed.employeeName);
  
  if (!firstName || !parsed.email) return null;
  
  // Find department by name
  const department = departments.find(
    d => d.name.toLowerCase() === parsed.department.toLowerCase().trim()
  );
  
  // Find position by title
  const position = positions.find(
    p => p.title.toLowerCase() === parsed.position.toLowerCase().trim()
  );
  
  // Find manager by name
  let managerId: string | null = null;
  if (parsed.directManager) {
    const managerName = parsed.directManager.toLowerCase().trim();
    const manager = existingEmployees.find(e => 
      `${e.first_name} ${e.last_name}`.toLowerCase() === managerName
    );
    if (manager) {
      managerId = manager.id;
    }
  }
  
  return {
    employee_code: parsed.employmentNumber || null,
    first_name: firstName,
    last_name: lastName || '',
    email: parsed.email.trim(),
    phone: parsed.phoneNumber || parsed.mobileNumber || null,
    join_date: parseDate(parsed.hiringDate),
    date_of_birth: parseDate(parsed.birthDate),
    nationality: parsed.nationality || null,
    gender: mapGender(parsed.gender),
    department_id: department?.id || null,
    position_id: position?.id || null,
    manager_id: managerId,
    work_location: parsed.workLocation || null,
    employment_type: mapWorkType(parsed.workType),
    status: mapStatus(parsed.status),
  };
}

// Generate CSV template
export function generateCSVTemplate(): string {
  const headers = [
    'Employment Number',
    'Employee Name',
    'Hiring Date',
    'Birth Date',
    'Nationality',
    'Gender',
    'Email',
    'Phone Number',
    'Mobile Number',
    'Position',
    'Work Location',
    'Department',
    'Work Type',
    'Direct Manager',
    'Current Employee Status',
  ];
  
  const sampleRow = [
    'EMP001',
    'John Doe',
    'Jan 01, 2024',
    'Mar 15, 1990',
    'United States',
    'Male',
    'john.doe@company.com',
    '123-456-7890',
    '098-765-4321',
    'Software Engineer',
    'New York Office',
    'Engineering',
    'Full Time',
    'Jane Smith',
    'Active',
  ];
  
  return [headers.join(','), sampleRow.join(',')].join('\n');
}

export function downloadCSVTemplate() {
  const content = generateCSVTemplate();
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'employee_import_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
