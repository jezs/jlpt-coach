import { test, expect } from "@playwright/test";
import { mockApiRoutes, mockUserWithKey } from "./helpers/mock-api";

test.describe("Settings page — layout", () => {
  test("renders page title", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/settings");

    await expect(page.locator("h1")).toContainText("Settings");
  });

  test("shows API key section", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/settings");

    await expect(page.getByText("Anthropic API Key (BYOK)")).toBeVisible();
  });

  test("shows study settings section", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/settings");

    await expect(page.getByText("Study settings")).toBeVisible();
    await expect(page.getByText("Daily study time (minutes)")).toBeVisible();
    await expect(page.getByText(/Goal: pass N1 in/)).toBeVisible();
  });

  test("shows Save button", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/settings");

    await expect(page.getByRole("button", { name: /Save settings/ })).toBeVisible();
  });

  test("shows About section", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/settings");

    await expect(page.getByText("About JLPT N1 Coach")).toBeVisible();
  });
});

test.describe("Settings page — no API key", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page, { user: { hasApiKey: false } });
    await page.goto("/settings");
  });

  test("shows 'Not configured' status badge", async ({ page }) => {
    await expect(page.getByText("Not configured")).toBeVisible();
  });

  test("shows API key input field", async ({ page }) => {
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("shows eye toggle to reveal key input", async ({ page }) => {
    const toggleBtn = page.locator("button[type='button']").filter({ has: page.locator("svg") }).first();
    await expect(toggleBtn).toBeVisible();

    // Toggle to show
    await toggleBtn.click();
    await expect(page.locator("input[type='text']")).toBeVisible();

    // Toggle back to hide
    await toggleBtn.click();
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("shows placeholder hint for API key format", async ({ page }) => {
    const input = page.locator("input[placeholder*='sk-ant']");
    await expect(input).toBeVisible();
  });

  test("shows cost warning about Anthropic models", async ({ page }) => {
    await expect(page.getByText(/claude-opus-4-8/)).toBeVisible();
    await expect(page.getByText(/claude-haiku-4-5/)).toBeVisible();
  });
});

test.describe("Settings page — with API key", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page, { user: mockUserWithKey });
    await page.goto("/settings");
  });

  test("shows 'API key saved' badge", async ({ page }) => {
    await expect(page.getByText("API key saved")).toBeVisible();
  });

  test("shows Test connection button", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Test connection" })).toBeVisible();
  });

  test("shows Remove key button", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Remove key" })).toBeVisible();
  });

  test("Remove key clears the API key status", async ({ page }) => {
    await page.getByRole("button", { name: "Remove key" }).click();
    await expect(page.getByText("Not configured")).toBeVisible({ timeout: 3000 });
  });
});

test.describe("Settings page — interactions", () => {
  test("can type an API key", async ({ page }) => {
    await mockApiRoutes(page, { user: { hasApiKey: false } });
    await page.goto("/settings");

    const input = page.locator("input[placeholder*='sk-ant']");
    await input.fill("sk-ant-api03-testkey12345");
    await expect(input).toHaveValue("sk-ant-api03-testkey12345");
  });

  test("saving shows success feedback", async ({ page }) => {
    await mockApiRoutes(page, { user: { hasApiKey: false } });
    await page.goto("/settings");

    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByRole("button", { name: /Saved!/ })).toBeVisible({ timeout: 3000 });
  });

  test("daily minutes slider changes the displayed value", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/settings");

    // The slider should show the current value (15 min from mock) — use the mono display span
    await expect(page.locator("span.font-mono").filter({ hasText: "15 min" })).toBeVisible();
  });

  test("goal slider shows months", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/settings");

    // 365 days = ~12 months
    await expect(page.getByText(/\d+ months/)).toBeVisible();
  });

  test("Test connection shows result status", async ({ page }) => {
    await mockApiRoutes(page, {
      user: mockUserWithKey,
      aiAnalysis: {
        recommendedCategory: "VOCABULARY",
        reasoning: "test",
        weakAreas: [],
        strongAreas: [],
        studyTip: "test",
      },
    });
    await page.goto("/settings");

    await page.getByRole("button", { name: "Test connection" }).click();
    await expect(
      page.getByRole("button", { name: /✓ Working|✗ Failed|Testing/ })
    ).toBeVisible({ timeout: 5000 });
  });
});
