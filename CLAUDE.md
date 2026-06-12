@AGENTS.md

# JLPT N1 Coach

AI-powered JLPT N1 study PWA. 15 min/day, spaced repetition, BYOK Anthropic API.

## Stack
- **Next.js 16** (App Router) + TypeScript
- **PostgreSQL + Prisma 7** (with `@prisma/adapter-pg` — required for Prisma 7)
- **Tailwind CSS** with custom CSS variables
- **Anthropic Claude API** (BYOK — user stores their own key in Settings)

## Key files
- `lib/db.ts` — Prisma client (uses adapter pattern required by Prisma 7)
- `lib/srs.ts` — SM-2 spaced repetition algorithm
- `lib/ai.ts` — Claude API integration (analysis uses `claude-opus-4-8`, quiz uses `claude-haiku-4-5`)
- `data/n1-content.ts` — N1 vocabulary, grammar, kanji seed data
- `prisma/schema.prisma` — DB schema (no `url` in schema — goes in `prisma.config.ts` for Prisma 7)
- `prisma/seed.ts` — Database seeder

## Local dev setup
```bash
cp .env.example .env
# Edit .env with your DATABASE_URL
npx prisma db push
npm run db:seed
npm run dev
```

## Deploy to Render
1. Push to GitHub
2. Create a new Blueprint on Render using `render.yaml`
3. Render provisions PostgreSQL and runs the build + seed automatically

## Prisma 7 notes
- `datasource url` is NOT in schema.prisma — it's in `prisma.config.ts`
- PrismaClient must be initialized with `{ adapter: new PrismaPg({ connectionString }) }`
