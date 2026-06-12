"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Flame, Target, Sparkles, TrendingUp, AlertCircle, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DashboardData {
  hasApiKey: boolean;
  streak: number;
  todayDone: boolean;
  dueCount: number;
  totalItems: number;
  masteredItems: number;
  recentSessions: Array<{ id: string; startedAt: string; category: string; itemsStudied: number; correctCount: number }>;
  categoryProgress: Record<string, { total: number; mastered: number }>;
  aiRecommendation?: { recommendedCategory: string; reasoning: string; studyTip: string } | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const [userRes, itemsRes, sessionsRes] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/study-items"),
        fetch("/api/sessions"),
      ]);
      const user = await userRes.json();
      const items: Array<{ category: string; repetitions: number; nextReview: string }> = await itemsRes.json();
      const sessions: Array<{ startedAt: string; category: string; itemsStudied: number; correctCount: number; id: string }> = await sessionsRes.json();

      const today = new Date().toISOString().slice(0, 10);
      const todayDone = sessions.some((s) => s.startedAt.slice(0, 10) === today);

      const streakDays = computeStreak(sessions.map((s) => new Date(s.startedAt)));

      const dueCount = items.filter((i) => new Date(i.nextReview) <= new Date()).length;

      const masteredItems = items.filter((i) => i.repetitions >= 5).length;

      const categoryProgress: Record<string, { total: number; mastered: number }> = {};
      for (const item of items) {
        if (!categoryProgress[item.category]) categoryProgress[item.category] = { total: 0, mastered: 0 };
        categoryProgress[item.category].total++;
        if (item.repetitions >= 5) categoryProgress[item.category].mastered++;
      }

      setData({
        hasApiKey: user.hasApiKey,
        streak: streakDays,
        todayDone,
        dueCount,
        totalItems: items.length,
        masteredItems,
        recentSessions: sessions.slice(0, 5),
        categoryProgress,
        aiRecommendation: null,
      });

      if (user.hasApiKey) {
        fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "analyze" }) })
          .then((r) => r.json())
          .then((rec) => setData((prev) => prev ? { ...prev, aiRecommendation: rec } : prev))
          .catch(() => {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-pulse">🎌</div>
          <p className="text-muted-foreground">Loading your study data...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const overallProgress = data.totalItems > 0 ? Math.round((data.masteredItems / data.totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">JLPT N1 Coach</h1>
          <p className="text-muted-foreground text-sm">15 minutes a day towards N1</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Flame className={data.streak > 0 ? "text-orange-500 h-5 w-5" : "text-muted-foreground h-5 w-5"} />
          <span className={data.streak > 0 ? "text-orange-500" : "text-muted-foreground"}>
            {data.streak} day streak
          </span>
        </div>
      </div>

      {!data.hasApiKey && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Add your Anthropic API key to unlock AI features</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">AI recommendations, quiz generation & weakness analysis</p>
            </div>
            <Button size="sm" variant="outline" asChild className="border-amber-300 flex-shrink-0">
              <Link href="/settings">Setup</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{data.dueCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Due today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{data.masteredItems}</p>
            <p className="text-xs text-muted-foreground mt-1">Mastered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{data.totalItems}</p>
            <p className="text-xs text-muted-foreground mt-1">Total items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{overallProgress}%</p>
            <p className="text-xs text-muted-foreground mt-1">Progress</p>
          </CardContent>
        </Card>
      </div>

      {data.aiRecommendation && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">AI Recommendation</p>
                <p className="text-sm text-muted-foreground">{data.aiRecommendation.reasoning}</p>
                {data.aiRecommendation.studyTip && (
                  <p className="text-xs text-purple-700 dark:text-purple-300 mt-2 border-l-2 border-purple-300 pl-2">
                    💡 {data.aiRecommendation.studyTip}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Today&apos;s study</h2>
          {data.todayDone && <Badge variant="success">✓ Done for today</Badge>}
        </div>
        <Button asChild size="lg" className="w-full">
          <Link href="/study">
            <BookOpen className="h-5 w-5" />
            {data.todayDone ? "Continue studying" : "Start 15-min session"}
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Category progress</h2>
        {Object.entries(data.categoryProgress).map(([cat, { total, mastered }]) => (
          <div key={cat} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="capitalize">{cat.toLowerCase()}</span>
              <span className="text-muted-foreground">{mastered}/{total}</span>
            </div>
            <Progress value={total > 0 ? (mastered / total) * 100 : 0} />
          </div>
        ))}
      </div>

      {data.recentSessions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent sessions</h2>
            <Link href="/analytics" className="text-sm text-primary flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {data.recentSessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium capitalize">{s.category?.toLowerCase() ?? "Mixed"}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(s.startedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{s.itemsStudied} items</p>
                  <p className="text-xs text-muted-foreground">
                    {s.itemsStudied > 0 ? Math.round((s.correctCount / s.itemsStudied) * 100) : 0}% correct
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
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
