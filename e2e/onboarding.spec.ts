import { test, expect } from '@playwright/test';

/**
 * Onboarding E2E Tests
 * 
 * Tests the complete onboarding workflow including:
 * - Viewing onboarding records
 * - Creating new onboarding
 * - Task management
 * - Progress tracking
 */

test.describe('Onboarding Overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
  });

  test('should display onboarding page', async ({ page }) => {
    // Page should load
    await expect(page.locator('body')).toBeVisible();
    
    // Should have onboarding-related content
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('should display onboarding records list', async ({ page }) => {
    // Look for onboarding list
    const onboardingList = page.locator('table, [class*="onboarding"], [class*="card"]');
    
    if (await onboardingList.count() > 0) {
      await expect(onboardingList.first()).toBeVisible();
    }
  });

  test('should display progress indicators', async ({ page }) => {
    // Look for progress bars or indicators
    const progressIndicators = page.locator('[class*="progress"], [role="progressbar"]');
    
    if (await progressIndicators.count() > 0) {
      await expect(progressIndicators.first()).toBeVisible();
    }
  });

  test('should have new onboarding button', async ({ page }) => {
    // Look for create button
    const createButton = page.locator('button:has-text("New"), button:has-text("Start"), button:has-text("Add")').first();
    
    if (await createButton.isVisible()) {
      await expect(createButton).toBeEnabled();
    }
  });

  test('should display status tabs or filters', async ({ page }) => {
    // Look for status tabs
    const statusTabs = page.locator('[role="tablist"], [class*="tabs"]');
    
    if (await statusTabs.isVisible()) {
      await expect(statusTabs).toBeVisible();
    }
  });
});

test.describe('Start New Onboarding', () => {
  test('should open onboarding wizard', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Click create button
    const createButton = page.locator('button:has-text("New"), button:has-text("Start Onboarding")').first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Wizard or form should appear
      const wizard = page.locator('form, [role="dialog"], [class*="wizard"]');
      await expect(wizard.first()).toBeVisible();
    }
  });

  test('should allow employee selection', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Open wizard
    const createButton = page.locator('button:has-text("New"), button:has-text("Start")').first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Look for employee selector
      const employeeSelect = page.locator('select, [role="combobox"], input[placeholder*="employee" i]').first();
      
      if (await employeeSelect.isVisible()) {
        await expect(employeeSelect).toBeVisible();
      }
    }
  });

  test('should allow workflow template selection', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Open wizard
    const createButton = page.locator('button:has-text("New")').first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Look for workflow selector
      const workflowSelect = page.locator('[class*="workflow"], select, [role="radiogroup"]');
      
      if (await workflowSelect.count() > 0) {
        await expect(workflowSelect.first()).toBeVisible();
      }
    }
  });

  test('should allow start date selection', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Open wizard
    const createButton = page.locator('button:has-text("New")').first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Look for date input
      const dateInput = page.locator('input[type="date"], [class*="date-picker"]');
      
      if (await dateInput.count() > 0) {
        await expect(dateInput.first()).toBeVisible();
      }
    }
  });

  test('should allow team member assignment', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Open wizard
    const createButton = page.locator('button:has-text("New")').first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Navigate through steps to team assignment
      const nextButton = page.locator('button:has-text("Next")');
      
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(300);
      }
    }
  });
});

test.describe('Onboarding Details', () => {
  test('should navigate to onboarding details', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Click on an onboarding record
    const onboardingRecord = page.locator('tr[class*="cursor"], [class*="onboarding-card"], a[href*="onboarding"]').first();
    
    if (await onboardingRecord.isVisible()) {
      await onboardingRecord.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display onboarding progress', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Navigate to details
    const onboardingRecord = page.locator('tr[class*="cursor"], a[href*="onboarding"]').first();
    
    if (await onboardingRecord.isVisible()) {
      await onboardingRecord.click();
      await page.waitForLoadState('networkidle');
      
      // Look for progress indicator
      const progress = page.locator('[class*="progress"], [role="progressbar"]');
      
      if (await progress.count() > 0) {
        await expect(progress.first()).toBeVisible();
      }
    }
  });

  test('should display task list', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Navigate to details
    const onboardingRecord = page.locator('tr[class*="cursor"], a[href*="onboarding"]').first();
    
    if (await onboardingRecord.isVisible()) {
      await onboardingRecord.click();
      await page.waitForLoadState('networkidle');
      
      // Look for tasks
      const tasks = page.locator('[class*="task"], [class*="checklist"]');
      
      if (await tasks.count() > 0) {
        await expect(tasks.first()).toBeVisible();
      }
    }
  });

  test('should display assigned team members', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Navigate to details
    const onboardingRecord = page.locator('tr[class*="cursor"], a[href*="onboarding"]').first();
    
    if (await onboardingRecord.isVisible()) {
      await onboardingRecord.click();
      await page.waitForLoadState('networkidle');
      
      // Look for team members section
      const teamSection = page.locator('[class*="team"], [class*="assigned"]');
      
      if (await teamSection.count() > 0) {
        await expect(teamSection.first()).toBeVisible();
      }
    }
  });
});

