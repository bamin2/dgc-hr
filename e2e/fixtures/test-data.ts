/**
 * E2E Test Fixtures
 * 
 * Test data and helper functions for Playwright E2E tests.
 * These fixtures provide consistent test scenarios.
 */

// Test user credentials (for authenticated tests)
export const testUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'testpassword123',
    role: 'admin',
  },
  manager: {
    email: 'manager@example.com',
    password: 'testpassword123',
    role: 'manager',
  },
  employee: {
    email: 'employee@example.com',
    password: 'testpassword123',
    role: 'employee',
  },
};

// Test employee data for forms
export const testEmployee = {
  firstName: 'Test',
  lastName: 'Employee',
  email: `test.employee.${Date.now()}@example.com`,
  phone: '+1234567890',
  department: 'Engineering',
  position: 'Software Engineer',
  startDate: new Date().toISOString().split('T')[0],
};

// Test leave request data
export const testLeaveRequest = {
  type: 'Annual Leave',
  startDate: getFutureDate(7),
  endDate: getFutureDate(14),
  reason: 'Vacation with family',
};

// Test payroll data
export const testPayrollRun = {
  periodStart: getFirstDayOfMonth(),
  periodEnd: getLastDayOfMonth(),
  paymentDate: getFutureDate(5),
};

// Helper functions
export function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

export function getFirstDayOfMonth(): string {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().split('T')[0];
}

export function getLastDayOfMonth(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return date.toISOString().split('T')[0];
}

export function generateUniqueEmail(prefix = 'test'): string {
  return `${prefix}.${Date.now()}@example.com`;
}

// Page object helpers
export const selectors = {
  // Common elements
  submitButton: 'button[type="submit"]',
  cancelButton: 'button:has-text("Cancel")',
  saveButton: 'button:has-text("Save")',
  deleteButton: 'button:has-text("Delete")',
  editButton: 'button:has-text("Edit")',
  
  // Navigation
  sidebar: 'aside, [role="navigation"]',
  mainContent: 'main, [role="main"]',
  
  // Form elements
  emailInput: 'input[type="email"], input[name="email"]',
  passwordInput: 'input[type="password"]',
  searchInput: 'input[type="search"], input[placeholder*="search" i]',
  
  // Feedback
  toast: '[role="alert"], .toast, [class*="toast"]',
  errorMessage: '[class*="error"], [role="alert"]',
  successMessage: '[class*="success"]',
  loadingSpinner: '[class*="loading"], [class*="spinner"]',
  
  // Tables
  tableRow: 'tr',
  tableCell: 'td',
  tableHeader: 'th',
  
  // Dialogs
  dialog: '[role="dialog"], [class*="modal"]',
  alertDialog: '[role="alertdialog"]',
};

// Wait for network idle helper
export async function waitForNetworkIdle(page: any, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

// Wait for element and click
export async function clickWhenVisible(page: any, selector: string, timeout = 5000) {
  const element = page.locator(selector).first();
  await element.waitFor({ state: 'visible', timeout });
  await element.click();
}

// Fill form field
export async function fillField(page: any, selector: string, value: string) {
  const field = page.locator(selector).first();
  await field.waitFor({ state: 'visible' });
  await field.fill(value);
}

// Assert toast message
export async function expectToast(page: any, message: string) {
  const toast = page.locator(`${selectors.toast}:has-text("${message}")`);
  await toast.waitFor({ state: 'visible', timeout: 5000 });
}

// Assert no console errors
export function setupConsoleErrorCheck(page: any): string[] {
  const errors: string[] = [];
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}
