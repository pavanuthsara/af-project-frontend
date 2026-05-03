import { test, expect } from "@playwright/test";

test.describe("Certificates Page Tests", () => {
  test("User can view certificates page and eco-points", async ({ page }) => {
    // 1. Login as a regular user
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to the certificates page
    await page.goto("http://localhost:5173/quizzes/certificates");

    // 3. Wait for the loading spinner to disappear
    await expect(page.locator('.spinner').first()).not.toBeVisible({ timeout: 10000 });

    // 4. Assert header elements are visible
    await expect(page.locator("text=🏅 My Certificates")).toBeVisible();
    await expect(page.locator("text=Badges and achievements you've earned")).toBeVisible();
    await expect(page.locator("text=← Back to Quizzes")).toBeVisible();

    // 5. Assert Eco-points section is visible
    await expect(page.locator("text=Total Eco-Points")).toBeVisible();
    await expect(page.locator("text=+10 pts for each quiz passed")).toBeVisible();

    // 6. Check if either the empty state or the badges grid is visible
    const emptyState = page.locator("text=No badges yet — take a quiz to earn your first badge!");
    const badgeGrid = page.locator(".grid-3");
    
    // One of them should be visible
    const isEmptyVisible = await emptyState.isVisible();
    const isGridVisible = await badgeGrid.isVisible();
    expect(isEmptyVisible || isGridVisible).toBeTruthy();
  });
});
