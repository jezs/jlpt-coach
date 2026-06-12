"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const CATEGORIES = [
  { id: "AI_PICK", label: "AI Pick", description: "Let AI choose the best focus area", icon: "✨", color: "from-purple-500 to-pink-500" },
  { id: "VOCABULARY", label: "Vocabulary", description: "N1 level words & expressions", icon: "📚", color: "from-blue-500 to-cyan-500" },
  { id: "GRAMMAR", label: "Grammar", description: "N1 grammar patterns", icon: "🔤", color: "from-green-500 to-emerald-500" },
  { id: "KANJI", label: "Kanji", description: "N1 kanji readings & meanings", icon: "漢", color: "from-orange-500 to-amber-500" },
  { id: "READING", label: "Reading", description: "Comprehension practice", icon: "📖", color: "from-red-500 to-rose-500" },
];

interface CategorySelectorProps {
  selected: string;
  onSelect: (id: string) => void;
  aiRecommended?: string;
}

export function CategorySelector({ selected, onSelect, aiRecommended }: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {CATEGORIES.map(({ id, label, description, icon, color }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={cn(
            "relative text-left p-4 rounded-xl border-2 transition-all",
            selected === id
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-accent"
          )}
        >
          <div className="flex items-start gap-3">
            <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-lg flex-shrink-0", color)}>
              {icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{label}</p>
                {aiRecommended === id && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                    AI Pick
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
