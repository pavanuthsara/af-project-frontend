import { test, expect } from "@playwright/test";

test.describe("Quizzes Page Tests", () => {
  test("User can view quizzes page and its main elements", async ({ page }) => {
    // 1. Login as a regular user
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to the quizzes page
    await page.goto("http://localhost:5173/quizzes");

    // 3. Assert header elements are visible
    await expect(page.locator("text=🎓 Eco Quizzes")).toBeVisible();
    await expect(page.locator("text=Test your waste management knowledge and earn eco-points")).toBeVisible();
    await expect(page.locator("text=🏅 My Certificates")).toBeVisible();

    // 4. Assert regular user does not see the Admin "Create Quiz" button
    await expect(page.locator("text=+ Create Quiz")).not.toBeVisible();

    // 5. Check if either the empty state or the quiz grid is visible
    // Wait for the loading spinner to disappear
    await expect(page.locator('.spinner').first()).not.toBeVisible({ timeout: 10000 });
    
    const emptyState = page.locator("text=No quizzes available yet");
    const quizGrid = page.locator(".grid-3");
    
    // One of them should be visible
    const isEmptyVisible = await emptyState.isVisible();
    const isGridVisible = await quizGrid.isVisible();
    expect(isEmptyVisible || isGridVisible).toBeTruthy();
  });

  test("Admin can view quizzes page and open the create quiz modal", async ({ page }) => {
    // 1. Login as an Admin
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "admin1@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.check('input[type="checkbox"]'); // Sign in as Admin
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to the quizzes page
    await page.goto("http://localhost:5173/quizzes");

    // Wait for the loading spinner to disappear
    await expect(page.locator('.spinner').first()).not.toBeVisible({ timeout: 10000 });

    // 3. Assert the Admin "Create Quiz" button is visible
    const createQuizBtn = page.locator("text=+ Create Quiz");
    await expect(createQuizBtn).toBeVisible();

    // 4. Click the "Create Quiz" button to open the modal
    await createQuizBtn.click();

    // 5. Assert the modal and its fields are visible
    await expect(page.locator("h2:has-text('Create New Quiz')")).toBeVisible();
    await expect(page.locator('label:has-text("Title")')).toBeVisible();
    await expect(page.locator('label:has-text("Description")')).toBeVisible();
    await expect(page.locator('label:has-text("Difficulty")')).toBeVisible();
    await expect(page.locator('label:has-text("Passing Score (%)")')).toBeVisible();

    // 6. Close the modal
    await page.locator('button:has-text("✕")').click();
    
    // 7. Assert the modal is closed
    await expect(page.locator("h2:has-text('Create New Quiz')")).not.toBeVisible();
  });
});
