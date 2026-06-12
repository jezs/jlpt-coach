import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { N1_VOCABULARY, N1_GRAMMAR, N1_KANJI, getItemKey } from "../data/n1-content";
import { DEFAULT_USER_ID } from "../lib/utils";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter } as Prisma.PrismaClientOptions);

async function main() {
  const user = await prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: { id: DEFAULT_USER_ID },
  });
  console.log(`Seeded user: ${user.id}`);

  let count = 0;

  for (const item of N1_VOCABULARY) {
    await prisma.studyItem.upsert({
      where: { userId_itemKey: { userId: DEFAULT_USER_ID, itemKey: getItemKey("VOCABULARY", item) } },
      update: {},
      create: {
        userId: DEFAULT_USER_ID,
        category: "VOCABULARY",
        itemKey: getItemKey("VOCABULARY", item),
        content: item as unknown as Prisma.InputJsonValue,
      },
    });
    count++;
  }

  for (const item of N1_GRAMMAR) {
    await prisma.studyItem.upsert({
      where: { userId_itemKey: { userId: DEFAULT_USER_ID, itemKey: getItemKey("GRAMMAR", item) } },
      update: {},
      create: {
        userId: DEFAULT_USER_ID,
        category: "GRAMMAR",
        itemKey: getItemKey("GRAMMAR", item),
        content: item as unknown as Prisma.InputJsonValue,
      },
    });
    count++;
  }

  for (const item of N1_KANJI) {
    await prisma.studyItem.upsert({
      where: { userId_itemKey: { userId: DEFAULT_USER_ID, itemKey: getItemKey("KANJI", item) } },
      update: {},
      create: {
        userId: DEFAULT_USER_ID,
        category: "KANJI",
        itemKey: getItemKey("KANJI", item),
        content: item as unknown as Prisma.InputJsonValue,
      },
    });
    count++;
  }

  console.log(`Seeded ${count} study items`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
