import { DbEmployeeBase, extractManagerName } from './core';
import { Employee, TeamMember, TeamMemberStatus } from './types';

// Additional fields that may be present on DbEmployeeBase but aren't in the base type
// These are accessed via type assertion since the actual DB row includes them
type DbEmployeeWithExtras = DbEmployeeBase & {
  second_name?: string | null;
  full_name?: string | null;
};

// Map database record to Employee UI format
export function mapDbEmployeeToEmployee(db: DbEmployeeBase): Employee {
  // The database row includes these fields, access them safely
  const extDb = db as DbEmployeeWithExtras;
  const firstName = db.first_name;
  const lastName = db.last_name;
  const secondName = extDb.second_name || undefined;
  const fullName = extDb.full_name || `${firstName} ${lastName}`.trim();

  return {
    id: db.id,
    firstName,
    secondName,
    lastName,
    fullName,
    email: db.email,
    phone: db.phone || "",
    avatar: db.avatar_url || "",
    department: db.department?.name || "Unknown",
    departmentId: db.department_id || undefined,
    position: db.position?.title || "Unknown",
    positionId: db.position_id || undefined,
    status: db.status as Employee["status"],
    joinDate: db.join_date || new Date().toISOString().split("T")[0],
    employeeId: db.employee_code || db.id.slice(0, 8).toUpperCase(),
    manager: extractManagerName(db.manager),
    managerId: db.manager_id || undefined,
    location: db.location || undefined,
    workLocationId: db.work_location_id || undefined,
    workLocationName: db.work_location?.name || undefined,
    workLocationCountry: db.work_location?.country || undefined,
    salary: db.salary ? Number(db.salary) : undefined,
    address: db.address || undefined,
    dateOfBirth: db.date_of_birth || undefined,
    gender: db.gender || undefined,
    nationality: db.nationality || undefined,
    isSubjectToGosi: db.is_subject_to_gosi || false,
    gosiRegisteredSalary: db.gosi_registered_salary ? Number(db.gosi_registered_salary) : undefined,
    emergencyContact:
      db.emergency_contact_name && db.emergency_contact_phone
        ? {
            name: db.emergency_contact_name,
            relationship: db.emergency_contact_relationship || "",
            phone: db.emergency_contact_phone,
          }
        : undefined,
    bankName: db.bank_name || undefined,
    bankAccountNumber: db.bank_account_number || undefined,
    iban: db.iban || undefined,
    passportNumber: db.passport_number || undefined,
    cprNumber: db.cpr_number || undefined,
  };
}

// Map employee status to team member status
function mapEmployeeStatusToTeamStatus(status: string): TeamMemberStatus {
  switch (status) {
    case 'active': return 'active';
    case 'on_leave': return 'absent';
    case 'on_boarding': return 'onboarding';
    case 'terminated': return 'dismissed';
    case 'probation': return 'active';
    default: return 'active';
  }
}

// Map database record to TeamMember UI format
export function mapDbToTeamMember(db: DbEmployeeBase): TeamMember {
  return {
    id: db.id,
    firstName: db.first_name,
    lastName: db.last_name,
    preferredName: db.preferred_name || undefined,
    email: db.email,
    avatar: db.avatar_url || undefined,
    workerType: (db.worker_type as TeamMember['workerType']) || 'employee',
    country: db.country || undefined,
    startDate: db.join_date || new Date().toISOString().split("T")[0],
    department: db.department?.name || "Unknown",
    departmentId: db.department_id || undefined,
    jobTitle: db.position?.title || "Unknown",
    positionId: db.position_id || undefined,
    employmentType: (db.employment_type as TeamMember['employmentType']) || 'full_time',
    status: mapEmployeeStatusToTeamStatus(db.status),
    managerId: db.manager_id || undefined,
    managerName: extractManagerName(db.manager),
    workLocation: db.work_location?.name || db.location || undefined,
    salary: db.salary ? Number(db.salary) : undefined,
    payFrequency: (db.pay_frequency as TeamMember['payFrequency']) || 'month',
    taxExemptionStatus: db.tax_exemption_status || undefined,
    sendOfferLetter: db.send_offer_letter || false,
    offerLetterTemplate: db.offer_letter_template || undefined,
  };
}
