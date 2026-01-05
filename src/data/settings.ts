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
    logoUrl: string;
    primaryColor: string;
    timezone: string;
    dateFormat: string;
    currency: string;
  };
}

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

// Integration
export interface Integration {
  id: string;
  name: string;
  category: 'communication' | 'calendar' | 'accounting' | 'payroll' | 'storage';
  icon: string;
  description: string;
  status: 'connected' | 'disconnected';
  lastSynced?: string;
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
    primaryColor: '#804EEC',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  }
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
    compactMode: false
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

export const integrations: Integration[] = [
  {
    id: 'int-1',
    name: 'Slack',
    category: 'communication',
    icon: 'slack',
    description: 'Team messaging and notifications',
    status: 'connected',
    lastSynced: '2024-01-15T10:30:00Z'
  },
  {
    id: 'int-2',
    name: 'Google Calendar',
    category: 'calendar',
    icon: 'calendar',
    description: 'Sync leave and events',
    status: 'connected',
    lastSynced: '2024-01-15T09:00:00Z'
  },
  {
    id: 'int-3',
    name: 'Microsoft 365',
    category: 'calendar',
    icon: 'microsoft',
    description: 'Email and calendar integration',
    status: 'disconnected'
  },
  {
    id: 'int-4',
    name: 'QuickBooks',
    category: 'accounting',
    icon: 'calculator',
    description: 'Accounting and payroll sync',
    status: 'connected',
    lastSynced: '2024-01-14T16:00:00Z'
  },
  {
    id: 'int-5',
    name: 'Xero',
    category: 'accounting',
    icon: 'file-spreadsheet',
    description: 'Alternative accounting platform',
    status: 'disconnected'
  },
  {
    id: 'int-6',
    name: 'Google Drive',
    category: 'storage',
    icon: 'hard-drive',
    description: 'Document storage and sharing',
    status: 'connected',
    lastSynced: '2024-01-15T11:00:00Z'
  },
  {
    id: 'int-7',
    name: 'Dropbox',
    category: 'storage',
    icon: 'cloud',
    description: 'File storage and backup',
    status: 'disconnected'
  },
  {
    id: 'int-8',
    name: 'ADP',
    category: 'payroll',
    icon: 'wallet',
    description: 'Payroll processing service',
    status: 'disconnected'
  }
];

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
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
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
