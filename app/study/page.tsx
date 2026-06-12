"use client";

import { useEffect, useState, useCallback } from "react";
import { CategorySelector } from "@/components/study/CategorySelector";
import { FlashCard } from "@/components/study/FlashCard";
import { SessionTimer } from "@/components/study/SessionTimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateNextReview } from "@/lib/srs";
import { CheckCircle2, BookOpen } from "lucide-react";
import Link from "next/link";

interface StudyItem {
  id: string;
  category: string;
  itemKey: string;
  content: Record<string, unknown>;
  easeFactor: number;
  interval: number;
  repetitions: number;
}

interface SessionResponse {
  studyItemId: string;
  quality: number;
  timeMs: number;
}

type SessionState = "select" | "studying" | "complete";

export default function StudyPage() {
  const [state, setState] = useState<SessionState>("select");
  const [selectedCategory, setSelectedCategory] = useState("AI_PICK");
  const [aiRecommended, setAiRecommended] = useState<string | undefined>();
  const [items, setItems] = useState<StudyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<SessionResponse[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  const [dailyMinutes, setDailyMinutes] = useState(15);

  useEffect(() => {
    fetch("/api/user").then((r) => r.json()).then((u) => {
      setDailyMinutes(u.dailyMinutes ?? 15);
    });
    fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "analyze" }) })
      .then((r) => r.json())
      .then((rec) => { if (rec.recommendedCategory) setAiRecommended(rec.recommendedCategory); })
      .catch(() => {});
  }, []);

  const startSession = useCallback(async () => {
    const cat = selectedCategory === "AI_PICK" ? (aiRecommended ?? "VOCABULARY") : selectedCategory;
    const [itemsRes, sessionRes] = await Promise.all([
      fetch(`/api/study-items?category=${cat}&due=true&limit=30`).then((r) => r.json()),
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, aiSuggested: selectedCategory === "AI_PICK" }),
      }).then((r) => r.json()),
    ]);

    // If fewer than 5 due items, also fetch non-due items
    let studyItems: StudyItem[] = itemsRes;
    if (studyItems.length < 5) {
      const extra = await fetch(`/api/study-items?category=${cat}&limit=20`).then((r) => r.json());
      const extraFiltered = extra.filter((e: StudyItem) => !studyItems.some((i) => i.id === e.id));
      studyItems = [...studyItems, ...extraFiltered].slice(0, 20);
    }

    setItems(studyItems);
    setSessionId(sessionRes.id);
    setCurrentIndex(0);
    setResponses([]);
    setCardStartTime(Date.now());
    setState("studying");
  }, [selectedCategory, aiRecommended]);

  const handleResponse = useCallback(async (quality: number, timeMs: number) => {
    const item = items[currentIndex];
    if (!item) return;

    const srsResult = calculateNextReview(
      { easeFactor: item.easeFactor, interval: item.interval, repetitions: item.repetitions },
      quality
    );

    await fetch("/api/study-items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, ...srsResult, lastReview: new Date() }),
    });

    setResponses((prev) => [...prev, { studyItemId: item.id, quality, timeMs }]);

    if (currentIndex + 1 < items.length) {
      setCurrentIndex((i) => i + 1);
      setCardStartTime(Date.now());
    } else {
      await endSession(Date.now() - cardStartTime + timeMs);
    }
  }, [items, currentIndex, cardStartTime]);

  const endSession = useCallback(async (extraMs = 0) => {
    if (!sessionId) return;
    const allResponses = responses;
    const correct = allResponses.filter((r) => r.quality >= 3).length;

    await fetch("/api/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: sessionId,
        endedAt: new Date(),
        durationMs: extraMs,
        itemsStudied: allResponses.length,
        correctCount: correct,
        responses: allResponses,
      }),
    });
    setState("complete");
  }, [sessionId, responses]);

  const handleTimerComplete = useCallback(() => endSession(), [endSession]);
  const handleTimerEnd = useCallback((elapsedMs: number) => endSession(elapsedMs), [endSession]);

  if (state === "complete") {
    const correct = responses.filter((r) => r.quality >= 3).length;
    const pct = responses.length > 0 ? Math.round((correct / responses.length) * 100) : 0;
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4 py-8">
          <div className="text-6xl">🎌</div>
          <h1 className="text-2xl font-bold">Session Complete!</h1>
          <p className="text-muted-foreground">Great work! See you tomorrow for another 15 minutes.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{responses.length}</p><p className="text-xs text-muted-foreground">Cards reviewed</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{correct}</p><p className="text-xs text-muted-foreground">Correct</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{pct}%</p><p className="text-xs text-muted-foreground">Accuracy</p></CardContent></Card>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setState("select")} variant="outline" className="flex-1">Study More</Button>
          <Button asChild className="flex-1"><Link href="/">Back to Dashboard</Link></Button>
        </div>
      </div>
    );
  }

  if (state === "studying") {
    const item = items[currentIndex];
    if (!item) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">{item.category.toLowerCase()}</Badge>
            <span className="text-sm text-muted-foreground">{currentIndex + 1} / {items.length}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => endSession()}>End session</Button>
        </div>

        <SessionTimer
          totalSeconds={dailyMinutes * 60}
          onComplete={handleTimerComplete}
          onEnd={handleTimerEnd}
        />

        <FlashCard
          key={item.id}
          category={item.category}
          content={item.content}
          onResponse={handleResponse}
          startTime={cardStartTime}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Choose today&apos;s focus</h1>
        <p className="text-sm text-muted-foreground mt-1">AI will select the best area, or choose your own</p>
      </div>
      <CategorySelector
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        aiRecommended={aiRecommended}
      />
      <Button onClick={startSession} size="lg" className="w-full">
        <BookOpen className="h-5 w-5" />
        Start {dailyMinutes}-minute session
      </Button>
    </div>
  );
}
