import * as XLSX from 'xlsx';

export interface ParsedLeaveRow {
  rowNumber: number;
  empNo: string;
  empName: string;
  transactionType: string;
  fromDate: string; // ISO date YYYY-MM-DD
  toDate: string;
  receivedOn: string | null; // ISO datetime
  noOfDays: number;
  status: string;
}

export interface LeaveValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  employeeId?: string;
  leaveTypeId?: string;
}

export interface LeaveImportPreviewRow {
  parsed: ParsedLeaveRow;
  validation: LeaveValidationResult;
}

export type LeaveFieldKey =
  | 'empNo'
  | 'empName'
  | 'transactionType'
  | 'fromDate'
  | 'toDate'
  | 'receivedOn'
  | 'noOfDays'
  | 'status';

export interface LeaveColumnMapping {
  empNo: string | null;
  empName: string | null;
  transactionType: string | null;
  fromDate: string | null;
  toDate: string | null;
  receivedOn: string | null;
  noOfDays: string | null;
  status: string | null;
}

export interface RawSheetData {
  headers: string[];
  rows: Record<string, any>[];
}

// Normalize header: remove dots, lowercase, trim, collapse spaces
function normalizeHeader(h: string): string {
  return String(h ?? '')
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const HEADER_MAP: Record<string, LeaveFieldKey> = {
  'emp no': 'empNo',
  'employee no': 'empNo',
  'employee code': 'empNo',
  'emp name': 'empName',
  'employee name': 'empName',
  'employee full name': 'empName',
  'transaction type': 'transactionType',
  'leave type': 'transactionType',
  'from date': 'fromDate',
  'to date': 'toDate',
  'received on': 'receivedOn',
  'no of days': 'noOfDays',
  'number of days': 'noOfDays',
  'days': 'noOfDays',
  'status': 'status',
};

function excelDateToISO(value: any): string | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'number') {
    const d = XLSX.SSF.parse_date_code(value);
    if (!d) return null;
    const iso = `${String(d.y).padStart(4, '0')}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
    return iso;
  }
  const s = String(value).trim();
  if (!s) return null;
  const iso = new Date(s);
  if (!isNaN(iso.getTime())) return iso.toISOString().slice(0, 10);
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    let [, d, mo, y] = m;
    if (y.length === 2) y = '20' + y;
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return null;
}

function excelDateTimeToISO(value: any): string | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === 'number') {
    const d = XLSX.SSF.parse_date_code(value);
    if (!d) return null;
    const dt = new Date(Date.UTC(d.y, d.m - 1, d.d, d.H || 0, d.M || 0, Math.floor(d.S || 0)));
    return dt.toISOString();
  }
  const dateOnly = excelDateToISO(value);
  return dateOnly ? new Date(dateOnly + 'T00:00:00Z').toISOString() : null;
}

/**
 * Read raw sheet contents: headers (in order) + rows keyed by original header.
 */
export function readSheetRaw(buffer: ArrayBuffer): RawSheetData {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true });
  const headerRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headerRow = (headerRows[0] || []) as any[];
  const headers = headerRow.map((h) => String(h ?? '').trim()).filter((h) => h.length > 0);
  return { headers, rows: json };
}

/**
 * Suggest a column mapping from the available headers using normalized matches.
 */
export function suggestMapping(headers: string[]): LeaveColumnMapping {
  const mapping: LeaveColumnMapping = {
    empNo: null,
    empName: null,
    transactionType: null,
    fromDate: null,
    toDate: null,
    receivedOn: null,
    noOfDays: null,
    status: null,
  };
  for (const h of headers) {
    const field = HEADER_MAP[normalizeHeader(h)];
    if (field && !mapping[field]) {
      mapping[field] = h;
    }
  }
  return mapping;
}

/**
 * Get unique non-empty values for a given column across all rows, with row counts.
 */
export function getColumnValueCounts(rows: Record<string, any>[], column: string | null): Map<string, number> {
  const counts = new Map<string, number>();
  if (!column) return counts;
  for (const r of rows) {
    const raw = r[column];
    const s = String(raw ?? '').trim();
    if (!s) continue;
    counts.set(s, (counts.get(s) || 0) + 1);
  }
  return counts;
}

/**
 * Apply a mapping + status filter to raw rows and produce ParsedLeaveRow[].
 * `allowedStatuses` are matched case-insensitively against the mapped Status column value.
 */
export function parseRowsWithMapping(
  rows: Record<string, any>[],
  mapping: LeaveColumnMapping,
  allowedStatuses: string[]
): { rows: ParsedLeaveRow[]; ignoredCount: number; totalCount: number } {
  const allowed = new Set(allowedStatuses.map((s) => s.trim().toLowerCase()));
  const out: ParsedLeaveRow[] = [];
  let ignoredCount = 0;

  rows.forEach((rec, idx) => {
    const get = (field: LeaveFieldKey) => {
      const col = mapping[field];
      return col ? rec[col] : undefined;
    };

    const status = String(get('status') ?? '').trim();
    if (allowed.size > 0 && !allowed.has(status.toLowerCase())) {
      ignoredCount++;
      return;
    }

    const fromDate = excelDateToISO(get('fromDate')) || '';
    const toDate = excelDateToISO(get('toDate')) || '';
    const receivedOn = excelDateTimeToISO(get('receivedOn'));
    const daysRaw = get('noOfDays');
    const noOfDays = typeof daysRaw === 'number'
      ? daysRaw
      : parseFloat(String(daysRaw ?? '0').replace(',', '.'));

    out.push({
      rowNumber: idx + 2,
      empNo: String(get('empNo') ?? '').trim(),
      empName: String(get('empName') ?? '').trim(),
      transactionType: String(get('transactionType') ?? '').trim(),
      fromDate,
      toDate,
      receivedOn,
      noOfDays: isNaN(noOfDays) ? 0 : noOfDays,
      status: status.toLowerCase(),
    });
  });

  return { rows: out, ignoredCount, totalCount: rows.length };
}

interface EmployeeLookup {
  id: string;
  employee_code: string;
}

interface LeaveTypeLookup {
  id: string;
  name: string;
}

export function validateLeaveRow(
  row: ParsedLeaveRow,
  employees: EmployeeLookup[],
  leaveTypes: LeaveTypeLookup[]
): LeaveValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!row.empNo) {
    errors.push('Missing employee code');
  }
  if (!row.transactionType) {
    errors.push('Missing leave type');
  }
  if (!row.fromDate) errors.push('Invalid From Date');
  if (!row.toDate) errors.push('Invalid To Date');
  if (row.fromDate && row.toDate && row.fromDate > row.toDate) {
    errors.push('From Date is after To Date');
  }

  const employee = employees.find(
    (e) => e.employee_code?.toLowerCase() === row.empNo.toLowerCase()
  );
  if (row.empNo && !employee) {
    errors.push(`Unknown employee code: ${row.empNo}`);
  }

  const leaveType = leaveTypes.find(
    (lt) => lt.name?.toLowerCase() === row.transactionType.toLowerCase()
  );
  if (row.transactionType && !leaveType) {
    errors.push(`Unknown leave type: ${row.transactionType}`);
  }

  if (row.noOfDays <= 0) {
    warnings.push('Days count is zero or negative; will compute from dates');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    employeeId: employee?.id,
    leaveTypeId: leaveType?.id,
  };
}

export interface LeaveRequestInsertRecord {
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days_count: number;
  is_half_day: boolean;
  reason: string | null;
  status: 'approved';
  reviewed_by: string | null;
  reviewed_at: string;
  created_at: string;
}

export function buildLeaveInsertRecord(
  row: ParsedLeaveRow,
  validation: LeaveValidationResult,
  reviewerUserId: string | null
): LeaveRequestInsertRecord | null {
  if (!validation.valid || !validation.employeeId || !validation.leaveTypeId) return null;

  let days = row.noOfDays;
  if (days <= 0 && row.fromDate && row.toDate) {
    const start = new Date(row.fromDate);
    const end = new Date(row.toDate);
    days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  const ts = row.receivedOn || new Date().toISOString();

  return {
    employee_id: validation.employeeId,
    leave_type_id: validation.leaveTypeId,
    start_date: row.fromDate,
    end_date: row.toDate,
    days_count: days,
    is_half_day: false,
    reason: null,
    status: 'approved',
    reviewed_by: reviewerUserId,
    reviewed_at: ts,
    created_at: ts,
  };
}
