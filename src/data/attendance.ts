import { mockEmployees as employees } from './employees';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'present' | 'absent' | 'late' | 'on_leave' | 'half_day';
  workHours: number;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid';
  startDate: string;
  endDate: string;
  totalDays: number;
  isHalfDay: boolean;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface LeaveBalance {
  employeeId: string;
  annual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  personal: { total: number; used: number; remaining: number };
}

// Generate attendance records for the current month
const generateAttendanceRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  employees.forEach((employee) => {
    for (let day = 1; day <= today.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends
      
      const random = Math.random();
      let status: AttendanceRecord['status'];
      let checkIn: string | null = null;
      let checkOut: string | null = null;
      let workHours = 0;

      if (random < 0.75) {
        status = 'present';
        checkIn = `0${8 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
        checkOut = `${17 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
        workHours = 8 + Math.random() * 2;
      } else if (random < 0.85) {
        status = 'late';
        checkIn = `${9 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
        checkOut = `${17 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
        workHours = 7 + Math.random();
      } else if (random < 0.92) {
        status = 'on_leave';
      } else if (random < 0.96) {
        status = 'half_day';
        checkIn = '09:00';
        checkOut = '13:00';
        workHours = 4;
      } else {
        status = 'absent';
      }

      records.push({
        id: `att-${employee.id}-${date.toISOString().split('T')[0]}`,
        employeeId: employee.id,
        date: date.toISOString().split('T')[0],
        checkIn,
        checkOut,
        status,
        workHours: Math.round(workHours * 10) / 10,
      });
    }
  });

  return records;
};

export const attendanceRecords: AttendanceRecord[] = generateAttendanceRecords();

export const leaveRequests: LeaveRequest[] = [
  {
    id: 'leave-001',
    employeeId: '1',
    leaveType: 'annual',
    startDate: '2024-01-15',
    endDate: '2024-01-19',
    totalDays: 5,
    isHalfDay: false,
    reason: 'Family vacation to visit relatives abroad',
    status: 'approved',
    approvedBy: 'HR Manager',
    approvedDate: '2024-01-10',
    createdAt: '2024-01-08',
  },
  {
    id: 'leave-002',
    employeeId: '2',
    leaveType: 'sick',
    startDate: '2024-01-22',
    endDate: '2024-01-23',
    totalDays: 2,
    isHalfDay: false,
    reason: 'Medical appointment and recovery',
    status: 'approved',
    approvedBy: 'Department Head',
    approvedDate: '2024-01-21',
    createdAt: '2024-01-20',
  },
  {
    id: 'leave-003',
    employeeId: '3',
    leaveType: 'personal',
    startDate: '2024-02-01',
    endDate: '2024-02-01',
    totalDays: 1,
    isHalfDay: true,
    reason: 'Personal errand - bank appointment',
    status: 'pending',
    createdAt: '2024-01-25',
  },
  {
    id: 'leave-004',
    employeeId: '4',
    leaveType: 'annual',
    startDate: '2024-02-12',
    endDate: '2024-02-16',
    totalDays: 5,
    isHalfDay: false,
    reason: 'Wedding anniversary trip',
    status: 'pending',
    createdAt: '2024-01-28',
  },
  {
    id: 'leave-005',
    employeeId: '5',
    leaveType: 'maternity',
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    totalDays: 90,
    isHalfDay: false,
    reason: 'Maternity leave',
    status: 'approved',
    approvedBy: 'HR Director',
    approvedDate: '2024-02-15',
    createdAt: '2024-02-01',
  },
  {
    id: 'leave-006',
    employeeId: '6',
    leaveType: 'sick',
    startDate: '2024-01-29',
    endDate: '2024-01-30',
    totalDays: 2,
    isHalfDay: false,
    reason: 'Flu symptoms',
    status: 'rejected',
    rejectionReason: 'Insufficient sick leave balance',
    createdAt: '2024-01-28',
  },
  {
    id: 'leave-007',
    employeeId: '7',
    leaveType: 'unpaid',
    startDate: '2024-02-05',
    endDate: '2024-02-09',
    totalDays: 5,
    isHalfDay: false,
    reason: 'Extended personal leave for family matters',
    status: 'pending',
    createdAt: '2024-01-30',
  },
  {
    id: 'leave-008',
    employeeId: '8',
    leaveType: 'personal',
    startDate: '2024-02-14',
    endDate: '2024-02-14',
    totalDays: 1,
    isHalfDay: false,
    reason: 'House closing appointment',
    status: 'approved',
    approvedBy: 'Team Lead',
    approvedDate: '2024-02-10',
    createdAt: '2024-02-08',
  },
];

export const leaveBalances: LeaveBalance[] = employees.map((employee) => ({
  employeeId: employee.id,
  annual: { 
    total: 20, 
    used: Math.floor(Math.random() * 10), 
    remaining: 20 - Math.floor(Math.random() * 10) 
  },
  sick: { 
    total: 10, 
    used: Math.floor(Math.random() * 5), 
    remaining: 10 - Math.floor(Math.random() * 5) 
  },
  personal: { 
    total: 5, 
    used: Math.floor(Math.random() * 3), 
    remaining: 5 - Math.floor(Math.random() * 3) 
  },
}));

// Get today's attendance summary
export const getTodayAttendanceSummary = () => {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(r => r.date === today);
  
  return {
    present: todayRecords.filter(r => r.status === 'present').length,
    absent: todayRecords.filter(r => r.status === 'absent').length,
    late: todayRecords.filter(r => r.status === 'late').length,
    onLeave: todayRecords.filter(r => r.status === 'on_leave').length,
    halfDay: todayRecords.filter(r => r.status === 'half_day').length,
    total: employees.length,
  };
};

export const getPendingLeaveRequests = () => {
  return leaveRequests.filter(r => r.status === 'pending');
};

export const getLeaveTypeLabel = (type: LeaveRequest['leaveType']) => {
  const labels: Record<LeaveRequest['leaveType'], string> = {
    annual: 'Annual Leave',
    sick: 'Sick Leave',
    personal: 'Personal Leave',
    maternity: 'Maternity Leave',
    paternity: 'Paternity Leave',
    unpaid: 'Unpaid Leave',
  };
  return labels[type];
};
