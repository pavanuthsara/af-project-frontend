import { test, expect } from "@playwright/test";

test.describe("Admin Panel Tests", () => {
  test("Admin can view the Admin Panel and its main sections", async ({ page }) => {
    // 1. Login as an Admin
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "admin1@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.check('input[type="checkbox"]'); // Sign in as Admin
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to the Admin Panel page
    await page.goto("http://localhost:5173/admin");

    // 3. Assert header elements are visible
    await expect(page.locator("text=⚙️ Admin Panel")).toBeVisible();
    await expect(page.locator("text=Manage waste data, quizzes, and questions")).toBeVisible();

    // 4. Assert the section tabs are visible
    const categoriesTab = page.locator("button:has-text('Categories')");
    const itemsTab = page.locator("button:has-text('Items')");
    const quizzesTab = page.locator("button:has-text('Quizzes')");

    await expect(categoriesTab).toBeVisible();
    await expect(itemsTab).toBeVisible();
    await expect(quizzesTab).toBeVisible();

    // 5. Test Categories section (default active section)
    await expect(page.locator("h2:has-text('Waste Categories')")).toBeVisible();
    await expect(page.locator("button:has-text('➕ New Category')")).toBeVisible();
    await expect(page.locator("th:has-text('Name')")).toBeVisible();
    await expect(page.locator("th:has-text('Description')")).toBeVisible();

    // 6. Test Items section interaction
    await itemsTab.click();
    await expect(page.locator("h2:has-text('Waste Items')")).toBeVisible();
    await expect(page.locator("button:has-text('➕ New Item')")).toBeVisible();
    await expect(page.locator("th:has-text('Category')")).toBeVisible();

    // 7. Test Quizzes section interaction
    await quizzesTab.click();
    // Wait for the loading spinner to disappear in the Quizzes section if it's there
    await expect(page.locator('.spinner').first()).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator("h2:has-text('Quizzes')")).toBeVisible();
    await expect(page.locator("button:has-text('➕ Create Quiz')")).toBeVisible();
  });

  test("Regular user should not be able to interact with Admin Panel features (Access Control Check)", async ({ page }) => {
    // Note: Assuming regular users are redirected or shown an unauthorized message if they try to access /admin
    
    // 1. Login as a Regular User
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Attempt to navigate to the Admin Panel page
    await page.goto("http://localhost:5173/admin");

    // 3. Assert that the Admin Panel header is NOT visible (meaning they were blocked or redirected)
    // Depending on your frontend implementation, this might redirect to '/' or show an "Unauthorized" text.
    // We check that the core Admin header is completely hidden.
    await expect(page.locator("text=⚙️ Admin Panel")).not.toBeVisible();
  });
});
