import { test, expect } from "@playwright/test";

test.describe("Login Page Tests", () => {
  test("User Login with valid credentials", async ({ page }) => {
    // Navigate to the login page
    await page.goto("http://localhost:5173/login");

    // Fill in the email and password fields
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");

    // Click the login button
    await page.click('button[type="submit"]');

    // Wait for navigation to the dashboard or home page
    await page.waitForURL("http://localhost:5173/");

    // Assert that the user is redirected to the home page
    await expect(page).toHaveURL("http://localhost:5173/");
  });

  test("Admin Login with valid credentials", async ({ page }) => {
    // Navigate to the login page
    await page.goto("http://localhost:5173/login");

    // Fill in the email and password fields
    await page.fill('input[name="email"]', "admin1@gmail.com");
    await page.fill('input[name="password"]', "123");

    // Check the "Sign in as Admin" checkbox
    await page.check('input[type="checkbox"]');

    // Click the login button
    await page.click('button[type="submit"]');

    // Wait for navigation to the admin dashboard or home page
    await page.waitForURL("http://localhost:5173/");

    // Assert that the user is redirected to the home page
    await expect(page).toHaveURL("http://localhost:5173/");

    // Assert that an admin-specific element is visible
    await expect(page.locator("text=Good morning, Super")).toBeVisible();
  });
});
