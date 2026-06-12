import { test, expect } from "@playwright/test";
import { mockApiRoutes } from "./helpers/mock-api";

test.describe("Study page — category selector", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page);
  });

  test("renders heading and subtitle", async ({ page }) => {
    await page.goto("/study");

    await expect(page.getByText("Choose today's focus")).toBeVisible();
    await expect(page.getByText("AI will select the best area")).toBeVisible();
  });

  test("shows all category options", async ({ page }) => {
    await page.goto("/study");

    await expect(page.getByText("総合問題").or(page.getByText("AI Pick"))).toBeVisible();
    await expect(page.getByText("Vocabulary").first()).toBeVisible();
    await expect(page.getByText("Grammar").first()).toBeVisible();
    await expect(page.getByText("Kanji").first()).toBeVisible();
    await expect(page.getByText("Reading").first()).toBeVisible();
  });

  test("selecting a category highlights it", async ({ page }) => {
    await page.goto("/study");

    const grammarBtn = page.getByRole("button").filter({ hasText: "Grammar" });
    await grammarBtn.click();
    await expect(grammarBtn).toHaveClass(/border-primary/);
  });

  test("start session button is visible", async ({ page }) => {
    await page.goto("/study");

    await expect(
      page.getByRole("button", { name: /Start.*session/ })
    ).toBeVisible();
  });
});

test.describe("Study page — flashcard session", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/study");
    // Start the session
    await page.getByRole("button", { name: /Start.*session/ }).click();
  });

  test("shows flashcard after starting session", async ({ page }) => {
    // Vocabulary card front should show the word
    await expect(page.getByText("明晰").or(page.getByText("〜にほかならない"))).toBeVisible();
  });

  test("shows session timer", async ({ page }) => {
    await expect(page.getByText("Session timer")).toBeVisible();
    // Timer should display mm:ss format
    await expect(page.locator(".font-mono").filter({ hasText: /\d{2}:\d{2}/ })).toBeVisible();
  });

  test("shows category badge and progress counter", async ({ page }) => {
    await expect(page.getByText(/vocabulary|grammar|kanji/i).first()).toBeVisible();
    await expect(page.getByText(/\d+ \/ \d+/).first()).toBeVisible();
  });

  test("shows Reveal Answer button before answer", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Reveal Answer" })).toBeVisible();
  });

  test("reveals answer and shows quality buttons", async ({ page }) => {
    await page.getByRole("button", { name: "Reveal Answer" }).click();

    // Quality buttons should appear
    await expect(page.getByRole("button", { name: "Perfect" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Good" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hard" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Again" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Blackout" })).toBeVisible();
  });

  test("clicking a quality button advances to next card or completes session", async ({ page }) => {
    await page.getByRole("button", { name: "Reveal Answer" }).click();
    await page.getByRole("button", { name: "Good" }).click();

    // Either the next card loads (counter increments) or session completes
    const nextCard = page.getByText(/\d+ \/ \d+/).or(page.getByText("Session Complete!"));
    await expect(nextCard).toBeVisible({ timeout: 5000 });
  });

  test("End session button is visible and works", async ({ page }) => {
    await page.getByRole("button", { name: "End session" }).click();
    await expect(page.getByText("Session Complete!")).toBeVisible();
  });

  test("timer Pause and Resume toggles work", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
    await page.getByRole("button", { name: "Resume" }).click();
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  });
});

test.describe("Study page — session complete", () => {
  test("shows results after session ends", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/study");
    await page.getByRole("button", { name: /Start.*session/ }).click();
    await page.getByRole("button", { name: "End session" }).click();

    await expect(page.getByText("Session Complete!")).toBeVisible();
    await expect(page.getByText("Cards reviewed")).toBeVisible();
    await expect(page.getByText("Correct")).toBeVisible();
    await expect(page.getByText("Accuracy")).toBeVisible();
  });

  test("shows Back to Dashboard and Study More buttons", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/study");
    await page.getByRole("button", { name: /Start.*session/ }).click();
    await page.getByRole("button", { name: "End session" }).click();

    await expect(page.getByRole("link", { name: "Back to Dashboard" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Study More" })).toBeVisible();
  });

  test("Study More resets to category selector", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/study");
    await page.getByRole("button", { name: /Start.*session/ }).click();
    await page.getByRole("button", { name: "End session" }).click();
    await page.getByRole("button", { name: "Study More" }).click();

    await expect(page.getByText("Choose today's focus")).toBeVisible();
  });
});
