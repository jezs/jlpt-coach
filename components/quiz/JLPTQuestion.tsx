"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import type { JLPTQuestion } from "@/lib/quiz";

interface JLPTQuestionProps {
  question: JLPTQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedIndex: number, correct: boolean, timeMs: number) => void;
  startTime: number;
}

export function JLPTQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  startTime,
}: JLPTQuestionProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (idx: number) => {
    if (revealed) return;
    const timeMs = Date.now() - startTime;
    setSelected(idx);
    setRevealed(true);
    onAnswer(idx, idx === question.correctIndex, timeMs);
  };

  const correct = selected === question.correctIndex;

  return (
    <div className="space-y-5">
      {/* Question header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{question.sectionLabel}</span>
        <span>{questionNumber} / {totalQuestions}</span>
      </div>

      {/* Instruction line — matches real JLPT exam style */}
      <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-3">
        {question.instruction}
      </p>

      {/* Stem */}
      <div className="bg-muted/50 rounded-xl p-5 border">
        <p className="text-base leading-loose font-medium text-center">
          {question.underlined ? (
            renderWithUnderline(question.stem, question.underlined)
          ) : (
            question.stem
          )}
        </p>
      </div>

      {/* Options — JLPT uses 1·2·3·4, not A/B/C/D */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt, idx) => {
          const isCorrect = idx === question.correctIndex;
          const isSelected = idx === selected;

          let stateClass = "border-border hover:border-primary/50 hover:bg-accent";
          if (revealed) {
            if (isCorrect) stateClass = "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30";
            else if (isSelected && !isCorrect) stateClass = "border-red-400 bg-red-50 dark:bg-red-950/30";
            else stateClass = "border-border opacity-50";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={revealed}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                stateClass,
                !revealed && "cursor-pointer"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                  revealed && isCorrect
                    ? "bg-emerald-500 text-white"
                    : revealed && isSelected && !isCorrect
                    ? "bg-red-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {idx + 1}
              </span>
              <span className="text-sm font-medium">{opt}</span>
              {revealed && isCorrect && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto flex-shrink-0" />
              )}
              {revealed && isSelected && !isCorrect && (
                <XCircle className="h-4 w-4 text-red-500 ml-auto flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation — shown after answering */}
      {revealed && (
        <div
          className={cn(
            "rounded-xl p-4 border-l-4 text-sm space-y-1",
            correct
              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
              : "border-red-400 bg-red-50 dark:bg-red-950/20"
          )}
        >
          <p className={cn("font-semibold", correct ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300")}>
            {correct ? "✓ 正解！" : `✗ 不正解。正解は「${question.options[question.correctIndex]}」`}
          </p>
          <p className="text-muted-foreground">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

function renderWithUnderline(text: string, underlined: string) {
  const parts = text.split(`（${underlined}）`);
  if (parts.length < 2) return <>{text}</>;
  return (
    <>
      {parts[0]}
      <span className="underline decoration-2 underline-offset-4 font-bold text-primary">
        {underlined}
      </span>
      {parts[1]}
    </>
  );
}
