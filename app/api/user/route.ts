import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/utils";

export async function GET() {
  const user = await prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: { id: DEFAULT_USER_ID },
  });
  // Never expose the API key in full
  return NextResponse.json({
    ...user,
    anthropicApiKey: user.anthropicApiKey ? "••••••••" + user.anthropicApiKey.slice(-4) : null,
    hasApiKey: !!user.anthropicApiKey,
  });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { anthropicApiKey, dailyMinutes, studyGoalDays } = body;

  const data: Record<string, unknown> = {};
  if (anthropicApiKey !== undefined) data.anthropicApiKey = anthropicApiKey;
  if (dailyMinutes !== undefined) data.dailyMinutes = Number(dailyMinutes);
  if (studyGoalDays !== undefined) data.studyGoalDays = Number(studyGoalDays);

  const user = await prisma.user.update({
    where: { id: DEFAULT_USER_ID },
    data,
  });

  return NextResponse.json({
    ...user,
    anthropicApiKey: user.anthropicApiKey ? "••••••••" + user.anthropicApiKey.slice(-4) : null,
    hasApiKey: !!user.anthropicApiKey,
  });
}
