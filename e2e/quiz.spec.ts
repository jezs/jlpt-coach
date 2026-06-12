import { test, expect } from "@playwright/test";
import { mockApiRoutes } from "./helpers/mock-api";

test.describe("Quiz landing page", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/quiz");
  });

  test("renders title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("練習問題");
    await expect(page.getByText("JLPT N1 形式の多肢選択問題")).toBeVisible();
  });

  test("shows all question type options", async ({ page }) => {
    await expect(page.getByText("総合問題")).toBeVisible();
    await expect(page.getByText("問１ 漢字読み")).toBeVisible();
    await expect(page.getByText("問２ 文脈規定")).toBeVisible();
    await expect(page.getByText("問３ 言い換え")).toBeVisible();
    await expect(page.getByText("問４ 文の文法")).toBeVisible();
    await expect(page.getByText("問５ 用法")).toBeVisible();
  });

  test("question count buttons are visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: "5問", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "10問", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "15問", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "20問", exact: true })).toBeVisible();
  });

  test("can change question count", async ({ page }) => {
    await page.getByRole("button", { name: "5問", exact: true }).click();
    await expect(page.getByRole("button", { name: "5問", exact: true })).toHaveClass(/bg-primary/);
  });

  test("selecting a question type highlights it", async ({ page }) => {
    const grammarBtn = page.getByRole("button").filter({ hasText: "問４ 文の文法" });
    await grammarBtn.click();
    await expect(grammarBtn).toHaveClass(/border-primary/);
  });

  test("AI toggle card is visible", async ({ page }) => {
    await expect(page.getByText("AI生成問題")).toBeVisible();
    await expect(page.getByText("OFF")).toBeVisible();
  });

  test("clicking AI toggle switches it ON", async ({ page }) => {
    await page.getByText("AI生成問題").click();
    await expect(page.getByText("ON")).toBeVisible();
  });

  test("start button navigates to quiz session", async ({ page }) => {
    await page.getByRole("button", { name: "試験開始" }).click();
    await expect(page).toHaveURL(/\/quiz\/session/);
  });

  test("shows real JLPT format info", async ({ page }) => {
    await expect(page.getByText("実際のJLPT N1形式について")).toBeVisible();
  });
});

test.describe("Quiz session — question display", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/quiz/session?type=mixed&count=3&ai=false");
    // Wait for questions to load
    await expect(page.locator("h1, [class*='font-bold']").filter({ hasText: "練習問題" })).toBeVisible({ timeout: 10000 });
  });

  test("shows question section label (問X)", async ({ page }) => {
    await expect(page.getByText(/問[１２３４５]/)).toBeVisible();
  });

  test("shows instruction line in Japanese", async ({ page }) => {
    await expect(page.getByText(/選びなさい/)).toBeVisible();
  });

  test("shows exactly 4 options numbered 1-4", async ({ page }) => {
    // JLPT uses numeric 1-4, not A-D
    await expect(page.getByText("1").first()).toBeVisible();
    await expect(page.getByText("2").first()).toBeVisible();
    await expect(page.getByText("3").first()).toBeVisible();
    await expect(page.getByText("4").first()).toBeVisible();
  });

  test("shows question progress counter", async ({ page }) => {
    await expect(page.getByText(/1 \/ 3/)).toBeVisible();
  });

  test("shows elapsed timer", async ({ page }) => {
    await expect(page.locator(".font-mono").filter({ hasText: /\d:\d{2}/ })).toBeVisible();
  });

  test("shows progress bar", async ({ page }) => {
    await expect(page.locator("div[role='progressbar'], [class*='Progress']").first()).toBeVisible();
  });
});

