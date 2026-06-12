"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, Volume2 } from "lucide-react";

interface FlashCardProps {
  category: string;
  content: Record<string, unknown>;
  onResponse: (quality: number, timeMs: number) => void;
  startTime: number;
}

const qualityButtons = [
  { q: 0, label: "Blackout", color: "bg-red-600 hover:bg-red-700" },
  { q: 1, label: "Forgot", color: "bg-red-400 hover:bg-red-500" },
  { q: 2, label: "Again", color: "bg-orange-400 hover:bg-orange-500" },
  { q: 3, label: "Hard", color: "bg-yellow-400 hover:bg-yellow-500 text-yellow-900" },
  { q: 4, label: "Good", color: "bg-green-400 hover:bg-green-500 text-green-900" },
  { q: 5, label: "Perfect", color: "bg-emerald-500 hover:bg-emerald-600" },
];

export function FlashCard({ category, content, onResponse, startTime }: FlashCardProps) {
  const [revealed, setReveal] = useState(false);

  const handleResponse = (q: number) => {
    onResponse(q, Date.now() - startTime);
  };

  const renderFront = () => {
    if (category === "VOCABULARY") {
      const v = content as { word: string; reading: string; tags: string[] };
      return (
        <div className="text-center space-y-3">
          <p className="text-5xl font-bold text-foreground">{v.word}</p>
          <p className="text-xl text-muted-foreground">{v.reading}</p>
          <div className="flex flex-wrap gap-1 justify-center">
            {v.tags?.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
          </div>
        </div>
      );
    }
    if (category === "GRAMMAR") {
      const g = content as { pattern: string; usage: string };
      return (
        <div className="text-center space-y-3">
          <p className="text-3xl font-bold">{g.pattern}</p>
          <p className="text-sm text-muted-foreground">{g.usage}</p>
        </div>
      );
    }
    if (category === "KANJI") {
      const k = content as { kanji: string; strokeCount: number };
      return (
        <div className="text-center space-y-3">
          <p className="text-7xl font-bold leading-none">{k.kanji}</p>
          <p className="text-sm text-muted-foreground">{k.strokeCount} strokes</p>
        </div>
      );
    }
    return <pre className="text-sm">{JSON.stringify(content, null, 2)}</pre>;
  };

  const renderBack = () => {
    if (category === "VOCABULARY") {
      const v = content as { meaning: string; exampleJa: string; exampleEn: string };
      return (
        <div className="space-y-4">
          <p className="text-2xl font-semibold text-center">{v.meaning}</p>
          <div className="bg-muted rounded-lg p-3 space-y-1">
            <p className="text-sm">{v.exampleJa}</p>
            <p className="text-xs text-muted-foreground italic">{v.exampleEn}</p>
          </div>
        </div>
      );
    }
    if (category === "GRAMMAR") {
      const g = content as { meaning: string; example: string; exampleTranslation: string; notes: string };
      return (
        <div className="space-y-4">
          <p className="text-xl font-semibold text-center">{g.meaning}</p>
          <div className="bg-muted rounded-lg p-3 space-y-1">
            <p className="text-sm">{g.example}</p>
            <p className="text-xs text-muted-foreground italic">{g.exampleTranslation}</p>
          </div>
          {g.notes && <p className="text-xs text-muted-foreground border-l-2 pl-3">{g.notes}</p>}
        </div>
      );
    }
    if (category === "KANJI") {
      const k = content as { readings: { on: string[]; kun: string[] }; meanings: string[]; examples: Array<{ word: string; reading: string; meaning: string }> };
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-muted-foreground">On:</span> {k.readings?.on?.join(", ")}</div>
            <div><span className="text-muted-foreground">Kun:</span> {k.readings?.kun?.join(", ")}</div>
          </div>
          <p className="font-medium">{k.meanings?.join(", ")}</p>
          <div className="space-y-1">
            {k.examples?.slice(0, 3).map((ex, i) => (
              <div key={i} className="text-sm bg-muted rounded px-2 py-1">
                <span className="font-medium">{ex.word}</span>
                <span className="text-muted-foreground ml-2">{ex.reading}</span>
                <span className="text-muted-foreground ml-2">—</span>
                <span className="ml-2">{ex.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="min-h-[220px]">
        <CardContent className="flex items-center justify-center p-8">
          {renderFront()}
        </CardContent>
      </Card>

      {!revealed ? (
        <Button onClick={() => setReveal(true)} variant="outline" className="w-full">
          <ChevronDown className="h-4 w-4" />
          Reveal Answer
        </Button>
      ) : (
        <>
          <Card>
            <CardContent className="p-6">{renderBack()}</CardContent>
          </Card>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {qualityButtons.map(({ q, label, color }) => (
              <Button
                key={q}
                className={cn("text-white text-xs py-2 h-auto", color)}
                onClick={() => handleResponse(q)}
              >
                {label}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
