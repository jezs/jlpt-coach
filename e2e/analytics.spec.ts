import { test, expect } from "@playwright/test";
import { mockApiRoutes, mockUserWithKey } from "./helpers/mock-api";

test.describe("Analytics page", () => {
  test("renders page title", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/analytics");

    await expect(page.locator("h1")).toContainText("Analytics");
  });

  test("shows study activity chart section", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/analytics");

    await expect(page.getByText("Study activity (14 days)")).toBeVisible();
  });

  test("shows accuracy trend chart section", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/analytics");

    await expect(page.getByText("Accuracy trend")).toBeVisible();
  });

  test("shows category breakdown section", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/analytics");

    await expect(page.getByText("Category breakdown")).toBeVisible();
  });

  test("shows vocabulary, grammar and kanji categories", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/analytics");

    // These words appear in multiple sections — first() is sufficient to confirm presence
    await expect(page.getByText("vocabulary").first()).toBeVisible();
    await expect(page.getByText("grammar").first()).toBeVisible();
    await expect(page.getByText("kanji").first()).toBeVisible();
  });

  test("shows weak items section when items have reviews", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/analytics");

    await expect(page.getByText("Items to focus on")).toBeVisible();
  });

  test("shows mastered items section when items have reviews", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/analytics");

    await expect(page.getByText("Mastered items")).toBeVisible();
  });

  test("shows AI analysis section when API key is set", async ({ page }) => {
    await mockApiRoutes(page, {
      user: mockUserWithKey,
      aiAnalysis: {
        recommendedCategory: "VOCABULARY",
        reasoning: "Focus on vocabulary this week.",
        weakAreas: ["Formal expressions", "N1 vocabulary"],
        strongAreas: ["Basic grammar"],
        studyTip: "Review 5 new words daily.",
      },
    });
    await page.goto("/analytics");

    await expect(page.getByText("AI Analysis")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Weak Areas")).toBeVisible();
    await expect(page.getByText("Strong Areas")).toBeVisible();
  });

  test("shows item accuracy percentages", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/analytics");

    // Items with reviews should show accuracy badges
    await expect(page.getByText(/%/).first()).toBeVisible();
  });

  test("navigation to other pages works from analytics", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/analytics");

    await page.getByRole("link", { name: "Study" }).first().click();
    await expect(page).toHaveURL("/study");
  });
});
