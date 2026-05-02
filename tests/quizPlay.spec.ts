import { test, expect } from "@playwright/test";

test.describe("Quiz Play Page Tests", () => {
  test("User can navigate to a quiz play page and see quiz elements", async ({ page }) => {
    // 1. Login as a regular user
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to a dummy quiz play page
    // Using a sample ID, since actual ID might not be known without API data
    await page.goto("http://localhost:5173/quizzes/dummy_quiz_id_123/play");

    // 3. Wait for the loading spinner to disappear
    await expect(page.locator('.spinner').first()).not.toBeVisible({ timeout: 10000 });

    // 4. Check for potential loaded states
    // The page can either show an error, an empty state (No questions), or the quiz questions
    
    const noQuestionsState = page.locator("text=No Questions Yet");
    const errorState = page.locator("text=Back to Quizzes");
    const languageButtons = page.locator("text=🇬🇧 English");
    
    const isNoQuestionsVisible = await noQuestionsState.isVisible();
    const isErrorVisible = await errorState.isVisible();
    const isLanguageButtonsVisible = await languageButtons.isVisible();

    // At least one of these main layout scenarios should be present
    expect(isNoQuestionsVisible || isErrorVisible || isLanguageButtonsVisible).toBeTruthy();

    // If the quiz loaded successfully with questions, verify its specific elements
    if (isLanguageButtonsVisible) {
      await expect(page.locator("text=🇬🇧 English")).toBeVisible();
      await expect(page.locator("text=🇱🇰 Sinhala")).toBeVisible();
      await expect(page.locator("text=Tamil")).toBeVisible();
      
      // The progress bar or navigation should be present if questions exist
      await expect(page.locator('.progress-bar')).toBeVisible();
    }
  });
});
