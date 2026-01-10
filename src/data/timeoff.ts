export type TimeOffType = 
  | "paid_time_off" 
  | "sick_leave" 
  | "public_holiday" 
  | "unpaid_leave" 
  | "maternity_leave" 
  | "paternity_leave";

export type LeaveStatus = "approved" | "pending" | "rejected";

export interface LeaveEntry {
  id: string;
  leaveType: TimeOffType;
  dateFrom: Date;
  dateTo: Date;
  duration: number;
  status: LeaveStatus;
  note: string;
}

export interface TimeOffBalance {
  availableDays: number;
  pendingDays: number;
  bookedDays: number;
  usedDays: number;
  contractDays: number;
  nationalHolidays: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: TimeOffType;
  startDate: Date;
  endDate: Date;
}

export const timeOffTypeLabels: Record<TimeOffType, string> = {
  paid_time_off: "Paid time off",
  sick_leave: "Sick leave",
  public_holiday: "Public Holiday",
  unpaid_leave: "Unpaid leave",
  maternity_leave: "Maternity leave",
  paternity_leave: "Paternity leave",
};

export const timeOffTypeColors: Record<TimeOffType, { bg: string; text: string }> = {
  paid_time_off: { bg: "bg-[#C6A45E]/20", text: "text-[#8B7035]" },
  sick_leave: { bg: "bg-slate-200", text: "text-slate-800" },
  public_holiday: { bg: "bg-teal-100", text: "text-teal-800" },
  unpaid_leave: { bg: "bg-amber-100", text: "text-amber-800" },
  maternity_leave: { bg: "bg-rose-100", text: "text-rose-800" },
  paternity_leave: { bg: "bg-teal-100", text: "text-teal-800" },
};

export const mockTimeOffBalance: TimeOffBalance = {
  availableDays: 19,
  pendingDays: 3,
  bookedDays: 3,
  usedDays: 0,
  contractDays: 0,
  nationalHolidays: 24,
};

export const mockLeaveEntries: LeaveEntry[] = [
  {
    id: "1",
    leaveType: "public_holiday",
    dateFrom: new Date(2024, 11, 16),
    dateTo: new Date(2024, 11, 16),
    duration: 1,
    status: "approved",
    note: "Automatic public holiday: Victory Day",
  },
  {
    id: "2",
    leaveType: "public_holiday",
    dateFrom: new Date(2024, 11, 25),
    dateTo: new Date(2024, 11, 25),
    duration: 1,
    status: "approved",
    note: "Automatic public holiday: Christmas Day",
  },
  {
    id: "3",
    leaveType: "public_holiday",
    dateFrom: new Date(2025, 1, 14),
    dateTo: new Date(2025, 1, 14),
    duration: 1,
    status: "approved",
    note: "Automatic public holiday: Shab-e-Barat",
  },
  {
    id: "4",
    leaveType: "public_holiday",
    dateFrom: new Date(2025, 1, 21),
    dateTo: new Date(2025, 1, 21),
    duration: 1,
    status: "approved",
    note: "Automatic public holiday: Language Martyrs' Day",
  },
  {
    id: "5",
    leaveType: "public_holiday",
    dateFrom: new Date(2025, 2, 26),
    dateTo: new Date(2025, 2, 26),
    duration: 1,
    status: "approved",
    note: "Automatic public holiday: Independence Day.",
  },
  {
    id: "6",
    leaveType: "public_holiday",
    dateFrom: new Date(2025, 2, 27),
    dateTo: new Date(2025, 2, 27),
    duration: 1,
    status: "approved",
    note: "Automatic public holiday: Laylat al-Qadr.",
  },
  {
    id: "7",
    leaveType: "public_holiday",
    dateFrom: new Date(2025, 3, 14),
    dateTo: new Date(2025, 3, 14),
    duration: 1,
    status: "approved",
    note: "Automatic public holiday: Bengali New Year's Day",
  },
  {
    id: "8",
    leaveType: "public_holiday",
    dateFrom: new Date(2025, 3, 30),
    dateTo: new Date(2025, 3, 30),
    duration: 1,
    status: "approved",
    note: "Automatic public holiday: Eid-ul-Fitr.",
  },
  {
    id: "9",
    leaveType: "public_holiday",
    dateFrom: new Date(2025, 4, 1),
    dateTo: new Date(2025, 4, 1),
    duration: 1,
    status: "approved",
    note: "Automatic public holiday: Labor Day / Eid-ul-Fitr.",
  },
  {
    id: "10",
    leaveType: "paid_time_off",
    dateFrom: new Date(2024, 10, 14),
    dateTo: new Date(2024, 10, 16),
    duration: 3,
    status: "approved",
    note: "Family vacation",
  },
  {
    id: "11",
    leaveType: "paid_time_off",
    dateFrom: new Date(2024, 10, 20),
    dateTo: new Date(2024, 10, 23),
    duration: 4,
    status: "pending",
    note: "Extended weekend trip",
  },
  {
    id: "12",
    leaveType: "paid_time_off",
    dateFrom: new Date(2024, 10, 24),
    dateTo: new Date(2024, 10, 27),
    duration: 4,
    status: "approved",
    note: "Thanksgiving break",
  },
  {
    id: "13",
    leaveType: "sick_leave",
    dateFrom: new Date(2024, 10, 1),
    dateTo: new Date(2024, 10, 5),
    duration: 5,
    status: "approved",
    note: "Medical appointment",
  },
];

// Calendar events derived from leave entries for current month display
export const mockCalendarEvents: CalendarEvent[] = mockLeaveEntries.map((entry) => ({
  id: entry.id,
  title: timeOffTypeLabels[entry.leaveType],
  type: entry.leaveType,
  startDate: entry.dateFrom,
  endDate: entry.dateTo,
}));
