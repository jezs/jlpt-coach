import { test, expect } from "@playwright/test";
import { mockApiRoutes, mockUserWithKey, mockSessions } from "./helpers/mock-api";

test.describe("Dashboard", () => {
  test("renders title and navigation", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("JLPT N1 Coach");
    await expect(page.getByText("15 minutes a day towards N1")).toBeVisible();
  });

  test("shows API key warning when no key is set", async ({ page }) => {
    await mockApiRoutes(page, { user: { hasApiKey: false } });
    await page.goto("/");

    await expect(
      page.getByText("Add your Anthropic API key to unlock AI features")
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Setup" })).toBeVisible();
  });

  test("hides API key warning when key is set", async ({ page }) => {
    await mockApiRoutes(page, { user: mockUserWithKey });
    await page.goto("/");

    await expect(
      page.getByText("Add your Anthropic API key to unlock AI features")
    ).not.toBeVisible();
  });

  test("shows stats cards", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/");

    await expect(page.getByText("Due today")).toBeVisible();
    await expect(page.getByText("Mastered")).toBeVisible();
    await expect(page.getByText("Total items")).toBeVisible();
    // "Progress" also appears in "Category progress" heading — match the stat label specifically
    await expect(page.getByText("Progress", { exact: true }).first()).toBeVisible();
  });

  test("shows study streak", async ({ page }) => {
    await mockApiRoutes(page, { sessions: mockSessions });
    await page.goto("/");

    await expect(page.getByText(/day streak/)).toBeVisible();
  });

  test("shows recent sessions", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/");

    await expect(page.getByText("Recent sessions")).toBeVisible();
    await expect(page.getByText("vocabulary").first()).toBeVisible();
  });

  test("shows category progress section", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/");

    await expect(page.getByText("Category progress")).toBeVisible();
  });

  test("shows AI recommendation when API key is set", async ({ page }) => {
    await mockApiRoutes(page, {
      user: mockUserWithKey,
      aiAnalysis: {
        recommendedCategory: "VOCABULARY",
        reasoning: "You have several vocabulary items due for review today.",
        weakAreas: ["N1 vocabulary"],
        strongAreas: ["Basic grammar"],
        studyTip: "Focus on high-frequency N1 vocabulary today.",
      },
    });
    await page.goto("/");

    await expect(page.getByText("AI Recommendation")).toBeVisible();
    await expect(
      page.getByText("You have several vocabulary items due for review today.")
    ).toBeVisible();
  });

  test("Start session button links to /study", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/");

    const studyBtn = page.getByRole("link", { name: /Start 15-min session|Continue studying/ });
    await expect(studyBtn).toBeVisible();
    await studyBtn.click();
    await expect(page).toHaveURL("/study");
  });

  test("Quiz button links to /quiz", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/");

    await page.getByRole("link", { name: "Quiz" }).first().click();
    await expect(page).toHaveURL("/quiz");
  });

  test("navigation links are visible", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Study" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Analytics" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" }).first()).toBeVisible();
  });
});
