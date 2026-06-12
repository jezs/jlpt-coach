"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Brain, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AnalyticsData {
  sessionsByDay: Array<{ date: string; sessions: number; items: number; accuracy: number }>;
  categoryStats: Array<{ category: string; total: number; mastered: number; accuracy: number }>;
  weakItems: Array<{ itemKey: string; category: string; accuracy: number; totalReviews: number }>;
  strongItems: Array<{ itemKey: string; category: string; accuracy: number; totalReviews: number }>;
  aiReport?: { weakAreas: string[]; strongAreas: string[]; studyTip: string } | null;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    const [itemsRes, sessionsRes, userRes] = await Promise.all([
      fetch("/api/study-items").then((r) => r.json()),
      fetch("/api/sessions").then((r) => r.json()),
      fetch("/api/user").then((r) => r.json()),
    ]);

    const items: Array<{ category: string; itemKey: string; repetitions: number; totalReviews: number; correctReviews: number }> = itemsRes;
    const sessions: Array<{ startedAt: string; itemsStudied: number; correctCount: number; category: string }> = sessionsRes;

    // Sessions by day (last 14 days)
    const dayMap = new Map<string, { sessions: number; items: number; correct: number }>();
    for (const s of sessions) {
      const day = s.startedAt.slice(0, 10);
      const prev = dayMap.get(day) ?? { sessions: 0, items: 0, correct: 0 };
      dayMap.set(day, { sessions: prev.sessions + 1, items: prev.items + s.itemsStudied, correct: prev.correct + s.correctCount });
    }
    const last14 = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().slice(0, 10);
    });
    const sessionsByDay = last14.map((date) => {
      const d = dayMap.get(date);
      return {
        date: date.slice(5),
        sessions: d?.sessions ?? 0,
        items: d?.items ?? 0,
        accuracy: d && d.items > 0 ? Math.round((d.correct / d.items) * 100) : 0,
      };
    });

    // Category stats
    const catMap = new Map<string, { total: number; mastered: number; correct: number; total_reviews: number }>();
    for (const item of items) {
      const prev = catMap.get(item.category) ?? { total: 0, mastered: 0, correct: 0, total_reviews: 0 };
      catMap.set(item.category, {
        total: prev.total + 1,
        mastered: prev.mastered + (item.repetitions >= 5 ? 1 : 0),
        correct: prev.correct + item.correctReviews,
        total_reviews: prev.total_reviews + item.totalReviews,
      });
    }
    const categoryStats = Array.from(catMap.entries()).map(([category, v]) => ({
      category,
      total: v.total,
      mastered: v.mastered,
      accuracy: v.total_reviews > 0 ? Math.round((v.correct / v.total_reviews) * 100) : 0,
    }));

    // Weak/strong items
    const reviewed = items.filter((i) => i.totalReviews >= 2);
    const withAcc = reviewed.map((i) => ({
      itemKey: i.itemKey,
      category: i.category,
      accuracy: Math.round((i.correctReviews / i.totalReviews) * 100),
      totalReviews: i.totalReviews,
    }));
    const weakItems = [...withAcc].sort((a, b) => a.accuracy - b.accuracy).slice(0, 8);
    const strongItems = [...withAcc].sort((a, b) => b.accuracy - a.accuracy).slice(0, 8);

    setData({ sessionsByDay, categoryStats, weakItems, strongItems, aiReport: null });

    if (userRes.hasApiKey) {
      fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "analyze" }) })
        .then((r) => r.json())
        .then((rec) => setData((prev) => prev ? { ...prev, aiReport: rec } : prev))
        .catch(() => {});
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Analytics</h1>

      {data.aiReport && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-purple-500" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Weak Areas</p>
              <div className="flex flex-wrap gap-1.5">
                {data.aiReport.weakAreas.map((a) => (
                  <Badge key={a} variant="destructive" className="text-xs">{a}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Strong Areas</p>
              <div className="flex flex-wrap gap-1.5">
                {data.aiReport.strongAreas.map((a) => (
                  <Badge key={a} variant="success" className="text-xs">{a}</Badge>
                ))}
              </div>
            </div>
            {data.aiReport.studyTip && (
              <p className="text-sm text-muted-foreground border-l-2 border-purple-300 pl-3">
                💡 {data.aiReport.studyTip}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Study activity (14 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.sessionsByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="items" fill="var(--primary)" radius={[3, 3, 0, 0]} name="Items reviewed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Accuracy trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={data.sessionsByDay.filter((d) => d.items > 0)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v) => [`${v}%`, "Accuracy"]} />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-semibold">Category breakdown</h2>
        {data.categoryStats.map((cat) => (
          <Card key={cat.category}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize text-sm">{cat.category.toLowerCase()}</span>
                <span className="text-sm text-muted-foreground">{cat.accuracy}% accuracy</span>
              </div>
              <Progress value={cat.total > 0 ? (cat.mastered / cat.total) * 100 : 0} />
              <p className="text-xs text-muted-foreground">{cat.mastered}/{cat.total} mastered</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.weakItems.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            Items to focus on
          </h2>
          <div className="space-y-2">
            {data.weakItems.map((item) => (
              <div key={item.itemKey} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.itemKey.split(":")[1]}</p>
                  <p className="text-xs text-muted-foreground capitalize">{item.category.toLowerCase()}</p>
                </div>
                <Badge variant={item.accuracy < 50 ? "destructive" : "warning"} className="ml-2 flex-shrink-0">
                  {item.accuracy}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.strongItems.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Mastered items
          </h2>
          <div className="space-y-2">
            {data.strongItems.slice(0, 5).map((item) => (
              <div key={item.itemKey} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.itemKey.split(":")[1]}</p>
                  <p className="text-xs text-muted-foreground capitalize">{item.category.toLowerCase()}</p>
                </div>
                <Badge variant="success" className="ml-2 flex-shrink-0">{item.accuracy}%</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
