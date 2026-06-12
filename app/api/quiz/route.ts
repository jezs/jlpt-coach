import { NextResponse } from "next/server";
import { generateStaticQuizSet, generateQuizByType } from "@/lib/quiz";
import type { QuestionType } from "@/lib/quiz";
import { prisma } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/utils";
import Anthropic from "@anthropic-ai/sdk";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as QuestionType | "mixed" | null;
  const count = Math.min(20, Math.max(3, parseInt(searchParams.get("count") ?? "10")));

  const set =
    type && type !== "mixed"
      ? generateQuizByType(type, count)
      : generateStaticQuizSet(count);

  return NextResponse.json(set);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action } = body;

  if (action === "ai-generate") {
    const user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
    if (!user?.anthropicApiKey) {
      return NextResponse.json({ error: "No API key configured" }, { status: 400 });
    }

    const { category = "VOCABULARY", questionType = "context_fill", count = 5 } = body;

    const items = await prisma.studyItem.findMany({
      where: { userId: DEFAULT_USER_ID, category },
      take: count * 3,
      orderBy: { nextReview: "asc" },
    });

    if (items.length === 0) {
      return NextResponse.json({ error: "No items available" }, { status: 404 });
    }

    const client = new Anthropic({ apiKey: user.anthropicApiKey });

    const typeInstructions: Record<string, string> = {
      kanji_reading: "問1スタイル（漢字読み）: Create a sentence with the word underlined, ask for the correct reading from 4 hiragana options",
      context_fill: "問2スタイル（文脈規定）: Blank out the word in a sentence, ask which word fits best from 4 options",
      synonym: "問3スタイル（言い換え類義）: Underline the word, ask which of 4 options is closest in meaning",
      grammar_fill: "問4スタイル（文の文法）: Blank out the grammar pattern, ask which pattern fits from 4 options",
    };

    const instruction = typeInstructions[questionType] ?? typeInstructions.context_fill;
    const sampleItems = items.slice(0, count).map((i) => i.content);

    const prompt = `You are a JLPT N1 exam creator. Generate ${count} questions in the style of real JLPT N1 exams.

Question style: ${instruction}

Source material (N1 ${category} items):
${JSON.stringify(sampleItems, null, 2)}

Requirements:
- Each question must have exactly 4 options numbered 1-4 (not A-D)
- Options should be plausible distractors at N1 level
- Use natural Japanese sentences that would appear in a real JLPT exam
- Include a brief explanation of the correct answer
- The correct option should be randomly placed (not always option 1)

Return a JSON array of questions with this exact structure:
[
  {
    "sectionLabel": "問２",
    "instruction": "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
    "stem": "彼の発言は（　　）だった。",
    "options": ["逡巡", "嚆矢", "忸怩", "顛末"],
    "correctIndex": 2,
    "explanation": "「忸怩」は恥ずかしく思うこと。文脈に合う。"
  }
]

Return ONLY the JSON array, no other text.`;

    try {
      const response = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content.find((b) => b.type === "text")?.text ?? "[]";
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No JSON array");

      const aiQuestions = JSON.parse(match[0]);
      const questions = aiQuestions.map((q: Record<string, unknown>, i: number) => ({
        ...q,
        id: `ai-${questionType}-${i}-${Date.now()}`,
        type: questionType,
        sourceItemKey: `${category.toLowerCase()}:ai-generated`,
      }));

      return NextResponse.json({ title: `AI生成問題 - ${category}`, questions });
    } catch (err) {
      const message = err instanceof Error ? err.message : "AI generation failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
