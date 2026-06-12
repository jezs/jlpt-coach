"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Key, Clock, Target, Eye, EyeOff, AlertTriangle } from "lucide-react";

interface UserSettings {
  hasApiKey: boolean;
  anthropicApiKey: string | null;
  dailyMinutes: number;
  studyGoalDays: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [dailyMinutes, setDailyMinutes] = useState(15);
  const [goalDays, setGoalDays] = useState(365);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "testing" | "ok" | "fail">("idle");

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((u: UserSettings) => {
        setSettings(u);
        setDailyMinutes(u.dailyMinutes);
        setGoalDays(u.studyGoalDays);
      });
  }, []);

  async function saveSettings() {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { dailyMinutes, studyGoalDays: goalDays };
      if (apiKey.trim()) body.anthropicApiKey = apiKey.trim();

      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const updated = await res.json();
      setSettings(updated);
      setApiKey("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function testApiKey() {
    setTestResult("testing");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze" }),
      });
      const data = await res.json();
      setTestResult(data.error ? "fail" : "ok");
    } catch {
      setTestResult("fail");
    }
    setTimeout(() => setTestResult("idle"), 4000);
  }

  async function removeApiKey() {
    await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anthropicApiKey: null }),
    });
    setSettings((prev) => prev ? { ...prev, hasApiKey: false, anthropicApiKey: null } : prev);
  }

  if (!settings) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4" />
            Anthropic API Key (BYOK)
          </CardTitle>
          <CardDescription>
            Your API key is stored in the database and used server-side. It is never exposed to the browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            {settings.hasApiKey ? (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                API key saved {settings.anthropicApiKey}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">Not configured</Badge>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {settings.hasApiKey ? "Replace API key" : "Enter API key"}
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your key at{" "}
              <span className="font-mono text-primary">console.anthropic.com</span>
            </p>
          </div>

          <div className="flex gap-2">
            {settings.hasApiKey && (
              <>
                <Button variant="outline" size="sm" onClick={testApiKey} disabled={testResult === "testing"}>
                  {testResult === "testing" ? "Testing..." : testResult === "ok" ? "✓ Working" : testResult === "fail" ? "✗ Failed" : "Test connection"}
                </Button>
                <Button variant="destructive" size="sm" onClick={removeApiKey}>Remove key</Button>
              </>
            )}
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              AI features use <strong>claude-opus-4-8</strong> for analysis and <strong>claude-haiku-4-5</strong> for quiz generation. Typical daily usage costs less than $0.10.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Study settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Daily study time (minutes)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-mono w-12 text-right">{dailyMinutes} min</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goal: pass N1 in
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={90}
                max={730}
                step={30}
                value={goalDays}
                onChange={(e) => setGoalDays(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-mono w-24 text-right">{Math.round(goalDays / 30)} months</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveSettings} disabled={saving} className="w-full">
        {saving ? "Saving..." : saved ? "✓ Saved!" : "Save settings"}
      </Button>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">About JLPT N1 Coach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This app uses spaced repetition (SM-2 algorithm) to help you efficiently memorize N1 vocabulary, grammar, and kanji.</p>
          <p>The AI (powered by your Anthropic API key) analyzes your study patterns to detect weaknesses and strengths, recommending the best study chunk each day.</p>
          <p>Study consistently for 15 minutes daily to pass JLPT N1.</p>
        </CardContent>
      </Card>
    </div>
  );
}
