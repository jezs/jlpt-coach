import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/utils";
import { analyzeStudyPatterns, generateQuizQuestion, explainItem } from "@/lib/ai";
import type { StudyStats } from "@/lib/ai";

export async function POST(req: Request) {
  const body = await req.json();
  const { action, ...params } = body;

  const user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
  if (!user?.anthropicApiKey) {
    return NextResponse.json({ error: "No API key configured. Go to Settings to add your Anthropic API key." }, { status: 400 });
  }

  try {
    if (action === "analyze") {
      const stats = await buildStats();
      const analysis = await analyzeStudyPatterns(user.anthropicApiKey, stats);
      return NextResponse.json(analysis);
    }

    if (action === "quiz") {
      const { category, content, difficulty } = params;
      const question = await generateQuizQuestion(user.anthropicApiKey, category, content, difficulty);
      return NextResponse.json(question);
    }

    if (action === "explain") {
      const { category, content } = params;
      const explanation = await explainItem(user.anthropicApiKey, category, content);
      return NextResponse.json({ explanation });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function buildStats(): Promise<StudyStats> {
  const items = await prisma.studyItem.findMany({ where: { userId: DEFAULT_USER_ID } });
  const sessions = await prisma.studySession.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { startedAt: "desc" },
    take: 30,
  });

  const accuracyByCategory: Record<string, number> = {};
  const categoryTotals: Record<string, { correct: number; total: number }> = {};

  for (const item of items) {
    const cat = item.category;
    if (!categoryTotals[cat]) categoryTotals[cat] = { correct: 0, total: 0 };
    categoryTotals[cat].correct += item.correctReviews;
    categoryTotals[cat].total += item.totalReviews;
  }

  for (const [cat, { correct, total }] of Object.entries(categoryTotals)) {
    accuracyByCategory[cat] = total > 0 ? Math.round((correct / total) * 100) : 0;
  }

  const weakItems = items
    .filter((i) => i.totalReviews > 0)
    .map((i) => ({ itemKey: i.itemKey, category: i.category, accuracy: Math.round((i.correctReviews / i.totalReviews) * 100) }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 10);

  const strongItems = items
    .filter((i) => i.totalReviews > 0)
    .map((i) => ({ itemKey: i.itemKey, category: i.category, accuracy: Math.round((i.correctReviews / i.totalReviews) * 100) }))
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 10);

  const streakDays = computeStreak(sessions.map((s) => s.startedAt));

  return {
    totalSessions: sessions.length,
    totalItems: items.reduce((s, i) => s + i.totalReviews, 0),
    accuracyByCategory,
    recentStreak: streakDays,
    weakItems,
    strongItems,
  };
}

function computeStreak(dates: Date[]): number {
  if (!dates.length) return 0;
  const days = [...new Set(dates.map((d) => d.toISOString().slice(0, 10)))].sort().reverse();
  let streak = 0;
  let prev = new Date();
  prev.setHours(0, 0, 0, 0);
  for (const day of days) {
    const d = new Date(day);
    const diff = Math.round((prev.getTime() - d.getTime()) / 86400000);
    if (diff <= 1) { streak++; prev = d; } else break;
  }
  return streak;
}
