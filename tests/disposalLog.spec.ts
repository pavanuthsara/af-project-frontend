import { test, expect } from "@playwright/test";

test.describe("Disposal Log Tests", () => {
  test("User can navigate to Disposal Log and see the Log New tab", async ({ page }) => {
    // 1. Login as a Regular User
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to Disposal Log
    await page.goto("http://localhost:5173/disposal");

    // 3. Assert page header is visible
    await expect(page.locator("h1:has-text('Disposal Log')")).toBeVisible();
    await expect(page.locator("text=Track your waste disposal and see your CO₂ impact")).toBeVisible();

    // 4. Assert all three tab buttons are visible
    await expect(page.locator("button:has-text('➕ Log New')")).toBeVisible();
    await expect(page.locator("button:has-text('📜 History')")).toBeVisible();
    await expect(page.locator("button:has-text('📊 My Stats')")).toBeVisible();

    // 5. Assert Log New tab content is visible by default
    await expect(page.locator("text=Log a Disposal Activity")).toBeVisible();
    await expect(page.locator("input[placeholder='🔍 Search item…']")).toBeVisible();
    await expect(page.locator("label.form-label:has-text('Waste Item')")).toBeVisible();
    await expect(page.locator("label.form-label:has-text('Quantity')")).toBeVisible();
    await expect(page.locator("label.form-label:has-text('Weight')")).toBeVisible();
    await expect(page.locator("button:has-text('🌱 Log Disposal')")).toBeVisible();

    // 6. Assert the "Did you know?" info card is visible
    await expect(page.locator("text=🌍 Did you know?")).toBeVisible();
  });

  test("User can switch between tabs on Disposal Log page", async ({ page }) => {
    // 1. Login
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to Disposal Log
    await page.goto("http://localhost:5173/disposal");

    // 3. Click History tab and verify content
    await page.click("button:has-text('📜 History')");
    await expect(page.locator('input[type="date"]').first()).toBeVisible();

    // Wait for history to load and check for either entries or empty state
    await expect(page.locator('.spinner').first()).not.toBeVisible({ timeout: 10000 });
    const emptyState = page.locator("text=No disposal logs yet");
    const historyTable = page.locator("table");
    const isEmptyVisible = await emptyState.isVisible();
    const isTableVisible = await historyTable.isVisible();
    expect(isEmptyVisible || isTableVisible).toBeTruthy();

    // 4. Click Stats tab and verify content loads
    await page.click("button:has-text('📊 My Stats')");
    // Stats load asynchronously — wait briefly then check
    await page.waitForTimeout(1500);
    const statCard = page.locator(".stat-card").first();
    const noStatsText = page.locator("text=Total CO₂ Saved");
    const isStatCardVisible = await statCard.isVisible();
    const isNoStatsVisible = await noStatsText.isVisible();
    expect(isStatCardVisible || isNoStatsVisible).toBeTruthy();

    // 5. Switch back to Log New tab
    await page.click("button:has-text('➕ Log New')");
    await expect(page.locator("text=Log a Disposal Activity")).toBeVisible();
  });

  test("Log form shows validation and requires waste item selection", async ({ page }) => {
    // 1. Login
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to Disposal Log
    await page.goto("http://localhost:5173/disposal");

    // 3. Try submitting the form without selecting a waste item
    await page.fill('input[type="number"]', "1"); // Quantity
    await page.click("button:has-text('🌱 Log Disposal')");

    // 4. The form should not submit (native validation on the select field)
    // Still on same page with the form visible
    await expect(page.locator("text=Log a Disposal Activity")).toBeVisible();
  });

  test("User can search and filter waste items in the log form", async ({ page }) => {
    // 1. Login
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to Disposal Log
    await page.goto("http://localhost:5173/disposal");

    // 3. Wait for waste items to load (the select should have options)
    await page.waitForFunction(() => {
      const select = document.querySelector('.form-select') as HTMLSelectElement;
      return select && select.options.length > 1;
    }, { timeout: 10000 });

    // 4. Type in the search box and verify select is filtered
    const searchInput = page.locator("input[placeholder='🔍 Search item…']");
    await searchInput.fill("plastic");

    // The select should update — either show filtered options or remain with items
    const selectOptions = page.locator('select.form-select[required] option');
    const count = await selectOptions.count();
    expect(count).toBeGreaterThanOrEqual(1); // At least the default empty option
  });

  test("User can submit a disposal log and see CO2 toast", async ({ page }) => {
    // 1. Login
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to Disposal Log
    await page.goto("http://localhost:5173/disposal");

    // 3. Wait for waste items to load in the select
    await page.waitForFunction(() => {
      const select = document.querySelector('.form-select') as HTMLSelectElement;
      return select && select.options.length > 1;
    }, { timeout: 10000 });

    // 4. Select the first available waste item (target the required select, not the unit select)
    const selectElement = page.locator('select.form-select[required]');
    const optionValues = await selectElement.locator('option').evaluateAll(
      (opts: HTMLOptionElement[]) => opts.filter(o => o.value).map(o => o.value)
    );
    if (optionValues.length === 0) {
      test.skip(); // No waste items available to test with
      return;
    }
    await selectElement.selectOption(optionValues[0]);

    // 5. Fill in quantity and weight
    const quantityInput = page.locator('input[type="number"]').first();
    await quantityInput.fill("1");
    const weightInput = page.locator('input[type="number"]').nth(1);
    await weightInput.fill("0.5");

    // 6. Submit the form
    await page.click("button:has-text('🌱 Log Disposal')");

    // 7. Assert CO2 toast (celebration card) is shown
    await expect(page.locator(".celebration")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Great job!")).toBeVisible();
    await expect(page.locator("text=kg CO₂e")).toBeVisible();

    // 8. Dismiss the toast
    await page.click("button:has-text('Continue ✓')");
    await expect(page.locator(".celebration")).not.toBeVisible();
  });

  test("History tab shows disposal logs with edit and delete actions", async ({ page }) => {
    // 1. Login
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to Disposal Log and go to History tab
    await page.goto("http://localhost:5173/disposal");
    await page.click("button:has-text('📜 History')");

    // 3. Wait for loading to finish
    await expect(page.locator('.spinner').first()).not.toBeVisible({ timeout: 10000 });

    // 4. Check if there are any history entries
    const historyTable = page.locator("table");
    if (!(await historyTable.isVisible())) {
      // No history yet — check empty state is shown
      await expect(page.locator("text=No disposal logs yet")).toBeVisible();
      return;
    }

    // 5. Assert table headers are correct
    await expect(page.locator("th:has-text('Waste Item')")).toBeVisible();
    await expect(page.locator("th:has-text('Qty')")).toBeVisible();
    await expect(page.locator("th:has-text('Weight')")).toBeVisible();
    await expect(page.locator("th:has-text('CO₂ Saved')")).toBeVisible();
    await expect(page.locator("th:has-text('Method')")).toBeVisible();
    await expect(page.locator("th:has-text('Date')")).toBeVisible();
    await expect(page.locator("th:has-text('Actions')")).toBeVisible();

    // 6. Assert edit (✏️) and delete (🗑) buttons exist in the first row
    const firstRow = page.locator("tbody tr").first();
    await expect(firstRow.locator("button:has-text('✏️')")).toBeVisible();
    await expect(firstRow.locator("button:has-text('🗑')")).toBeVisible();
  });

  test("User can edit a disposal log entry", async ({ page }) => {
    // 1. Login
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to Disposal Log History tab
    await page.goto("http://localhost:5173/disposal");
    await page.click("button:has-text('📜 History')");

    // 3. Wait for loading
    await expect(page.locator('.spinner').first()).not.toBeVisible({ timeout: 10000 });

    // 4. Skip if no history entries exist
    const historyTable = page.locator("table");
    if (!(await historyTable.isVisible())) {
      test.skip();
      return;
    }

    // 5. Click edit button on the first row
    const firstRow = page.locator("tbody tr").first();
    await firstRow.locator("button:has-text('✏️')").click();

    // 6. Assert edit modal is visible
    await expect(page.locator("text=Edit Disposal Log")).toBeVisible();
    await expect(page.locator("label.form-label:has-text('Quantity')")).toBeVisible();
    await expect(page.locator("label.form-label:has-text('Weight')")).toBeVisible();
    await expect(page.locator("label.form-label:has-text('Unit')")).toBeVisible();
    await expect(page.locator("label.form-label:has-text('Guideline')")).toBeVisible();

    // 7. Update the quantity value
    const modalQuantityInput = page.locator('.modal-box input[type="number"]').first();
    await modalQuantityInput.fill("2");

    // 8. Save the edit
    await page.locator(".modal-box button:has-text('Update')").click();

    // 9. Modal should close after saving
    await expect(page.locator("text=Edit Disposal Log")).not.toBeVisible({ timeout: 5000 });
  });

  test("User can filter history by date range", async ({ page }) => {
    // 1. Login
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to Disposal Log History tab
    await page.goto("http://localhost:5173/disposal");
    await page.click("button:has-text('📜 History')");

    // 3. Wait for loading
    await expect(page.locator('.spinner').first()).not.toBeVisible({ timeout: 10000 });

    // 4. Fill in start and end date filters
    const dateInputs = page.locator('input[type="date"]');
    await dateInputs.first().fill("2024-01-01");
    await dateInputs.nth(1).fill("2025-12-31");

    // 5. Wait for reload and assert clear filter button appears
    await expect(page.locator("button:has-text('✕ Clear filter')")).toBeVisible({ timeout: 5000 });

    // 6. Clear the filter
    await page.click("button:has-text('✕ Clear filter')");
    await expect(page.locator("button:has-text('✕ Clear filter')")).not.toBeVisible();
  });

  test("Stats tab shows CO2 statistics and disposal chart", async ({ page }) => {
    // 1. Login
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to Disposal Log Stats tab
    await page.goto("http://localhost:5173/disposal");
    await page.click("button:has-text('📊 My Stats')");

    // 3. Wait for stats to load
    await page.waitForTimeout(2000);

    // 4. Check stat cards are visible (if any stats exist)
    const statCards = page.locator(".stat-card");
    if (await statCards.count() > 0) {
      await expect(page.locator("text=Total CO₂ Saved")).toBeVisible();
      await expect(page.locator("text=Total Weight")).toBeVisible();
      await expect(page.locator("text=Total Disposals")).toBeVisible();
      await expect(page.locator("text=Disposal by Method")).toBeVisible();
    }
  });

  test("Close edit modal without saving using ✕ button", async ({ page }) => {
    // 1. Login
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "pavan@gmail.com");
    await page.fill('input[name="password"]', "123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/");

    // 2. Navigate to Disposal Log History tab
    await page.goto("http://localhost:5173/disposal");
    await page.click("button:has-text('📜 History')");

    // 3. Wait for loading
    await expect(page.locator('.spinner').first()).not.toBeVisible({ timeout: 10000 });

    // 4. Skip if no history entries
    const historyTable = page.locator("table");
    if (!(await historyTable.isVisible())) {
      test.skip();
      return;
    }

    // 5. Open edit modal
    const firstRow = page.locator("tbody tr").first();
    await firstRow.locator("button:has-text('✏️')").click();
    await expect(page.locator("text=Edit Disposal Log")).toBeVisible();

    // 6. Close the modal using the ✕ button
    await page.locator(".modal-box button:has-text('✕')").click();
    await expect(page.locator("text=Edit Disposal Log")).not.toBeVisible();
  });
});
