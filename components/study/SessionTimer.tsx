"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Timer, Pause, Play, Square } from "lucide-react";

interface SessionTimerProps {
  totalSeconds: number;
  onComplete: () => void;
  onEnd: (elapsedMs: number) => void;
}

export function SessionTimer({ totalSeconds, onComplete, onEnd }: SessionTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const startRef = useRef<number>(Date.now());
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const tick = useCallback(() => {
    if (pausedAtRef.current !== null) return;
    const now = Date.now();
    const e = Math.floor((now - startRef.current - totalPausedRef.current) / 1000);
    setElapsed(e);
    if (e >= totalSeconds) {
      onComplete();
    }
  }, [totalSeconds, onComplete]);

  useEffect(() => {
    intervalRef.current = setInterval(tick, 500);
    return () => clearInterval(intervalRef.current);
  }, [tick]);

  const togglePause = () => {
    if (paused) {
      const now = Date.now();
      totalPausedRef.current += now - (pausedAtRef.current ?? now);
      pausedAtRef.current = null;
      setPaused(false);
    } else {
      pausedAtRef.current = Date.now();
      setPaused(true);
    }
  };

  const handleEnd = () => {
    clearInterval(intervalRef.current);
    onEnd(elapsed * 1000);
  };

  const remaining = Math.max(0, totalSeconds - elapsed);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const pct = Math.min(100, (elapsed / totalSeconds) * 100);

  const isWarning = remaining <= 120;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span>Session timer</span>
        </div>
        <span className={cn("font-mono text-lg font-bold tabular-nums", isWarning && remaining > 0 && "text-amber-500 animate-pulse")}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>
      <Progress value={pct} className={cn("h-2", isWarning && "bg-amber-100 [&>div]:bg-amber-500")} />
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" onClick={togglePause}>
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          {paused ? "Resume" : "Pause"}
        </Button>
        <Button size="sm" variant="destructive" onClick={handleEnd}>
          <Square className="h-3.5 w-3.5" />
          End
        </Button>
      </div>
    </div>
  );
}
