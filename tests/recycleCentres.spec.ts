import { test, expect } from "@playwright/test";

test.describe("Recycle Centres Page Tests", () => {
  test("Regular user can view the Recycle Centres and its features", async ({ page }) => {
    // 1. Login as a Regular User
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to Recycle Centres
    // Depending on your router, it might be /centres or /recycle-centres. Assuming /centres.
    await page.goto("http://localhost:5173/centres");

    // 3. Assert header elements are visible
    await expect(page.locator("h1:has-text('Recycle Centres')")).toBeVisible();
    await expect(page.locator("text=Find nearby recycling drop-off locations")).toBeVisible();

    // 4. Assert Search and Filter inputs are visible
    await expect(page.locator("input[placeholder*='AI search']")).toBeVisible();
    await expect(page.locator("button:has-text('Search')")).toBeVisible();
    await expect(page.locator("select")).toBeVisible(); // The waste type filter

    // 5. Assert regular user cannot see the "Add Centre" button
    await expect(page.locator("button:has-text('+ Add Centre')")).not.toBeVisible();

    // 6. Wait for loading spinner to disappear and check empty state OR centres list
    await expect(page.locator('.spinner').first()).not.toBeVisible({ timeout: 10000 });
    const emptyState = page.locator("text=No centres found");
    const centreCard = page.locator(".card").first();
    
    // Either it shows 'No centres found' or it shows at least one card
    const isEmptyVisible = await emptyState.isVisible();
    const isCardVisible = await centreCard.isVisible();
    expect(isEmptyVisible || isCardVisible).toBeTruthy();
  });

  test("Admin can view the Add Centre button in Recycle Centres", async ({ page }) => {
    // 1. Login as an Admin
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "admin1@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.check('input[type="checkbox"]'); // Sign in as Admin
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to Recycle Centres
    await page.goto("http://localhost:5173/centres");

    // 3. Assert Admin can see "Add Centre" button
    await expect(page.locator("button:has-text('+ Add Centre')")).toBeVisible();
  });
});
