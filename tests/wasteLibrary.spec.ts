import { test, expect } from "@playwright/test";

test.describe("Waste Library Tests", () => {
  test("Regular user can view the Waste Library and its tabs", async ({ page }) => {
    // 1. Login as a Regular User
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to Waste Library
    await page.goto("http://localhost:5173/waste");

    // 3. Assert header elements are visible
    await expect(page.locator("text=♻️ Waste Library")).toBeVisible();
    await expect(page.locator("text=Browse all waste categories and items")).toBeVisible();

    // 4. Assert Tabs are visible
    const categoriesTab = page.locator("button:has-text('🗂 Categories')");
    const itemsTab = page.locator("button:has-text('🔬 Items')");

    await expect(categoriesTab).toBeVisible();
    await expect(itemsTab).toBeVisible();

    // 5. Assert regular user cannot see the "Add" button
    await expect(page.locator("button:has-text('+ Add Category')")).not.toBeVisible();
    await expect(page.locator("button:has-text('+ Add Item')")).not.toBeVisible();

    // 6. Test Items tab interaction
    await itemsTab.click();
    // Wait for loading to finish
    await expect(page.locator('.spinner').first()).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator("input[placeholder='🔍 Search items…']")).toBeVisible();
  });

  test("Admin can view the Add buttons in Waste Library", async ({ page }) => {
    // 1. Login as an Admin
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "admin1@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.check('input[type="checkbox"]'); // Sign in as Admin
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to Waste Library
    await page.goto("http://localhost:5173/waste");

    // 3. Assert Admin can see "Add Category" button on the Categories tab
    await expect(page.locator("button:has-text('🗂 Categories')")).toBeVisible();
    await expect(page.locator("button:has-text('+ Add Category')")).toBeVisible();

    // 4. Assert Admin can see "Add Item" button on the Items tab
    await page.locator("button:has-text('🔬 Items')").click();
    await expect(page.locator("button:has-text('+ Add Item')")).toBeVisible();
  });
});
