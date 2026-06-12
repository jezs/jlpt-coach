"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { JLPTQuestionCard } from "@/components/quiz/JLPTQuestion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { JLPTQuestion, QuestionType } from "@/lib/quiz";
import Link from "next/link";
import { Timer, CheckCircle2, XCircle, ChevronRight } from "lucide-react";

interface AnswerRecord {
  questionId: string;
  sectionLabel: string;
  correct: boolean;
  timeMs: number;
}

type SessionState = "loading" | "active" | "complete";

function QuizSessionInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = (searchParams.get("type") ?? "mixed") as QuestionType | "mixed";
  const count = parseInt(searchParams.get("count") ?? "10");
  const useAI = searchParams.get("ai") === "true";

  const [state, setState] = useState<SessionState>("loading");
  const [questions, setQuestions] = useState<JLPTQuestion[]>([]);
  const [title, setTitle] = useState("練習問題");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  const [currentAnswered, setCurrentAnswered] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    loadQuiz();
  }, []);

  useEffect(() => {
    if (state !== "active") return;
    const t = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  async function loadQuiz() {
    try {
      let data;
      if (useAI) {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "ai-generate", questionType: type === "mixed" ? "context_fill" : type, count }),
        });
        data = await res.json();
        if (data.error) throw new Error(data.error);
      } else {
        const res = await fetch(`/api/quiz?type=${type}&count=${count}`);
        data = await res.json();
      }
      setQuestions(data.questions ?? []);
      setTitle(data.title ?? "練習問題");
      setCardStartTime(Date.now());
      setState("active");
    } catch (e) {
      console.error(e);
      // Fallback to static
      const res = await fetch(`/api/quiz?type=${type}&count=${count}`);
      const data = await res.json();
      setQuestions(data.questions ?? []);
      setTitle(data.title ?? "練習問題");
      setCardStartTime(Date.now());
      setState("active");
    }
  }

  const handleAnswer = useCallback((selectedIndex: number, correct: boolean, timeMs: number) => {
    const q = questions[currentIndex];
    if (!q) return;
    setAnswers((prev) => [
      ...prev,
      { questionId: q.id, sectionLabel: q.sectionLabel, correct, timeMs },
    ]);
    setCurrentAnswered(true);
  }, [questions, currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setState("complete");
    } else {
      setCurrentIndex((i) => i + 1);
      setCurrentAnswered(false);
      setCardStartTime(Date.now());
    }
  }, [currentIndex, questions.length]);

  // ── Loading ──
  if (state === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-4xl animate-pulse">📝</div>
        <p className="text-muted-foreground">{useAI ? "AIが問題を生成中..." : "問題を準備中..."}</p>
      </div>
    );
  }

  // ── Results ──
  if (state === "complete") {
    const correct = answers.filter((a) => a.correct).length;
    const total = answers.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const avgTimeMs = total > 0 ? Math.round(answers.reduce((s, a) => s + a.timeMs, 0) / total) : 0;

    // By section breakdown
    const sections = [...new Set(answers.map((a) => a.sectionLabel))];
    const bySection = sections.map((sec) => {
      const sAnswers = answers.filter((a) => a.sectionLabel === sec);
      const sCorrect = sAnswers.filter((a) => a.correct).length;
      return { label: sec, correct: sCorrect, total: sAnswers.length };
    });

    const passed = pct >= 60;

    return (
      <div className="space-y-6">
        <div className="text-center space-y-3 py-6">
          <div className="text-5xl">{pct >= 80 ? "🏆" : pct >= 60 ? "✅" : "📚"}</div>
          <h1 className="text-2xl font-bold">試験終了</h1>
          <p className={cn("text-lg font-semibold", pct >= 60 ? "text-emerald-600" : "text-red-500")}>
            {correct}/{total}問正解 — {pct}%
          </p>
          <Badge variant={passed ? "success" : "destructive"} className="text-sm px-3 py-1">
            {passed ? "合格ライン達成 🎉" : "もっと練習しましょう"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{correct}</p>
            <p className="text-xs text-muted-foreground">正解</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{total - correct}</p>
            <p className="text-xs text-muted-foreground">不正解</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, "0")}</p>
            <p className="text-xs text-muted-foreground">所要時間</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{(avgTimeMs / 1000).toFixed(1)}s</p>
            <p className="text-xs text-muted-foreground">平均解答時間</p>
          </CardContent></Card>
        </div>

        {bySection.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">セクション別</p>
            {bySection.map(({ label, correct: c, total: t }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs font-medium w-10">{label}</span>
                <div className="flex-1">
                  <Progress value={(c / t) * 100} className="h-2" />
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">{c}/{t}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.push("/quiz")}>
            再挑戦
          </Button>
          <Button asChild className="flex-1">
            <Link href="/">ダッシュボード</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Active Quiz ──
  const q = questions[currentIndex];
  if (!q) return null;
  const progress = ((currentIndex) / questions.length) * 100;
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">{title}</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Timer className="h-3.5 w-3.5" />
          <span className="font-mono tabular-nums">{mins}:{String(secs).padStart(2, "0")}</span>
        </div>
      </div>

      <Progress value={progress} className="h-1.5" />

      {/* Question card */}
      <JLPTQuestionCard
        question={q}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        onAnswer={handleAnswer}
        startTime={cardStartTime}
      />

      {/* Next button — shown after answering */}
      {currentAnswered && (
        <Button onClick={handleNext} className="w-full" size="lg">
          {currentIndex + 1 < questions.length ? (
            <>次の問題 <ChevronRight className="h-4 w-4" /></>
          ) : (
            <>結果を見る <ChevronRight className="h-4 w-4" /></>
          )}
        </Button>
      )}
    </div>
  );
}

export default function QuizSessionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    }>
      <QuizSessionInner />
    </Suspense>
  );
}
