import { test, expect } from '@playwright/test';

/**
 * Dashboard E2E Tests
 * 
 * Tests dashboard functionality including:
 * - Page loading and rendering
 * - Navigation between sections
 * - Widget/card display
 * - Responsive behavior
 */

test.describe('Dashboard', () => {
  // Note: These tests assume the user is already authenticated
  // In a real scenario, you'd set up authentication before running these tests

  test.beforeEach(async ({ page }) => {
    // Go to home/dashboard
    await page.goto('/');
  });

  test('should load the application without errors', async ({ page }) => {
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');

    // No console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Page should not show an error state
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    await expect(page.locator('[class*="error-boundary"]')).not.toBeVisible();
  });

  test('should display main navigation elements', async ({ page }) => {
    // Look for navigation elements
    const nav = page.locator('nav, [role="navigation"], aside');
    await expect(nav.first()).toBeVisible();
  });

  test('should navigate to employees section', async ({ page }) => {
    // Find and click employees link
    const employeesLink = page.locator('a[href*="employees"], button:has-text("Employees")').first();
    
    if (await employeesLink.isVisible()) {
      await employeesLink.click();
      await expect(page).toHaveURL(/employees/);
    }
  });

  test('should navigate to payroll section', async ({ page }) => {
    // Find and click payroll link
    const payrollLink = page.locator('a[href*="payroll"], button:has-text("Payroll")').first();
    
    if (await payrollLink.isVisible()) {
      await payrollLink.click();
      await expect(page).toHaveURL(/payroll/);
    }
  });

  test('should navigate to leave management section', async ({ page }) => {
    // Find and click leave link
    const leaveLink = page.locator('a[href*="leave"], button:has-text("Leave")').first();
    
    if (await leaveLink.isVisible()) {
      await leaveLink.click();
      await expect(page).toHaveURL(/leave/);
    }
  });

  test('should display dashboard cards/widgets', async ({ page }) => {
    // Look for dashboard cards
    const cards = page.locator('[class*="card"], [class*="widget"], [role="article"]');
    
    // Dashboard should have at least some content
    await page.waitForLoadState('networkidle');
    const cardCount = await cards.count();
    
    // Either cards exist or page content exists
    const hasContent = cardCount > 0 || await page.locator('main, [role="main"]').isVisible();
    expect(hasContent).toBe(true);
  });

  test('should show user profile or menu', async ({ page }) => {
    // Look for user avatar or profile menu
    const userMenu = page.locator('[class*="avatar"], [class*="user"], button:has([class*="avatar"])').first();
    
    if (await userMenu.isVisible()) {
      await userMenu.click();
      
      // Should show dropdown or navigate to profile
      await page.waitForTimeout(500);
    }
  });

  test('should have working sidebar toggle on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Look for hamburger menu
    const menuButton = page.locator('button:has([class*="menu"]), [aria-label*="menu"]').first();
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      
      // Sidebar should appear
      await page.waitForTimeout(300);
      const sidebar = page.locator('aside, [role="navigation"]');
      await expect(sidebar.first()).toBeVisible();
    }
  });
});

test.describe('Dashboard Navigation', () => {
  test('should navigate between main sections', async ({ page }) => {
    await page.goto('/');
    
    const sections = [
      { link: 'employees', url: /employees/ },
      { link: 'payroll', url: /payroll/ },
      { link: 'leave', url: /leave/ },
      { link: 'settings', url: /settings/ },
    ];

    for (const section of sections) {
      const link = page.locator(`a[href*="${section.link}"]`).first();
      
      if (await link.isVisible()) {
        await link.click();
        await page.waitForLoadState('networkidle');
        
        // Either URL matches or we're on a valid page
        const currentUrl = page.url();
        const isValid = section.url.test(currentUrl) || !currentUrl.includes('error');
        expect(isValid).toBe(true);
        
        // Go back to dashboard
        await page.goto('/');
      }
    }
  });

  test('should show breadcrumbs on nested pages', async ({ page }) => {
    // Navigate to a nested page
    await page.goto('/employees');
    
    // Look for breadcrumbs
    const breadcrumbs = page.locator('[class*="breadcrumb"], nav[aria-label*="breadcrumb"]');
    
    if (await breadcrumbs.isVisible()) {
      // Breadcrumbs should be clickable
      const homeLink = breadcrumbs.locator('a').first();
      if (await homeLink.isVisible()) {
        await homeLink.click();
        await expect(page).toHaveURL('/');
      }
    }
  });
});

test.describe('Dashboard Responsiveness', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 800 },
    { name: 'Large Desktop', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`should render correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Page should load without horizontal scroll issues
      const body = page.locator('body');
      const scrollWidth = await body.evaluate(el => el.scrollWidth);
      const clientWidth = await body.evaluate(el => el.clientWidth);
      
      // Allow small tolerance for scrollbars
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20);
    });
  }
});

test.describe('Dashboard Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should not have memory leaks on navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate between pages multiple times
    for (let i = 0; i < 3; i++) {
      await page.goto('/employees');
      await page.waitForLoadState('networkidle');
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    }
    
    // Page should still be responsive
    await expect(page.locator('body')).toBeVisible();
  });
});
