import { test, expect } from "@playwright/test";

test.describe("Identify Waste Page Tests", () => {
  test("User can navigate to Identify Waste page and see core elements", async ({ page }) => {
    // 1. Login as a Regular User
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to Identify page
    await page.goto("http://localhost:5173/identify");

    // 3. Assert header elements are visible
    await expect(page.locator("text=🔍 AI Waste Identifier")).toBeVisible();
    await expect(page.locator("text=Upload a photo of waste to get instant identification")).toBeVisible();

    // 4. Assert Upload zone is visible
    await expect(page.locator("text=Drop image here or click to upload")).toBeVisible();
    await expect(page.locator("text=JPEG, JPG, PNG • Max 5MB")).toBeVisible();

    // 5. Assert AI Empty state is visible initially
    await expect(page.locator("text=Powered by Gemini AI")).toBeVisible();
    await expect(page.locator("text=Upload any waste item photo and our AI will identify it")).toBeVisible();

    // 6. Assert tips section is visible
    await expect(page.locator("text=📌 Tips for best results")).toBeVisible();
    await expect(page.locator("text=Use a well-lit photo with the item clearly visible")).toBeVisible();
  });
});
