// Dashboard Card Visibility
export interface DashboardCardVisibility {
  metrics: boolean;
  timeTracker: boolean;
  projectEvaluation: boolean;
  calendarWidget: boolean;
  workHoursChart: boolean;
  dailyTimeLimits: boolean;
  meetingCards: boolean;
  announcements: boolean;
  attendanceOverview: boolean;
}

export const defaultDashboardCardVisibility: DashboardCardVisibility = {
  metrics: true,
  timeTracker: true,
  projectEvaluation: true,
  calendarWidget: true,
  workHoursChart: true,
  dailyTimeLimits: true,
  meetingCards: true,
  announcements: true,
  attendanceOverview: true,
};

// Company Settings
export interface CompanySettings {
  id: string;
  name: string;
  legalName: string;
  industry: string;
  companySize: string;
  taxId: string;
  yearFounded: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  branding: {
    logoUrl: string; // Legacy - kept for backward compatibility
    documentLogoUrl: string; // Logo for generated documents (payslips, offer letters, etc.)
    emailLogoUrl: string; // Logo for email templates
    dashboardDisplayType: 'logo' | 'icon';
    dashboardIconName: string;
    primaryColor: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    weekendDays: number[]; // 0=Sunday, 1=Monday, ..., 5=Friday, 6=Saturday
    reportingCurrency?: string; // Currency for consolidated reporting (default: BHD)
  };
  payrollDayOfMonth: number; // Day of month when payroll is processed (1-31)
  dashboardCardVisibility?: DashboardCardVisibility;
  // Employee self-service settings
  employeeCanViewCompensation?: boolean;
  showCompensationLineItems?: boolean;
}

// Employee Table Columns Configuration
export const employeeTableColumns = [
  { id: 'name', label: 'Employee Name', required: true },
  { id: 'email', label: 'Email Address', required: false },
  { id: 'department', label: 'Department', required: false },
  { id: 'jobTitle', label: 'Job Title', required: false },
  { id: 'joinDate', label: 'Joined Date', required: false },
  { id: 'status', label: 'Status', required: false },
] as const;

export type EmployeeTableColumnId = typeof employeeTableColumns[number]['id'];

export const defaultEmployeeTableColumns: EmployeeTableColumnId[] = 
  ['name', 'email', 'department', 'jobTitle', 'joinDate', 'status'];

// User Preferences
export interface UserPreferences {
  userId: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
    jobTitle: string;
  };
  display: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    defaultPage: string;
    itemsPerPage: number;
    compactMode: boolean;
    employeeTableColumns: EmployeeTableColumnId[];
  };
  regional: {
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    firstDayOfWeek: 'sunday' | 'monday';
  };
}

// Notification Settings
export interface NotificationSettings {
  email: {
    newEmployee: boolean;
    leaveSubmissions: boolean;
    leaveApprovals: boolean;
    payrollReminders: boolean;
    documentExpiration: boolean;
    systemAnnouncements: boolean;
    weeklySummary: boolean;
  };
  push: {
    enabled: boolean;
    newLeaveRequests: boolean;
    urgentApprovals: boolean;
    payrollDeadlines: boolean;
    systemUpdates: boolean;
  };
  schedule: {
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    weekendNotifications: boolean;
  };
}


// Security Session
export interface SecuritySession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

// Mock Data
export const companySettings: CompanySettings = {
  id: 'company-1',
  name: 'Franfer Technologies',
  legalName: 'Franfer Technologies Inc.',
  industry: 'Technology',
  companySize: '51-200',
  taxId: '12-3456789',
  yearFounded: '2018',
  email: 'contact@franfer.com',
  phone: '+1 (555) 123-4567',
  website: 'https://franfer.com',
  address: {
    street: '123 Innovation Drive',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States'
  },
  branding: {
    logoUrl: '/placeholder.svg',
    documentLogoUrl: '',
    emailLogoUrl: '',
    dashboardDisplayType: 'logo',
    dashboardIconName: 'Building2',
    primaryColor: '#C6A45E',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    weekendDays: [5, 6], // Friday-Saturday
    reportingCurrency: 'BHD',
  },
  payrollDayOfMonth: 25,
  employeeCanViewCompensation: true,
  showCompensationLineItems: false,
};

