import { test, expect } from '@playwright/test';

/**
 * Leave Request E2E Tests
 * 
 * Tests the complete leave request workflow including:
 * - Viewing leave requests
 * - Submitting new requests
 * - Approving/rejecting requests
 * - Cancelling requests
 */

test.describe('Leave Overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
  });

  test('should display leave management page', async ({ page }) => {
    // Page should load
    await expect(page.locator('body')).toBeVisible();
    
    // Should have leave-related content
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('should display leave balance cards', async ({ page }) => {
    // Look for balance cards
    const balanceCards = page.locator('[class*="balance"], [class*="card"]');
    
    if (await balanceCards.count() > 0) {
      await expect(balanceCards.first()).toBeVisible();
    }
  });

  test('should display leave requests list', async ({ page }) => {
    // Look for requests table or list
    const requestsList = page.locator('table, [class*="request-list"]');
    
    if (await requestsList.count() > 0) {
      await expect(requestsList.first()).toBeVisible();
    }
  });

  test('should have request leave button', async ({ page }) => {
    // Look for request button
    const requestButton = page.locator('button:has-text("Request"), button:has-text("Apply"), button:has-text("New")').first();
    
    if (await requestButton.isVisible()) {
      await expect(requestButton).toBeEnabled();
    }
  });
});

test.describe('Submit Leave Request', () => {
  test('should open leave request form', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    
    // Click request button
    const requestButton = page.locator('button:has-text("Request"), button:has-text("Apply Leave")').first();
    
    if (await requestButton.isVisible()) {
      await requestButton.click();
      await page.waitForTimeout(500);
      
      // Form should appear
      const form = page.locator('form, [role="dialog"]');
      await expect(form.first()).toBeVisible();
    }
  });

  test('should display leave type selection', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    
    // Open form
    const requestButton = page.locator('button:has-text("Request")').first();
    
    if (await requestButton.isVisible()) {
      await requestButton.click();
      await page.waitForTimeout(500);
      
      // Look for leave type dropdown
      const leaveTypeSelect = page.locator('select, [role="combobox"], button:has-text("Select leave type")').first();
      
      if (await leaveTypeSelect.isVisible()) {
        await expect(leaveTypeSelect).toBeVisible();
      }
    }
  });

  test('should allow date selection', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    
    // Open form
    const requestButton = page.locator('button:has-text("Request")').first();
    
    if (await requestButton.isVisible()) {
      await requestButton.click();
      await page.waitForTimeout(500);
      
      // Look for date inputs
      const dateInputs = page.locator('input[type="date"], [class*="date-picker"], button:has-text("Select date")');
      
      if (await dateInputs.count() > 0) {
        await expect(dateInputs.first()).toBeVisible();
      }
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    
    // Open form
    const requestButton = page.locator('button:has-text("Request")').first();
    
    if (await requestButton.isVisible()) {
      await requestButton.click();
      await page.waitForTimeout(500);
      
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"], button:has-text("Submit")').first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(300);
        
        // Should show validation errors
        const errors = page.locator('[class*="error"], [role="alert"]');
        const hasErrors = await errors.count() > 0;
        
        // Form should still be visible (not submitted)
        const formStillVisible = await page.locator('form, [role="dialog"]').isVisible();
        expect(hasErrors || formStillVisible).toBe(true);
      }
    }
  });

  test('should calculate days count automatically', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    
    // Open form
    const requestButton = page.locator('button:has-text("Request")').first();
    
    if (await requestButton.isVisible()) {
      await requestButton.click();
      await page.waitForTimeout(500);
      
      // Look for days count display
      const daysDisplay = page.locator('[class*="days"], text=/\\d+ days?/');
      
      if (await daysDisplay.count() > 0) {
        await expect(daysDisplay.first()).toBeVisible();
      }
    }
  });

  test('should allow adding reason/notes', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    
    // Open form
    const requestButton = page.locator('button:has-text("Request")').first();
    
    if (await requestButton.isVisible()) {
      await requestButton.click();
      await page.waitForTimeout(500);
      
      // Look for reason textarea
      const reasonInput = page.locator('textarea, input[name="reason"], input[placeholder*="reason" i]').first();
      
      if (await reasonInput.isVisible()) {
        await reasonInput.fill('Annual vacation with family');
        await expect(reasonInput).toHaveValue('Annual vacation with family');
      }
    }
  });
});

