import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /AI for Assistive Technology/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Start Training/ })).toBeVisible();
  });

  test("lesson 1 page loads", async ({ page }) => {
    await page.goto("/lessons/responsible-ai");
    await expect(page.getByRole("main").getByRole("heading", { name: /Responsible AI/ })).toBeVisible();
    await expect(page.locator("text=Lesson 1 of 4")).toBeVisible();
  });

  test("lesson 2 page loads", async ({ page }) => {
    await page.goto("/lessons/prompt-engineering");
    await expect(page.getByRole("heading", { name: "Prompt Engineering for AT Resources", level: 1 })).toBeVisible();
  });

  test("lesson 3 page loads", async ({ page }) => {
    await page.goto("/lessons/data-privacy");
    await expect(page.getByRole("heading", { name: "Student Data Privacy & AI", level: 1 })).toBeVisible();
  });

  test("lesson 4 page loads", async ({ page }) => {
    await page.goto("/lessons/sett-framework");
    await expect(page.getByRole("heading", { name: "Using the SETT Framework with AI", level: 1 })).toBeVisible();
  });

  test("assistant page shows gate when not completed", async ({ page }) => {
    // Clear localStorage to reset completion
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    
    await page.goto("/assistant");
    await expect(page.getByRole("heading", { name: "Training Required", exact: true })).toBeVisible({ timeout: 10000 });
  });

  test("complete page loads", async ({ page }) => {
    await page.goto("/complete");
    // Should either show "Almost There" (partial) or "Congratulations" (complete)
    await expect(
      page.getByRole("heading", { name: /Almost There|Congratulations/ })
    ).toBeVisible();
  });

  test("404 page shows for invalid route", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await expect(page.locator("text=Page Not Found")).toBeVisible();
  });

  test("health check endpoint works", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBeDefined();
  });

  test("keyboard navigation works on landing page", async ({ page }) => {
    await page.goto("/");
    
    // Press Tab to focus first interactive element
    await page.keyboard.press("Tab");
    
    // Check that something is focused
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });
});

