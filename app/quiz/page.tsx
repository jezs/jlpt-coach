"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles, ChevronRight } from "lucide-react";
import type { QuestionType } from "@/lib/quiz";

const QUESTION_TYPES: Array<{
  id: QuestionType | "mixed";
  label: string;
  kanji: string;
  description: string;
  color: string;
}> = [
  {
    id: "mixed",
    label: "総合問題",
    kanji: "総",
    description: "全セクション混合。実際のN1試験形式",
    color: "from-purple-500 to-blue-500",
  },
  {
    id: "kanji_reading",
    label: "問１ 漢字読み",
    kanji: "読",
    description: "下線の言葉の読み方を選ぶ",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "context_fill",
    label: "問２ 文脈規定",
    kanji: "語",
    description: "（　）に入る最もよい言葉を選ぶ",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "synonym",
    label: "問３ 言い換え",
    kanji: "義",
    description: "意味が最も近いものを選ぶ",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "grammar_fill",
    label: "問４ 文の文法",
    kanji: "法",
    description: "（　）に入る文法形式を選ぶ",
    color: "from-rose-500 to-pink-500",
  },
  {
    id: "usage",
    label: "問５ 用法",
    kanji: "用",
    description: "漢字の正しい読み方・使い方を選ぶ",
    color: "from-violet-500 to-purple-500",
  },
];

const QUESTION_COUNTS = [5, 10, 15, 20];

export default function QuizLandingPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<QuestionType | "mixed">("mixed");
  const [questionCount, setQuestionCount] = useState(10);
  const [useAI, setUseAI] = useState(false);

  const handleStart = () => {
    const params = new URLSearchParams({
      type: selectedType,
      count: String(questionCount),
      ai: String(useAI),
    });
    router.push(`/quiz/session?${params}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">練習問題</h1>
        <p className="text-sm text-muted-foreground mt-1">JLPT N1 形式の多肢選択問題</p>
      </div>

      {/* Question type selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium">問題タイプ</p>
        <div className="grid grid-cols-2 gap-2.5">
          {QUESTION_TYPES.map(({ id, label, kanji, description, color }) => (
            <button
              key={id}
              onClick={() => setSelectedType(id)}
              className={cn(
                "text-left p-3 rounded-xl border-2 transition-all",
                selectedType === id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className={cn("w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm flex-shrink-0", color)}>
                  {kanji}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Question count */}
      <div className="space-y-2">
        <p className="text-sm font-medium">問題数</p>
        <div className="flex gap-2">
          {QUESTION_COUNTS.map((n) => (
            <button
              key={n}
              onClick={() => setQuestionCount(n)}
              className={cn(
                "flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                questionCount === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/40"
              )}
            >
              {n}問
            </button>
          ))}
        </div>
      </div>

      {/* AI toggle */}
      <Card className={cn("border-2 transition-all cursor-pointer", useAI ? "border-purple-400 bg-purple-50 dark:bg-purple-950/20" : "border-dashed")}
        onClick={() => setUseAI(!useAI)}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", useAI ? "bg-purple-500" : "bg-muted")}>
            <Sparkles className={cn("h-4 w-4", useAI ? "text-white" : "text-muted-foreground")} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">AI生成問題</p>
            <p className="text-xs text-muted-foreground">Claudeがあなたの弱点に基づき問題を生成（APIキー必要）</p>
          </div>
          <Badge variant={useAI ? "default" : "outline"}>{useAI ? "ON" : "OFF"}</Badge>
        </CardContent>
      </Card>

      <Button onClick={handleStart} size="lg" className="w-full">
        試験開始
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Real JLPT format note */}
      <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">実際のJLPT N1形式について</p>
        <p>• 問１: 漢字読み（5問） • 問２: 表記（5問） • 問３: 語彙（7問）</p>
        <p>• 問４: 言い換え（6問） • 問５: 用法（6問） • 文法（13問）</p>
        <p>• 読解（14問） — 合計 約180分</p>
      </div>
    </div>
  );
}
