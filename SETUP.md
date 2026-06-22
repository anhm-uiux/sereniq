# SerenIQ — Setup from Scratch

This is the **starter scaffold** for the lib/, types/, and api/ layers — the parts
that take real time to get right. UI pages (`/app/(auth)`, `/app/(app)/*`) are
intentionally left for you to build, since judges score Code Quality on code you
write, and the layout/component work goes faster once this foundation exists.

## 0. Quick Start

```bash
# 1. Scaffold a fresh Next.js app (if you haven't already)
npx create-next-app@latest mindmitra --typescript --tailwind --app --no-src-dir

# 2. Copy these files into your project, preserving paths:
#    lib/, types/, app/api/, supabase_schema.sql, .env.example, package.json (merge deps)

# 3. Install dependencies
npm install @anthropic-ai/sdk @google/generative-ai @supabase/ssr @supabase/supabase-js recharts zod

# 4. Set up environment variables
cp .env.example .env.local
# fill in real values — see Section 1 below

# 5. Run the dev server
npm run dev
```

## 1. Getting Your API Keys (do this first — ~10 minutes)

### Supabase (Auth + Database)
1. Go to https://supabase.com → New Project (free tier is enough)
2. Once created: Project Settings → API → copy `Project URL` and `anon public` key into `.env.local`
3. Go to SQL Editor → paste the entire contents of `supabase_schema.sql` → Run
4. Verify under Table Editor that `profiles`, `journal_entries`, `chat_messages` exist and each shows a lock icon (RLS enabled)

### Anthropic (Claude)
1. Go to https://console.anthropic.com → API Keys → Create Key
2. Copy into `.env.local` as `ANTHROPIC_API_KEY`

### Google AI Studio (Gemini)
1. Go to https://aistudio.google.com/app/apikey → Create API key
2. Copy into `.env.local` as `GEMINI_API_KEY`

## 2. What's Already Built For You

- `lib/ai/provider.ts` — Claude + Gemini calls, with automatic fallback
- `lib/ai/prompts.ts` — every system prompt, centralized (edit tone/behavior here)
- `lib/ai/safety.ts` — crisis-keyword guardrail, runs before AND after every AI call
- `lib/ai/insight.ts` — journal → structured insight (summary, triggers, emotions, risk)
- `lib/ai/chat.ts` — companion chat with personalized context + safety checks
- `lib/supabase/client.ts` + `server.ts` — browser and server Supabase clients
- `lib/validation/schemas.ts` — Zod schemas for both API routes
- `app/api/analyze/route.ts` — POST endpoint: journal text → insight → saved row
- `app/api/chat/route.ts` — POST endpoint: message → personalized reply → saved exchange
- `types/index.ts` — shared TypeScript interfaces
- `supabase_schema.sql` — full schema + RLS policies, ready to run as-is

## 3. What You Still Need to Build

These are genuinely the "fun part" and where your UI/UX choices show up in judging:

1. **`app/(auth)/login/page.tsx`** and **`signup/page.tsx`** — use `supabase.auth.signInWithPassword()` /
   `signUp()` from `lib/supabase/client.ts`. Supabase's own quickstart docs have a minimal example you
   can adapt fast.
2. **`app/(app)/today/page.tsx`** — mood slider + journal textarea → POST to `/api/analyze` → render
   the returned `insight` in an `InsightCard` component.
3. **`app/(app)/chat/page.tsx`** — message list + input → POST to `/api/chat` on send → append both
   the user message and the returned `reply` to the list.
4. **`app/(app)/trends/page.tsx`** — fetch the user's `journal_entries` (client-side via
   `lib/supabase/client.ts`, RLS handles the filtering) → render with Recharts `LineChart`
   (`mood_score` over `created_at`).
5. **`middleware.ts`** at the project root — standard Supabase SSR auth middleware to refresh sessions
   and protect `(app)` routes. Supabase's Next.js SSR docs have the exact snippet — copy it in, it's
   boilerplate you don't need to write from scratch.

## 4. Test Before You Build the UI

You can sanity-check the whole AI pipeline with `curl` before any frontend exists,
once you have a logged-in session cookie (or temporarily stub the auth check):

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"journalText": "I keep comparing myself to my friend who scored higher in the mock test. I barely slept last night.", "moodScore": 2}'
```

You should get back a JSON `insight` with a specific trigger like "comparison with a higher-scoring
peer" — if it's generic ("stress", "anxiety"), the prompt is working but you can tune
`lib/ai/prompts.ts` for more specificity.

## 5. Before You Submit

Re-read Section 9 (checklist) in `PRD.md` — particularly: remove console.logs, verify RLS with a
second test account, seed a demo account with a few days of history, and test the full flow on the
**deployed Vercel URL**, not just localhost, before final submission.
