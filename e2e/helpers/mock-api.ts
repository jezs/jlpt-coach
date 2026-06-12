import type { Page } from "@playwright/test";

// ── Canonical mock payloads ───────────────────────────────────────────────────

export const mockUser = {
  id: "default-user",
  hasApiKey: false,
  anthropicApiKey: null as string | null,
  dailyMinutes: 15,
  studyGoalDays: 365,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockUserWithKey = {
  ...mockUser,
  hasApiKey: true,
  anthropicApiKey: "••••••••3abc",
};

const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);

export const mockStudyItems = [
  {
    id: "item-1",
    userId: "default-user",
    category: "VOCABULARY",
    itemKey: "vocab:明晰",
    content: {
      word: "明晰",
      reading: "めいせき",
      meaning: "lucid, clear",
      exampleJa: "彼女の明晰な判断力に感銘を受けた。",
      exampleEn: "I was impressed by her clear judgment.",
      tags: ["adjective"],
    },
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReview: now.toISOString(),
    lastReview: null,
    correctStreak: 0,
    totalReviews: 0,
    correctReviews: 0,
  },
  {
    id: "item-2",
    userId: "default-user",
    category: "GRAMMAR",
    itemKey: "grammar:〜にほかならない",
    content: {
      pattern: "〜にほかならない",
      meaning: "nothing other than",
      usage: "Noun + にほかならない",
      example: "彼の成功は努力の結果にほかならない。",
      exampleTranslation: "His success is nothing other than hard work.",
      notes: "Used to strongly assert.",
    },
    easeFactor: 2.5,
    interval: 1,
    repetitions: 3,
    nextReview: now.toISOString(),
    lastReview: yesterday.toISOString(),
    correctStreak: 2,
    totalReviews: 5,
    correctReviews: 4,
  },
  {
    id: "item-3",
    userId: "default-user",
    category: "KANJI",
    itemKey: "kanji:憂",
    content: {
      kanji: "憂",
      readings: { on: ["ユウ"], kun: ["うれ.える"] },
      meanings: ["grief", "worry"],
      examples: [{ word: "憂鬱", reading: "ゆううつ", meaning: "melancholy" }],
      strokeCount: 15,
    },
    easeFactor: 2.8,
    interval: 6,
    repetitions: 5,
    nextReview: yesterday.toISOString(),
    lastReview: yesterday.toISOString(),
    correctStreak: 5,
    totalReviews: 8,
    correctReviews: 7,
  },
];

export const mockSessions = [
  {
    id: "session-1",
    userId: "default-user",
    startedAt: now.toISOString(),
    endedAt: now.toISOString(),
    durationMs: 600000,
    category: "VOCABULARY",
    itemsStudied: 10,
    correctCount: 8,
    aiSuggested: false,
    notes: null,
  },
  {
    id: "session-2",
    userId: "default-user",
    startedAt: yesterday.toISOString(),
    endedAt: yesterday.toISOString(),
    durationMs: 540000,
    category: "GRAMMAR",
    itemsStudied: 7,
    correctCount: 5,
    aiSuggested: true,
    notes: null,
  },
];

export const mockAiAnalysis = {
  recommendedCategory: "VOCABULARY",
  reasoning: "You have several vocabulary items due for review today.",
  weakAreas: ["N1 vocabulary", "Formal expressions"],
  strongAreas: ["Basic grammar"],
  studyTip: "Focus on high-frequency N1 vocabulary today.",
};

export const mockQuizSet = {
  title: "JLPT N1 練習問題",
  questions: [
    {
      id: "q-1",
      type: "kanji_reading",
      sectionLabel: "問１",
      instruction:
        "次の文の＿＿をつけた言葉の読み方として最もよいものを、1・2・3・4から一つ選びなさい。",
      stem: "彼女の（明晰）な判断力に感銘を受けた。",
      underlined: "明晰",
      options: ["めいせき", "めいさく", "めいしょ", "めいそく"],
      correctIndex: 0,
      explanation: "「明晰」の読み方は「めいせき」です。意味：lucid, clear",
      sourceItemKey: "vocab:明晰",
    },
    {
      id: "q-2",
      type: "grammar_fill",
      sectionLabel: "問４",
      instruction:
        "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
      stem: "彼の成功は努力の結果（　　）。",
      options: ["にほかならない", "をもって", "ならではの", "ともなると"],
      correctIndex: 0,
      explanation: "「〜にほかならない」= nothing other than。",
      sourceItemKey: "grammar:〜にほかならない",
    },
    {
      id: "q-3",
      type: "context_fill",
      sectionLabel: "問２",
      instruction:
        "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
      stem: "事件の（　　）を説明してください。",
      options: ["顛末", "末路", "結末", "顔面"],
      correctIndex: 0,
      explanation: "正解は「顛末」（てんまつ）。意味：full particulars",
      sourceItemKey: "vocab:顛末",
    },
  ],
};

// ── Setup function ────────────────────────────────────────────────────────────

export async function mockApiRoutes(
  page: Page,
  overrides: {
    user?: Partial<typeof mockUser>;
    items?: typeof mockStudyItems;
    sessions?: typeof mockSessions;
    aiAnalysis?: typeof mockAiAnalysis | null;
    quizSet?: typeof mockQuizSet;
  } = {}
) {
  const user = { ...mockUser, ...overrides.user };
  const items = overrides.items ?? mockStudyItems;
  const sessions = overrides.sessions ?? mockSessions;
  const aiAnalysis = overrides.aiAnalysis === null ? null : (overrides.aiAnalysis ?? null);
  const quizSet = overrides.quizSet ?? mockQuizSet;

  await page.route("**/api/user", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: user });
    } else if (route.request().method() === "PATCH") {
      const body = JSON.parse(route.request().postData() ?? "{}");
      await route.fulfill({
        json: {
          ...user,
          ...body,
          hasApiKey: body.anthropicApiKey ? true : user.hasApiKey,
          anthropicApiKey: body.anthropicApiKey
            ? "••••••••" + String(body.anthropicApiKey).slice(-4)
            : user.anthropicApiKey,
        },
      });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/study-items**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: items });
    } else {
      await route.fulfill({ json: items[0] ?? {} });
    }
  });

  await page.route("**/api/sessions**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: sessions });
    } else if (route.request().method() === "POST") {
      await route.fulfill({
        json: { id: "new-session-" + Date.now(), userId: "default-user", startedAt: new Date().toISOString() },
      });
    } else {
      await route.fulfill({ json: { id: "new-session", itemsStudied: 1, correctCount: 1 } });
    }
  });

  await page.route("**/api/ai", async (route) => {
    if (aiAnalysis) {
      await route.fulfill({ json: aiAnalysis });
    } else {
      await route.fulfill({ status: 400, json: { error: "No API key configured" } });
    }
  });

  await page.route("**/api/quiz**", async (route) => {
    await route.fulfill({ json: quizSet });
  });
}
