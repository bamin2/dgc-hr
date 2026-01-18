/**
 * Compliance Snapshot Report Hook
 * Identifies missing/expired documents and GOSI mismatches
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { 
  ComplianceMissingDocRecord,
  ComplianceExpiredDocRecord,
  ComplianceExpiringDocRecord,
  GosiMismatchRecord,
  ComplianceSnapshotSummary,
  CostReportFilters,
} from '@/types/reports';
import { differenceInDays, parseISO, addDays, format } from 'date-fns';

interface DocumentType {
  id: string;
  name: string;
  is_required: boolean;
  requires_expiry: boolean;
}

interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type_id: string;
  document_name: string;
  expiry_date: string | null;
}

interface EmployeeInfo {
  id: string;
  employee_code: string | null;
  first_name: string;
  last_name: string;
  department_id: string | null;
  work_location_id: string | null;
  is_subject_to_gosi: boolean | null;
  gosi_registered_salary: number | null;
  status: string;
  departments?: { name: string } | null;
  work_locations?: { name: string; gosi_enabled: boolean } | null;
}

interface ComplianceSnapshotData {
  missingDocs: ComplianceMissingDocRecord[];
  expiredDocs: ComplianceExpiredDocRecord[];
  expiringDocs: ComplianceExpiringDocRecord[];
  gosiMismatches: GosiMismatchRecord[];
  summary: ComplianceSnapshotSummary;
}

async function fetchComplianceSnapshot(
  filters: CostReportFilters,
  userId: string | undefined,
  isManager: boolean,
  isHrAdmin: boolean,
  effectiveEmployeeId: string | undefined,
  teamMemberIds: string[]
): Promise<ComplianceSnapshotData> {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const expiryWindowDays = filters.expiryWindowDays || 30;
  const expiryWindowEnd = format(addDays(today, expiryWindowDays), 'yyyy-MM-dd');

  // Fetch required document types
  const { data: documentTypes } = await supabase
    .from('document_types')
    .select('id, name, is_required, requires_expiry')
    .eq('is_active', true);

  const requiredDocTypes = (documentTypes || []).filter(
    (dt: DocumentType) => dt.is_required || dt.requires_expiry
  );
  const requiredDocTypeIds = requiredDocTypes.filter((dt: DocumentType) => dt.is_required).map((dt: DocumentType) => dt.id);
  const docTypeMap = new Map((documentTypes || []).map((dt: DocumentType) => [dt.id, dt.name]));

  // Fetch employees based on filters
  let employeeQuery = supabase
    .from('employees')
    .select(`
      id, 
      employee_code, 
      first_name, 
      last_name, 
      department_id, 
      work_location_id, 
      is_subject_to_gosi, 
      gosi_registered_salary, 
      status,
      departments!department_id(name),
      work_locations!work_location_id(name, gosi_enabled)
    `);

  // Apply status filter (default to active)
  const statusFilter = filters.status || 'active';
  if (statusFilter !== 'all') {
    employeeQuery = employeeQuery.eq('status', statusFilter as 'active' | 'on_boarding' | 'on_leave' | 'probation' | 'resigned' | 'terminated');
  }

  if (filters.locationId) {
    employeeQuery = employeeQuery.eq('work_location_id', filters.locationId);
  }

  if (filters.departmentId) {
    employeeQuery = employeeQuery.eq('department_id', filters.departmentId);
  }

  const { data: employees } = await employeeQuery;

  if (!employees || employees.length === 0) {
    return {
      missingDocs: [],
      expiredDocs: [],
      expiringDocs: [],
      gosiMismatches: [],
      summary: { missingDocsCount: 0, expiredDocsCount: 0, expiringDocsCount: 0, gosiMismatchCount: 0 },
    };
  }

  // Apply role-based filtering
  let filteredEmployees = employees as EmployeeInfo[];
  if (!isHrAdmin && isManager && effectiveEmployeeId) {
    filteredEmployees = filteredEmployees.filter(e => teamMemberIds.includes(e.id));
  }

  const employeeIds = filteredEmployees.map(e => e.id);
  const employeeMap = new Map(filteredEmployees.map(e => [e.id, e]));

  // Fetch all employee documents
  const { data: employeeDocs } = await supabase
    .from('employee_documents')
    .select('id, employee_id, document_type_id, document_name, expiry_date')
    .in('employee_id', employeeIds);

  // Build document ownership map
  const employeeDocsByType = new Map<string, Set<string>>();
  const employeeDocsWithExpiry: EmployeeDocument[] = [];

  (employeeDocs || []).forEach((doc: EmployeeDocument) => {
    const key = `${doc.employee_id}:${doc.document_type_id}`;
    if (!employeeDocsByType.has(doc.employee_id)) {
      employeeDocsByType.set(doc.employee_id, new Set());
    }
    employeeDocsByType.get(doc.employee_id)!.add(doc.document_type_id);
    
    if (doc.expiry_date) {
      employeeDocsWithExpiry.push(doc);
    }
  });

  // 1. Find missing required documents
  const missingDocs: ComplianceMissingDocRecord[] = [];
  filteredEmployees.forEach(emp => {
    const empDocs = employeeDocsByType.get(emp.id) || new Set();
    requiredDocTypeIds.forEach(docTypeId => {
      if (!empDocs.has(docTypeId)) {
        missingDocs.push({
          employeeId: emp.id,
          employeeCode: emp.employee_code || '',
          employeeName: `${emp.first_name} ${emp.last_name}`,
          department: emp.departments?.name || 'N/A',
          location: emp.work_locations?.name || 'N/A',
          missingDocumentType: docTypeMap.get(docTypeId) || 'Unknown',
          documentTypeId: docTypeId,
        });
      }
    });
  });

  // 2. Find expired documents
  const expiredDocs: ComplianceExpiredDocRecord[] = [];
  employeeDocsWithExpiry.forEach(doc => {
    if (doc.expiry_date && doc.expiry_date < todayStr) {
      const emp = employeeMap.get(doc.employee_id);
      if (emp) {
        const daysPast = differenceInDays(today, parseISO(doc.expiry_date));
        expiredDocs.push({
          employeeId: doc.employee_id,
          employeeCode: emp.employee_code || '',
          employeeName: `${emp.first_name} ${emp.last_name}`,
          department: emp.departments?.name || 'N/A',
          documentType: docTypeMap.get(doc.document_type_id) || 'Unknown',
          documentName: doc.document_name,
          expiryDate: doc.expiry_date,
          daysPastExpiry: daysPast,
        });
      }
    }
  });

  // Sort expired by days past expiry descending
  expiredDocs.sort((a, b) => b.daysPastExpiry - a.daysPastExpiry);

  // 3. Find expiring soon documents
  const expiringDocs: ComplianceExpiringDocRecord[] = [];
  employeeDocsWithExpiry.forEach(doc => {
    if (doc.expiry_date && doc.expiry_date >= todayStr && doc.expiry_date <= expiryWindowEnd) {
      const emp = employeeMap.get(doc.employee_id);
      if (emp) {
        const daysUntil = differenceInDays(parseISO(doc.expiry_date), today);
        expiringDocs.push({
          employeeId: doc.employee_id,
          employeeCode: emp.employee_code || '',
          employeeName: `${emp.first_name} ${emp.last_name}`,
          department: emp.departments?.name || 'N/A',
          documentType: docTypeMap.get(doc.document_type_id) || 'Unknown',
          documentName: doc.document_name,
          expiryDate: doc.expiry_date,
          daysUntilExpiry: daysUntil,
        });
      }
    }
  });

  // Sort by days until expiry ascending (most urgent first)
  expiringDocs.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  // 4. Find GOSI mismatches
  const gosiMismatches: GosiMismatchRecord[] = [];
  filteredEmployees.forEach(emp => {
    const locationGosiEnabled = emp.work_locations?.gosi_enabled ?? false;
    const isSubjectToGosi = emp.is_subject_to_gosi ?? false;
    const gosiSalary = emp.gosi_registered_salary;

    let issue: string | null = null;

    if (isSubjectToGosi && (gosiSalary === null || gosiSalary <= 0)) {
      issue = 'Subject to GOSI but missing registered salary';
    } else if (locationGosiEnabled && isSubjectToGosi && (gosiSalary === null || gosiSalary <= 0)) {
      issue = 'Location requires GOSI but registered salary is missing';
    } else if (locationGosiEnabled && !isSubjectToGosi) {
      issue = 'Location has GOSI enabled but employee is not marked as subject to GOSI';
    }

    if (issue) {
      gosiMismatches.push({
        employeeId: emp.id,
        employeeCode: emp.employee_code || '',
        employeeName: `${emp.first_name} ${emp.last_name}`,
        department: emp.departments?.name || 'N/A',
        location: emp.work_locations?.name || 'N/A',
        issue,
        isSubjectToGosi,
        gosiRegisteredSalary: gosiSalary,
        locationGosiEnabled,
      });
    }
  });

  const summary: ComplianceSnapshotSummary = {
    missingDocsCount: missingDocs.length,
    expiredDocsCount: expiredDocs.length,
    expiringDocsCount: expiringDocs.length,
    gosiMismatchCount: gosiMismatches.length,
  };

  return {
    missingDocs,
    expiredDocs,
    expiringDocs,
    gosiMismatches,
    summary,
  };
}

/**
 * Hook for Compliance Snapshot Report
 */
export function useComplianceSnapshotReport(filters: CostReportFilters) {
  const { user } = useAuth();
  const { hasRole, isManager, teamMemberIds, effectiveEmployeeId } = useRole();
  const isHrAdmin = hasRole('hr') || hasRole('admin');

  return useQuery({
    queryKey: ['report-compliance-snapshot', filters, user?.id, isManager, isHrAdmin],
    queryFn: () => fetchComplianceSnapshot(
      filters,
      user?.id,
      isManager,
      isHrAdmin,
      effectiveEmployeeId,
      teamMemberIds
    ),
    staleTime: 5 * 60 * 1000,
  });
}
