import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/utils";

export async function GET() {
  const sessions = await prisma.studySession.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { startedAt: "desc" },
    take: 30,
    include: { responses: { select: { quality: true, timeMs: true } } },
  });
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { category, aiSuggested } = body;

  const session = await prisma.studySession.create({
    data: {
      userId: DEFAULT_USER_ID,
      category,
      aiSuggested: !!aiSuggested,
    },
  });

  return NextResponse.json(session);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, endedAt, durationMs, itemsStudied, correctCount, notes, responses } = body;

  const session = await prisma.studySession.update({
    where: { id },
    data: {
      endedAt: endedAt ? new Date(endedAt) : new Date(),
      durationMs,
      itemsStudied,
      correctCount,
      notes,
    },
  });

  if (responses && responses.length > 0) {
    await prisma.itemResponse.createMany({
      data: responses.map((r: { studyItemId: string; quality: number; timeMs: number }) => ({
        studyItemId: r.studyItemId,
        sessionId: id,
        quality: r.quality,
        timeMs: r.timeMs,
      })),
    });

    for (const r of responses) {
      await prisma.studyItem.update({
        where: { id: r.studyItemId },
        data: {
          totalReviews: { increment: 1 },
          correctReviews: r.quality >= 3 ? { increment: 1 } : undefined,
          correctStreak: r.quality >= 3 ? { increment: 1 } : 0,
          lastReview: new Date(),
        },
      });
    }
  }

  return NextResponse.json(session);
}