export const userPreferences: UserPreferences = {
  userId: 'user-1',
  profile: {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@franfer.com',
    phone: '+1 (555) 987-6543',
    avatar: '/placeholder.svg',
    jobTitle: 'HR Manager'
  },
  display: {
    language: 'en',
    theme: 'system',
    defaultPage: 'dashboard',
    itemsPerPage: 25,
    compactMode: false,
    employeeTableColumns: defaultEmployeeTableColumns,
  },
  regional: {
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 'sunday'
  }
};

export const notificationSettings: NotificationSettings = {
  email: {
    newEmployee: true,
    leaveSubmissions: true,
    leaveApprovals: true,
    payrollReminders: true,
    documentExpiration: true,
    systemAnnouncements: true,
    weeklySummary: false
  },
  push: {
    enabled: true,
    newLeaveRequests: true,
    urgentApprovals: true,
    payrollDeadlines: true,
    systemUpdates: false
  },
  schedule: {
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    weekendNotifications: false
  }
};


export const securitySessions: SecuritySession[] = [
  {
    id: 'session-1',
    device: 'MacBook Pro',
    browser: 'Chrome 120',
    location: 'San Francisco, CA',
    ipAddress: '192.168.1.100',
    lastActive: '2024-01-15T14:30:00Z',
    isCurrent: true
  },
  {
    id: 'session-2',
    device: 'iPhone 15',
    browser: 'Safari Mobile',
    location: 'San Francisco, CA',
    ipAddress: '192.168.1.101',
    lastActive: '2024-01-15T12:00:00Z',
    isCurrent: false
  },
  {
    id: 'session-3',
    device: 'Windows PC',
    browser: 'Firefox 121',
    location: 'Oakland, CA',
    ipAddress: '192.168.2.50',
    lastActive: '2024-01-14T09:00:00Z',
    isCurrent: false
  }
];

export const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Real Estate',
  'Consulting',
  'Media',
  'Other'
];

export const companySizes = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+'
];