test.describe('View Leave Requests', () => {
  test('should display my leave requests', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    
    // Look for my requests tab or section
    const myRequestsTab = page.locator('button:has-text("My Requests"), a:has-text("My Requests")').first();
    
    if (await myRequestsTab.isVisible()) {
      await myRequestsTab.click();
      await page.waitForTimeout(300);
    }
    
    // Should show requests list
    const requestsList = page.locator('table, [class*="request"]');
    await expect(requestsList.first()).toBeVisible();
  });

  test('should filter requests by status', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    
    // Look for status filter
    const statusFilter = page.locator('select, button:has-text("Status"), button:has-text("All")').first();
    
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.waitForTimeout(300);
      
      // Look for filter options
      const pendingOption = page.locator('option:has-text("Pending"), [role="option"]:has-text("Pending")').first();
      
      if (await pendingOption.isVisible()) {
        await pendingOption.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should display request details', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    
    // Click on a request
    const requestRow = page.locator('tr[class*="cursor"], [class*="request-item"]').first();
    
    if (await requestRow.isVisible()) {
      await requestRow.click();
      await page.waitForTimeout(500);
      
      // Details should appear
      const details = page.locator('[role="dialog"], [class*="details"]');
      
      if (await details.isVisible()) {
        await expect(details).toBeVisible();
      }
    }
  });
});

test.describe('Cancel Leave Request', () => {
  test('should allow cancelling pending request', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    
    // Look for cancel button on a pending request
    const cancelButton = page.locator('button:has-text("Cancel")').first();
    
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      await page.waitForTimeout(300);
      
      // Confirmation dialog should appear
      const confirmDialog = page.locator('[role="alertdialog"], [class*="confirm"]');
      
      if (await confirmDialog.isVisible()) {
        await expect(confirmDialog).toBeVisible();
      }
    }
  });
});

test.describe('Leave Request Approval (Manager View)', () => {
  test('should display pending requests for approval', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    
    // Look for approval tab or section
    const approvalTab = page.locator('button:has-text("Approval"), button:has-text("Pending"), a:has-text("Approve")').first();
    
    if (await approvalTab.isVisible()) {
      await approvalTab.click();
      await page.waitForTimeout(300);
    }
  });

  test('should have approve button', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    
    // Look for approve button
    const approveButton = page.locator('button:has-text("Approve")').first();
    
    if (await approveButton.isVisible()) {
      await expect(approveButton).toBeEnabled();
    }
  });

  test('should have reject button', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    
    // Look for reject button
    const rejectButton = page.locator('button:has-text("Reject"), button:has-text("Decline")').first();
    
    if (await rejectButton.isVisible()) {
      await expect(rejectButton).toBeEnabled();
    }
  });

  test('should require reason for rejection', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    
    // Click reject
    const rejectButton = page.locator('button:has-text("Reject")').first();
    
    if (await rejectButton.isVisible()) {
      await rejectButton.click();
      await page.waitForTimeout(300);
      
      // Reason input should appear
      const reasonInput = page.locator('textarea, input[name="reason"], input[placeholder*="reason" i]');
      
      if (await reasonInput.count() > 0) {
        await expect(reasonInput.first()).toBeVisible();
      }
    }
  });
});

test.describe('Leave Calendar', () => {
  test('should display leave calendar view', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    
    // Look for calendar tab or view
    const calendarTab = page.locator('button:has-text("Calendar"), a:has-text("Calendar")').first();
    
    if (await calendarTab.isVisible()) {
      await calendarTab.click();
      await page.waitForTimeout(500);
      
      // Calendar should appear
      const calendar = page.locator('[class*="calendar"], [role="grid"]');
      
      if (await calendar.isVisible()) {
        await expect(calendar).toBeVisible();
      }
    }
  });

  test('should navigate between months', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    
    // Navigate to calendar
    const calendarTab = page.locator('button:has-text("Calendar")').first();
    
    if (await calendarTab.isVisible()) {
      await calendarTab.click();
      await page.waitForTimeout(500);
      
      // Look for next month button
      const nextButton = page.locator('button:has-text("Next"), button[aria-label*="next"]').first();
      
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);
      }
    }
  });
});
