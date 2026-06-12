import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const dueOnly = searchParams.get("due") === "true";
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const where: Record<string, unknown> = { userId: DEFAULT_USER_ID };
  if (category && category !== "ALL") where.category = category;
  if (dueOnly) where.nextReview = { lte: new Date() };

  const items = await prisma.studyItem.findMany({
    where,
    take: limit,
    orderBy: dueOnly ? { nextReview: "asc" } : { correctReviews: "asc" },
  });

  return NextResponse.json(items);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, easeFactor, interval, repetitions, nextReview, lastReview, correctStreak, totalReviews, correctReviews } = body;

  const item = await prisma.studyItem.update({
    where: { id },
    data: { easeFactor, interval, repetitions, nextReview, lastReview, correctStreak, totalReviews, correctReviews },
  });

  return NextResponse.json(item);
}