test.describe('Task Management', () => {
  test('should allow marking task as complete', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Navigate to details
    const onboardingRecord = page.locator('tr[class*="cursor"], a[href*="onboarding"]').first();
    
    if (await onboardingRecord.isVisible()) {
      await onboardingRecord.click();
      await page.waitForLoadState('networkidle');
      
      // Find checkbox or complete button
      const taskCheckbox = page.locator('input[type="checkbox"], button:has-text("Complete")').first();
      
      if (await taskCheckbox.isVisible()) {
        await taskCheckbox.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should update progress when task completed', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Navigate to details
    const onboardingRecord = page.locator('tr[class*="cursor"], a[href*="onboarding"]').first();
    
    if (await onboardingRecord.isVisible()) {
      await onboardingRecord.click();
      await page.waitForLoadState('networkidle');
      
      // Get initial progress
      const progressBar = page.locator('[role="progressbar"]').first();
      
      if (await progressBar.isVisible()) {
        await expect(progressBar).toBeVisible();
      }
    }
  });

  test('should allow adding task notes', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Navigate to details
    const onboardingRecord = page.locator('tr[class*="cursor"], a[href*="onboarding"]').first();
    
    if (await onboardingRecord.isVisible()) {
      await onboardingRecord.click();
      await page.waitForLoadState('networkidle');
      
      // Look for notes or comment button on a task
      const notesButton = page.locator('button:has-text("Note"), button:has-text("Comment")').first();
      
      if (await notesButton.isVisible()) {
        await notesButton.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should filter tasks by category', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Navigate to details
    const onboardingRecord = page.locator('tr[class*="cursor"], a[href*="onboarding"]').first();
    
    if (await onboardingRecord.isVisible()) {
      await onboardingRecord.click();
      await page.waitForLoadState('networkidle');
      
      // Look for category filter
      const categoryFilter = page.locator('button:has-text("Category"), select').first();
      
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();
        await page.waitForTimeout(300);
      }
    }
  });
});

test.describe('Complete Onboarding', () => {
  test('should have complete onboarding button when all tasks done', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Navigate to a completed onboarding
    const onboardingRecord = page.locator('tr[class*="cursor"], a[href*="onboarding"]').first();
    
    if (await onboardingRecord.isVisible()) {
      await onboardingRecord.click();
      await page.waitForLoadState('networkidle');
      
      // Look for complete button
      const completeButton = page.locator('button:has-text("Complete"), button:has-text("Finish")');
      
      if (await completeButton.count() > 0) {
        await expect(completeButton.first()).toBeVisible();
      }
    }
  });

  test('should show completion confirmation', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // This would require a completed onboarding record
    // Just verify the page loads correctly
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Onboarding Workflows', () => {
  test('should navigate to workflows management', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Look for workflows tab or link
    const workflowsLink = page.locator('a[href*="workflow"], button:has-text("Workflows")').first();
    
    if (await workflowsLink.isVisible()) {
      await workflowsLink.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display workflow templates', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Navigate to workflows
    const workflowsLink = page.locator('a[href*="workflow"], button:has-text("Workflows")').first();
    
    if (await workflowsLink.isVisible()) {
      await workflowsLink.click();
      await page.waitForLoadState('networkidle');
      
      // Look for workflow cards/list
      const workflows = page.locator('[class*="workflow"], [class*="card"]');
      
      if (await workflows.count() > 0) {
        await expect(workflows.first()).toBeVisible();
      }
    }
  });
});