export const timezones = [
  // UTC/GMT
  { value: 'UTC', label: '(GMT+0) UTC' },
  
  // Americas
  { value: 'Pacific/Midway', label: '(GMT-11) Midway Island' },
  { value: 'Pacific/Honolulu', label: '(GMT-10) Hawaii' },
  { value: 'America/Anchorage', label: '(GMT-9) Alaska' },
  { value: 'America/Los_Angeles', label: '(GMT-8) Pacific Time (US & Canada)' },
  { value: 'America/Phoenix', label: '(GMT-7) Arizona' },
  { value: 'America/Denver', label: '(GMT-7) Mountain Time (US & Canada)' },
  { value: 'America/Chicago', label: '(GMT-6) Central Time (US & Canada)' },
  { value: 'America/Mexico_City', label: '(GMT-6) Mexico City' },
  { value: 'America/New_York', label: '(GMT-5) Eastern Time (US & Canada)' },
  { value: 'America/Bogota', label: '(GMT-5) Bogota, Lima' },
  { value: 'America/Caracas', label: '(GMT-4) Caracas' },
  { value: 'America/Halifax', label: '(GMT-4) Atlantic Time (Canada)' },
  { value: 'America/Santiago', label: '(GMT-4) Santiago' },
  { value: 'America/St_Johns', label: '(GMT-3:30) Newfoundland' },
  { value: 'America/Sao_Paulo', label: '(GMT-3) Brasilia, São Paulo' },
  { value: 'America/Buenos_Aires', label: '(GMT-3) Buenos Aires' },
  { value: 'Atlantic/South_Georgia', label: '(GMT-2) Mid-Atlantic' },
  { value: 'Atlantic/Azores', label: '(GMT-1) Azores' },
  
  // Europe
  { value: 'Europe/London', label: '(GMT+0) London, Dublin, Lisbon' },
  { value: 'Europe/Paris', label: '(GMT+1) Paris, Berlin, Rome' },
  { value: 'Europe/Amsterdam', label: '(GMT+1) Amsterdam, Brussels' },
  { value: 'Europe/Madrid', label: '(GMT+1) Madrid, Barcelona' },
  { value: 'Europe/Zurich', label: '(GMT+1) Zurich, Geneva' },
  { value: 'Europe/Warsaw', label: '(GMT+1) Warsaw, Prague' },
  { value: 'Europe/Athens', label: '(GMT+2) Athens, Helsinki' },
  { value: 'Europe/Bucharest', label: '(GMT+2) Bucharest' },
  { value: 'Europe/Istanbul', label: '(GMT+3) Istanbul' },
  { value: 'Europe/Moscow', label: '(GMT+3) Moscow, St. Petersburg' },
  
  // Middle East
  { value: 'Asia/Jerusalem', label: '(GMT+2) Jerusalem, Tel Aviv' },
  { value: 'Asia/Beirut', label: '(GMT+2) Beirut' },
  { value: 'Africa/Cairo', label: '(GMT+2) Cairo' },
  { value: 'Asia/Amman', label: '(GMT+3) Amman' },
  { value: 'Asia/Baghdad', label: '(GMT+3) Baghdad' },
  { value: 'Asia/Kuwait', label: '(GMT+3) Kuwait City' },
  { value: 'Asia/Riyadh', label: '(GMT+3) Riyadh, Jeddah' },
  { value: 'Asia/Bahrain', label: '(GMT+3) Bahrain, Manama' },
  { value: 'Asia/Qatar', label: '(GMT+3) Doha, Qatar' },
  { value: 'Asia/Tehran', label: '(GMT+3:30) Tehran' },
  { value: 'Asia/Dubai', label: '(GMT+4) Dubai, Abu Dhabi' },
  { value: 'Asia/Muscat', label: '(GMT+4) Muscat, Oman' },
  
  // Africa
  { value: 'Africa/Johannesburg', label: '(GMT+2) Johannesburg' },
  { value: 'Africa/Lagos', label: '(GMT+1) Lagos, West Africa' },
  { value: 'Africa/Nairobi', label: '(GMT+3) Nairobi, East Africa' },
  
  // Asia
  { value: 'Asia/Karachi', label: '(GMT+5) Karachi, Islamabad' },
  { value: 'Asia/Kolkata', label: '(GMT+5:30) Mumbai, New Delhi' },
  { value: 'Asia/Kathmandu', label: '(GMT+5:45) Kathmandu' },
  { value: 'Asia/Dhaka', label: '(GMT+6) Dhaka, Bangladesh' },
  { value: 'Asia/Yangon', label: '(GMT+6:30) Yangon, Myanmar' },
  { value: 'Asia/Bangkok', label: '(GMT+7) Bangkok, Jakarta' },
  { value: 'Asia/Ho_Chi_Minh', label: '(GMT+7) Ho Chi Minh City' },
  { value: 'Asia/Singapore', label: '(GMT+8) Singapore' },
  { value: 'Asia/Kuala_Lumpur', label: '(GMT+8) Kuala Lumpur' },
  { value: 'Asia/Hong_Kong', label: '(GMT+8) Hong Kong' },
  { value: 'Asia/Shanghai', label: '(GMT+8) Beijing, Shanghai' },
  { value: 'Asia/Taipei', label: '(GMT+8) Taipei' },
  { value: 'Asia/Manila', label: '(GMT+8) Manila' },
  { value: 'Asia/Seoul', label: '(GMT+9) Seoul' },
  { value: 'Asia/Tokyo', label: '(GMT+9) Tokyo, Osaka' },
  
  // Australia & Pacific
  { value: 'Australia/Perth', label: '(GMT+8) Perth' },
  { value: 'Australia/Darwin', label: '(GMT+9:30) Darwin' },
  { value: 'Australia/Adelaide', label: '(GMT+9:30) Adelaide' },
  { value: 'Australia/Brisbane', label: '(GMT+10) Brisbane' },
  { value: 'Australia/Sydney', label: '(GMT+10) Sydney, Melbourne' },
  { value: 'Australia/Hobart', label: '(GMT+10) Hobart, Tasmania' },
  { value: 'Pacific/Guam', label: '(GMT+10) Guam' },
  { value: 'Pacific/Noumea', label: '(GMT+11) New Caledonia' },
  { value: 'Pacific/Auckland', label: '(GMT+12) Auckland, Wellington' },
  { value: 'Pacific/Fiji', label: '(GMT+12) Fiji' },
  { value: 'Pacific/Tongatapu', label: '(GMT+13) Tonga' },
  { value: 'Pacific/Apia', label: '(GMT+13) Samoa' },
  { value: 'Pacific/Kiritimati', label: '(GMT+14) Line Islands' },
];

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' }
];

export const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', flag: '🇶🇦' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', flag: '🇧🇭' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', flag: '🇴🇲' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱' },
];

export const dateFormats = [
  'MM/DD/YYYY',
  'DD/MM/YYYY',
  'YYYY-MM-DD'
];

export const defaultPages = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'employees', label: 'Employees' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'benefits', label: 'Benefits' },
  { value: 'reports', label: 'Reports' }
];
