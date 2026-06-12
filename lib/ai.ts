import Anthropic from "@anthropic-ai/sdk";

export function getAnthropicClient(apiKey: string) {
  return new Anthropic({ apiKey });
}

export interface StudyAnalysis {
  recommendedCategory: string;
  reasoning: string;
  weakAreas: string[];
  strongAreas: string[];
  studyTip: string;
}

export interface StudyStats {
  totalSessions: number;
  totalItems: number;
  accuracyByCategory: Record<string, number>;
  recentStreak: number;
  weakItems: Array<{ itemKey: string; category: string; accuracy: number }>;
  strongItems: Array<{ itemKey: string; category: string; accuracy: number }>;
}

export async function analyzeStudyPatterns(
  apiKey: string,
  stats: StudyStats
): Promise<StudyAnalysis> {
  const client = getAnthropicClient(apiKey);

  const prompt = `You are a JLPT N1 study coach. Analyze the following study statistics and provide recommendations.

Study Statistics:
- Total sessions: ${stats.totalSessions}
- Total items studied: ${stats.totalItems}
- Recent streak: ${stats.recentStreak} days
- Accuracy by category: ${JSON.stringify(stats.accuracyByCategory, null, 2)}
- Weak items (lowest accuracy): ${JSON.stringify(stats.weakItems.slice(0, 5), null, 2)}
- Strong items (highest accuracy): ${JSON.stringify(stats.strongItems.slice(0, 5), null, 2)}

Based on this data, provide a JSON response with:
1. recommendedCategory: which category to focus on today (VOCABULARY, GRAMMAR, KANJI, or READING)
2. reasoning: 1-2 sentence explanation for the recommendation
3. weakAreas: array of 2-3 specific weak areas to work on
4. strongAreas: array of 2-3 strong areas to maintain
5. studyTip: one actionable study tip for today

Respond ONLY with valid JSON, no other text.`;

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  try {
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    return JSON.parse(jsonMatch[0]) as StudyAnalysis;
  } catch {
    return {
      recommendedCategory: "VOCABULARY",
      reasoning: "Starting with vocabulary is recommended for N1 beginners.",
      weakAreas: ["N1 vocabulary", "Kanji readings"],
      strongAreas: ["Basic grammar"],
      studyTip: "Focus on high-frequency N1 vocabulary today.",
    };
  }
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export async function generateQuizQuestion(
  apiKey: string,
  category: string,
  item: Record<string, unknown>,
  difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<QuizQuestion> {
  const client = getAnthropicClient(apiKey);

  const prompt = `Generate a JLPT N1 ${category} multiple-choice quiz question for the following item:
${JSON.stringify(item, null, 2)}

Difficulty: ${difficulty}

Create a question with 4 options where exactly one is correct. Respond ONLY with valid JSON:
{
  "question": "the question text",
  "options": ["option A", "option B", "option C", "option D"],
  "correctIndex": 0,
  "explanation": "brief explanation of the correct answer"
}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in response");
  return JSON.parse(jsonMatch[0]) as QuizQuestion;
}

export async function explainItem(
  apiKey: string,
  category: string,
  item: Record<string, unknown>
): Promise<string> {
  const client = getAnthropicClient(apiKey);

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Explain this JLPT N1 ${category} item in detail for a Japanese learner. Include usage examples. Item: ${JSON.stringify(item)}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}