test.describe("Quiz session — answering questions", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/quiz/session?type=mixed&count=3&ai=false");
    await page.waitForTimeout(1000); // wait for questions to load
  });

  test("clicking an option reveals answer feedback", async ({ page }) => {
    // Click option 1 (first option button)
    const optionBtns = page.locator("button").filter({ hasText: /^[めいせきあおきゅう]/ }).or(
      page.locator("button").filter({ hasText: /にほかならない|をもって|ならでは|ともなると/ })
    );

    // More reliable: click the first numbered option
    await page.locator("button").filter({ has: page.locator("span", { hasText: "1" }) }).first().click();

    // Correct answer should be highlighted green
    await expect(
      page.locator("[class*='emerald']").first()
    ).toBeVisible({ timeout: 3000 });
  });

  test("correct answer shows ✓ 正解", async ({ page }) => {
    // Click the correct answer (index 0 in all our mock questions)
    await page.locator("button").filter({ has: page.locator("span", { hasText: "1" }) }).first().click();

    await expect(page.getByText("✓ 正解！")).toBeVisible({ timeout: 3000 });
  });

  test("wrong answer shows ✗ 不正解 with correct answer", async ({ page }) => {
    // Click option 2 (index 1, which is wrong in our mock where correctIndex=0)
    await page.locator("button").filter({ has: page.locator("span", { hasText: "2" }) }).first().click();

    await expect(page.getByText(/✗ 不正解/)).toBeVisible({ timeout: 3000 });
  });

  test("explanation is shown after answering", async ({ page }) => {
    await page.locator("button").filter({ has: page.locator("span", { hasText: "1" }) }).first().click();
    // Explanation text appears in the feedback area
    await expect(
      page.getByText(/読み方|意味|文法/).first()
    ).toBeVisible({ timeout: 3000 });
  });

  test("次の問題 button appears after answering", async ({ page }) => {
    await page.locator("button").filter({ has: page.locator("span", { hasText: "1" }) }).first().click();
    await expect(
      page.getByRole("button", { name: /次の問題|結果を見る/ })
    ).toBeVisible({ timeout: 3000 });
  });

  test("can navigate to next question", async ({ page }) => {
    await page.locator("button").filter({ has: page.locator("span", { hasText: "1" }) }).first().click();
    await page.getByRole("button", { name: /次の問題|結果を見る/ }).click();

    // Either shows question 2 or results page
    await expect(
      page.getByText(/2 \/ 3/).or(page.getByText("試験終了"))
    ).toBeVisible({ timeout: 3000 });
  });
});

// Helper: answer one question and advance to the next
async function answerAndAdvance(page: import("@playwright/test").Page) {
  // After the previous "next" click, React remounts JLPTQuestionCard (via key prop),
  // resetting disabled state. Wait for an option that is not disabled.
  const optionBtn = page
    .locator("button")
    .filter({ has: page.locator("span", { hasText: /^[1-4]$/ }) })
    .and(page.locator("button:not([disabled])"))
    .first();
  await expect(optionBtn).toBeVisible({ timeout: 5000 });
  await optionBtn.click();
  await page.getByRole("button", { name: /次の問題|結果を見る/ }).click();
}

test.describe("Quiz session — results", () => {
  test("shows results page after completing all questions", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/quiz/session?type=mixed&count=3&ai=false");

    for (let i = 0; i < 3; i++) await answerAndAdvance(page);

    await expect(page.getByText("試験終了")).toBeVisible({ timeout: 5000 });
  });

  test("results show score, time, and accuracy", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/quiz/session?type=mixed&count=3&ai=false");

    for (let i = 0; i < 3; i++) await answerAndAdvance(page);

    await expect(page.getByText("正解", { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("不正解", { exact: true })).toBeVisible();
    await expect(page.getByText("所要時間")).toBeVisible();
    await expect(page.getByText("平均解答時間")).toBeVisible();
  });

  test("results show 再挑戦 and ダッシュボード buttons", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/quiz/session?type=mixed&count=3&ai=false");

    for (let i = 0; i < 3; i++) await answerAndAdvance(page);

    await expect(page.getByRole("button", { name: "再挑戦" })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("link", { name: "ダッシュボード" })).toBeVisible();
  });

  test("再挑戦 navigates back to quiz landing", async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto("/quiz/session?type=mixed&count=3&ai=false");

    for (let i = 0; i < 3; i++) await answerAndAdvance(page);

    await page.getByRole("button", { name: "再挑戦" }).click();
    await expect(page).toHaveURL("/quiz");
  });
});
