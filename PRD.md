# SerenIQ — AI Mental Wellness Tracker for Exam Students
### PRD + Architecture — PromptWars Hackathon (Few-Hour Sprint Scope)

> **v2 update**: Visual/UX direction revised after reviewing two reference UIs (Wellmetrix-style
> data dashboard, "Hello Zayaan"-style minimal AI-greeting screen). Backend, data model, AI
> pipeline, and safety layer are UNCHANGED from v1 — this update only changes screen count,
> navigation, and how journaling/chat are presented. See Section 2.1 and Section 13.

---

## 1. Problem Statement Alignment (read this first — it's graded High Impact)

> Build a GenAI solution helping students monitor/improve mental well-being during board exams & competitive tests (NEET/JEE/CUET/CAT/GATE/UPSC). Analyze open-ended journaling + mood logs to find hidden stress triggers. Provide conversational, hyper-personalized, contextual support — coping strategies, mindfulness, motivation — safely, as an always-available companion.

**Every feature we build must map to one of these four verbs**: *Monitor → Analyze → Support → Stay Safe.* If a feature doesn't serve one of these, cut it — it costs build time and doesn't move the score that matters most.

| Problem statement ask | What we build | Scoring tie-in |
|---|---|---|
| Monitor mood/journaling | Daily journal entry + mood slider | Core UX loop |
| Analyze hidden stress triggers | LLM extracts triggers/patterns from journal text, not just keyword match | This is the "GenAI" differentiator — don't skip it for a dumb sentiment score |
| Hyper-personalized support | Chat companion that references the student's own recent entries | Differentiates from "generic chatbot" |
| Safely | Crisis-detection guardrail before any AI response reaches the user | Security (Medium) + Alignment (High) both score this |

---

## 2. Scope Decision for a Few-Hour Build

You cannot build all of this in a few hours with full polish. Here is the **cut line** — build above it first, treat below it as stretch goals only if time remains.

### MUST BUILD (Core scoring surface)
1. Auth (Supabase magic link or simple email/password)
2. Daily journal entry (free text) + mood selector (1–5 or emoji scale)
3. AI analysis pipeline: journal text → structured insight (stress triggers, emotion tags, one-line summary)
4. Companion chat: contextual, references recent mood/journal data, gives coping strategy/mindfulness suggestion
5. Crisis-keyword safety layer (basic but real — not cosmetic)
6. Dashboard: mood trend (simple line/bar chart) + recent insights list
7. Clean README + .env.example + one seed/demo account

### STRETCH (only if MUST BUILD is done and stable)
- Streak/gamification
- Voice journaling input
- Adaptive mindfulness exercise generator (breathing timer triggered by detected stress)
- Export PDF report

### EXPLICITLY OUT OF SCOPE (say no to these in a few-hour build)
- Multi-language support
- Push notifications
- Admin/parent/teacher dashboards
- Fine-tuning or RAG over large corpora
- Native mobile app

---

## 2.1 Visual/UX Direction — "Lite but Impactful" (v2)

Two reference UIs were reviewed: a data-dense Wellmetrix-style dashboard and a minimal,
AI-greeting-first "Hello Zayaan" style screen. The decision: **blend them, but bias toward
fewer screens, not fewer capabilities.** "Lite" means trimming navigation depth and visual
clutter — it does NOT mean cutting the insight pipeline, the chat depth, or the safety layer.
Those stay exactly as built; only their presentation changes.

### Final navigation: 3 destinations after login

```
┌─────────────┬──────────────────┬─────────────────────┐
│    HOME      │      CHAT         │       TRENDS          │
│ (AI greeting │ (deep companion   │ (Wellmetrix-style     │
│  + quick mood│  conversation,    │  cards: mood donut,   │
│  tap + chips)│  full history)    │  streak bar, balance  │
│              │                   │  score)                │
└─────────────┴──────────────────┴─────────────────────┘
```

**Home** absorbs what was previously a separate "Today/Journal" screen. It is the front door:
- Warm greeting ("Hello, {name}") with a soft glowing AI-companion visual (Luma-style),
  reused as the visual anchor across Home and Chat for consistency
- A **quick mood tap** (5 emoji/expression states) always visible — this alone satisfies
  "Monitor" with near-zero friction, which matters a lot for a stressed student who won't
  fill out a form on a bad day
- **Suggestion chips** ("How was today?", "Feeling anxious?", "I want to talk") that either
  expand an optional free-text box inline (feeds `generateInsight()`) or jump straight into Chat
- This is "Both" from the journaling decision: quick tap is mandatory-light, free text is
  optional-deep — same `/api/analyze` endpoint serves both, just with `journalText` empty/short
  vs. fuller depending on what the student gives

**Chat** is unchanged from v1 in function, restyled to match the glowing-companion aesthetic
(greeting state when empty, suggestion chips, personalized replies referencing recent Home
mood-taps and journal entries).

**Trends** becomes the one place data-density is appropriate — Wellmetrix-style cards:
- Mood trend as a small multi-day line/bar (reuses `mood_score` history)
- A "Wellness Balance" donut (reframe of Wellmetrix's Recovery Index — composite of recent
  mood average + journal frequency, NOT a medical score, label it accordingly)
- A streak/consistency stat (journaling frequency, not gamified competition — keep it gentle)
- Recent insight cards (summary + emotion tags) — same data `journal_entries.ai_summary`
  already returns

### Why this resolves "lite yet impactful"
Fewer taps to the core loop (mood tap is one tap from Home, no page navigation), the AI
assistant is the visual centerpiece (matches both references' instinct that the *companion*
should feel present, not buried in a settings-like form), and Trends is the only screen that
looks "busy" — which is fine, since data density there reads as credibility, not clutter.

---

## 3. User Flows (v2 — 3 screens)

```
Sign up/Login
   → HOME (front door)
       → Quick mood tap (1 tap) → optionally expand free-text → /api/analyze → insight surfaces inline
       → Suggestion chip "I want to talk" → routes to Chat with that context primed
   → CHAT (deep companion)
       → loads last N insights as context → conversational response
       → SAFETY CHECK runs on every user message + every AI response
   → TRENDS (Wellmetrix-style cards)
       → mood trend, wellness balance donut, streak, recent insight cards
```

Note: the v1 flow had a separate "Today" step before Chat; v2 merges that into Home so the
core monitor→analyze loop never requires leaving the landing screen.

---

## 4. Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App (App Router)                │
│                                                               │
│  /app                                                        │
│   ├─ (auth)/login, /signup          ─ Supabase Auth UI       │
│   ├─ (app)/home   ─ AI greeting + quick mood tap + chips     │
│   ├─ (app)/chat                     ─ companion chat UI      │
│   ├─ (app)/trends                   ─ Wellmetrix-style cards │
│   └─ api/                                                    │
│       ├─ analyze/route.ts    → AI Provider Layer → insight   │
│       ├─ chat/route.ts       → AI Provider Layer → reply     │
│       └─ safety/check.ts     → guardrail (used by both above)│
│                                                               │
└───────────────┬───────────────────────────────┬─────────────┘
                │                               │
                ▼                               ▼
     ┌────────────────────┐         ┌──────────────────────────┐
     │   Supabase          │         │   AI Provider Layer       │
     │  - Auth              │         │  lib/ai/provider.ts       │
     │  - Postgres          │         │  - callClaude()           │
     │    - profiles        │         │  - callGemini()           │
     │    - journal_entries │         │  - generateInsight()      │
     │    - chat_messages   │         │    tries primary,         │
     │  - RLS policies      │         │    falls back on failure  │
     └────────────────────┘         └──────────────────────────┘
```

**Why this shape**: API routes are the only place that touch AI provider keys (never exposed client-side). Supabase RLS means even if the API layer has a bug, a user physically cannot read another user's journal rows at the DB level — this is your strongest "Security" scoring story for the time invested.

---

## 5. Tech Stack

| Layer | Choice | Why (sprint-appropriate) |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Your existing preference; API routes + frontend in one deployable unit |
| Language | TypeScript | Type safety = fewer runtime bugs in a sprint with no time to debug |
| Styling | Tailwind CSS | Fast, no separate design system needed |
| Auth + DB | Supabase (Postgres + Auth + RLS) | Auth and DB in one setup step; RLS gives real security for free |
| AI | Claude API (Anthropic) + Gemini API (Google) | Primary/fallback pattern, per your call |
| Charts | Recharts | Lightweight, good with React, minimal setup |
| Hosting | Vercel | Zero-config Next.js deploys, generous free tier, fast iteration |
| Validation | Zod | Validate all API inputs — cheap insurance against bad data and injection |

---

## 6. Data Model (Supabase / Postgres)

```sql
-- profiles: extends Supabase auth.users
create table profiles (
  id uuid references auth.users primary key,
  display_name text,
  created_at timestamptz default now()
);

-- journal_entries: the core "monitor" data
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  mood_score int check (mood_score between 1 and 5) not null,
  content text not null,
  ai_summary text,
  ai_triggers text[],         -- e.g. ['sleep deprivation', 'comparison with peers']
  ai_emotion_tags text[],     -- e.g. ['anxious', 'overwhelmed']
  flagged_for_safety boolean default false,
  created_at timestamptz default now()
);

-- chat_messages: the "support" data
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  role text check (role in ('user','assistant')) not null,
  content text not null,
  flagged_for_safety boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security — THIS IS YOUR SECURITY SCORE
alter table journal_entries enable row level security;
alter table chat_messages enable row level security;
alter table profiles enable row level security;

create policy "users see own journal" on journal_entries
  for all using (auth.uid() = user_id);

create policy "users see own chats" on chat_messages
  for all using (auth.uid() = user_id);

create policy "users see own profile" on profiles
  for all using (auth.uid() = id);
```

---

## 7. AI Workflow — Claude + Gemini, Fallback Pattern (lightweight, sprint-safe)

**Design goal**: one clean function per AI capability. Try primary provider; on any failure (timeout, rate limit, error), fall back automatically. No retry storms, no circuit breakers — that's over-engineering for a few-hour build. Just a clean try/catch.

```
generateInsight(journalText, moodScore)
   → tries Claude with a structured-JSON prompt
   → on failure, tries Gemini with the same prompt
   → returns { summary, triggers[], emotionTags[], safetyFlag }

generateChatReply(userMessage, recentContext)
   → safety check runs FIRST on userMessage
   → if flagged: return safe scripted response, skip LLM call entirely
   → else: tries Claude, falls back to Gemini
   → safety check runs on the AI's reply too, before it's returned
```

**Why check safety before AND after the LLM call**: the input might mention self-harm (catch before wasting a call / to route to a safe path), and the model's output should never improvise around a sensitive disclosure even if the input wasn't flagged by keywords. Two checkpoints, not one.

---

## 8. Safety Layer (this is not optional — it's graded and it's the right thing to do)

This app talks to stressed students about stress. A basic, real guardrail:

1. **Keyword/phrase trigger list** (self-harm, suicide, hopelessness language) — checked on every journal entry and every chat message, both directions.
2. **On trigger**: do not let the LLM free-respond. Return a fixed, calm, supportive message + crisis resource info (e.g., a national helpline relevant to India — iCall, Vandrevala Foundation, or AASRA — verify current numbers before demo day since these can change).
3. **System prompt constraints** for both Claude and Gemini: the AI is a wellness *companion*, not a therapist; it must never diagnose, never give medical/medication advice, and must always include a gentle real-world-support nudge for serious distress signals.
4. **Log flagged events** (flagged_for_safety boolean) — for your own demo talking point: "we track and can audit safety interventions."

This single feature is your best answer if a judge asks "how do you handle a student in genuine crisis" — and they likely will, given the problem statement's own use of the word "safely."

---

## 9. Clean Code Practices & Structure

```
/app
  /(auth)/login/page.tsx
  /(auth)/signup/page.tsx
  /(app)/home/page.tsx        -- AI greeting + quick mood tap + suggestion chips
  /(app)/chat/page.tsx
  /(app)/trends/page.tsx        -- Wellmetrix-style cards
  /api/analyze/route.ts
  /api/chat/route.ts
/lib
  /ai
    provider.ts        -- callClaude(), callGemini()
    insight.ts          -- generateInsight()
    chat.ts              -- generateChatReply()
    safety.ts            -- checkSafety(text) -> {flagged, reason}
    prompts.ts            -- all system prompts, centralized
  /supabase
    client.ts             -- browser client
    server.ts             -- server client (service role, API routes only)
  /validation
    schemas.ts             -- Zod schemas for all API inputs
/components
  AICompanionOrb.tsx     -- shared glowing visual anchor (Home + Chat)
  MoodTap.tsx             -- 5-state quick mood selector
  SuggestionChips.tsx       -- "How was today?" / "Feeling anxious?" / "I want to talk"
  JournalExpandable.tsx       -- optional free-text, expands inline from a chip
  ChatWindow.tsx
  MoodTrendChart.tsx
  WellnessBalanceDonut.tsx
  StreakCard.tsx
  InsightCard.tsx
/types
  index.ts
```

**Rules to hold yourself to under time pressure** (these are the ones judges actually notice in Code Quality):
- No API keys, ever, in client components — only inside `/api` routes or server-only files.
- One prompt file (`prompts.ts`) — never inline a prompt string inside a route handler.
- Every API route validates input with Zod before touching the DB or an AI call.
- No `any` types — define request/response interfaces in `/types`.
- Components stay dumb (props in, UI out); business logic lives in `/lib`.
- Consistent error shape from every API route: `{ error: string }` with the right HTTP status, never a raw stack trace to the client.

---

## 10. Security Checklist (Medium Impact, but cheap to get right)

- [ ] `.env.local` in `.gitignore` from commit #1
- [ ] Supabase RLS enabled on every table (see SQL above) — verify with a second test account, not just by reading the policy
- [ ] AI API keys called only from server-side route handlers, never from the browser
- [ ] All user input validated with Zod before reaching DB or LLM
- [ ] Rate-limit-friendly: wrap AI calls in try/catch so one slow/failed call doesn't crash the request
- [ ] No PII (real name, school name) sent to the LLM unless the user typed it themselves into the journal — don't enrich prompts with profile data unnecessarily
- [ ] Crisis safety layer active on both journal analysis and chat (see Section 8)
- [ ] Supabase service-role key used only in server code, never the anon key for privileged writes

---

## 11. Build → Deploy Checklist (Few-Hour Sprint Timeline)

### Phase 0 — Setup (≈20–30 min)
- [ ] Create Supabase project, copy URL + anon key + service role key
- [ ] Run the SQL schema (Section 6) in Supabase SQL editor
- [ ] Get Anthropic API key (console.anthropic.com)
- [ ] Get Gemini API key (aistudio.google.com)
- [ ] `npx create-next-app@latest` with TypeScript + Tailwind + App Router
- [ ] Install deps: `@supabase/supabase-js @supabase/ssr @anthropic-ai/sdk @google/generative-ai zod recharts`
- [ ] Create `.env.local` with all keys, confirm `.gitignore` covers it
- [ ] Push empty scaffold to GitHub immediately (your first safe checkpoint)

### Phase 1 — Auth + Data Layer (≈30–40 min)
- [ ] Supabase client setup (browser + server)
- [ ] Login/signup pages wired to Supabase Auth
- [ ] Confirm a logged-in user can read/write only their own rows (RLS sanity check)
- [ ] Commit + push (checkpoint 2)

### Phase 2 — Core Loop: Home (Quick Mood Tap + Optional Journal) + AI Analysis (≈45–60 min)
- [ ] Build Home page: AI companion visual + greeting, `MoodTap` (5-state), `SuggestionChips`
- [ ] Wire `MoodTap` alone to call `/api/analyze` with a short/empty `journalText` — this must work standalone, since a one-tap mood log with no writing is a valid, low-friction "Monitor" event
- [ ] Wire `JournalExpandable` (chip-triggered free-text) to call the same `/api/analyze` with fuller text
- [ ] `/api/analyze` route: Zod validation → safety check → `generateInsight()` (Claude→Gemini fallback) → save to DB
- [ ] Render the returned insight inline on Home as a soft card (not a separate page navigation)
- [ ] Test with at least one deliberately "stressed" journal entry to confirm trigger extraction works, and one deliberately safety-flagged entry to confirm the guardrail fires
- [ ] Commit + push (checkpoint 3 — this is your demoable MVP floor)

### Phase 3 — Companion Chat (≈45–60 min)
- [ ] `/api/chat` route: safety check on input → pull last 3–5 journal insights as context → `generateChatReply()` → safety check on output → save both messages
- [ ] Chat UI: reuse `AICompanionOrb` for the empty/greeting state, message list + input once a conversation starts
- [ ] Test a normal supportive exchange and a crisis-keyword message to confirm the scripted safe-response path triggers correctly
- [ ] Commit + push (checkpoint 4)

### Phase 4 — Trends (Wellmetrix-style cards) (≈20–30 min)
- [ ] Fetch journal_entries for the user, render mood_score over time with Recharts
- [ ] Build `WellnessBalanceDonut` — composite of recent mood average + journal frequency (label clearly as a gentle wellness indicator, NOT a medical/clinical score)
- [ ] Build `StreakCard` — consistency of journaling, framed gently (not competitive/gamified)
- [ ] List recent ai_summary / ai_triggers as cards
- [ ] Commit + push (checkpoint 5)

### Phase 5 — Polish for Judging (≈20–30 min, do not skip)
- [ ] Write the README: problem alignment, architecture diagram, how to run locally, what the safety layer does — judges read this, and "Problem Statement Alignment" is High Impact
- [ ] Remove console.logs, dead code, unused imports
- [ ] Add loading states so the demo doesn't look broken during an API call
- [ ] Seed one demo account with 4–5 days of realistic journal history so Trends isn't empty on stage
- [ ] Final test pass: signup → journal → insight → chat → trends, start to finish, on a clean browser session

### Phase 6 — Deploy (≈15–20 min)
- [ ] Push final commit to GitHub
- [ ] Import repo into Vercel
- [ ] Add all env vars in Vercel project settings (never commit them)
- [ ] Deploy, then re-run the full flow on the **live URL**, not just localhost
- [ ] **Submit this exact deployed version** — remember: only your final submission per phase is scored, not your best attempt. Don't keep "improving" after a working submission unless you're certain you'll finish before the deadline.

---

## 12. Demo Script (60–90 seconds, have this ready)

1. "Students prepping for NEET/JEE face real stress most trackers don't catch." → open Home: AI companion greeting, one-tap mood log.
2. Tap a low mood state, then expand the optional journal chip and write an entry with subtle stress language (not generic "I'm sad") → show AI extracting a specific hidden trigger inline on Home.
3. Switch to Chat → ask for help → show the reply referencing what was just journaled (this is your "hyper-personalized" proof).
4. Briefly mention the safety layer exists (don't demo a real crisis message live — describe it, or show the flagged log entry instead).
5. Show Trends — mood line, wellness balance donut, streak — "monitor over time, Wellmetrix-style, but kept gentle, not clinical."
6. Close on architecture: "Claude and Gemini both wired in with automatic fallback, Supabase RLS for per-user data isolation, three screens total — the whole point was to make checking in feel as easy as opening the app, not filling out a form."

---

## 13. Design System Spec (from reference UIs)

A lightweight spec so the visual direction is buildable, not just "vibes" — extracted from
the two reference screenshots.

### Look and feel
- **Dark, warm base** — not pure black; soft charcoal/near-black backgrounds with warm
  amber/orange accent glows (echoes both references' use of warm light against dark UI)
- **Glassmorphic cards** — translucent panels, soft borders, subtle background blur over the
  warm gradient backdrop, rather than flat opaque cards
- **One consistent "AI companion" visual** — a soft glowing orb/bloom motif (re-skinned as
  something exam-stress-appropriate and non-clinical, e.g. a calm glowing light rather than a
  literal flower) reused on both Home and Chat so the assistant feels like a consistent
  character, not a generic chat icon
- **Typography** — clean sans-serif for data/UI, an elegant serif accent acceptable for the
  greeting line only (matches the "Hello Zayaan" reference's serif name treatment) — don't
  serif-ify body text, it hurts readability for longer chat replies

### Color tokens (Tailwind-friendly starting point)
```
--bg-base: #0E0D0F        /* near-black warm charcoal */
--bg-card: rgba(255,255,255,0.06)   /* glass card fill */
--border-glass: rgba(255,255,255,0.10)
--accent-warm: #F4A261      /* amber glow, mood-positive */
--accent-cool: #6B7AA1      /* soft blue-grey, mood-low/calm */
--accent-danger-soft: #C97B63  /* muted terracotta for flagged/safety states — NEVER harsh red */
--text-primary: #F5F1EC
--text-muted: #A8A29A
```
Avoid harsh, clinical red anywhere in this app — even for the safety-flagged state. A muted
warm tone keeps the tone supportive rather than alarming, which matters given who's using this.

### Component-level notes
- `MoodTap`: 5 soft circular states, color gradient from cool→warm across the scale, NOT
  red→green (red-for-bad reads as judgmental for a stressed student logging a hard day)
- `AICompanionOrb`: animate a slow, gentle pulse/glow — never a fast or jarring animation,
  given the emotional context
- `WellnessBalanceDonut`: label explicitly as "Wellness Balance" or similar, with a one-line
  caption — never present it as a diagnostic or clinical score
- Suggestion chips: rounded-full, glass-fill, short labels (2-4 words max) so they scan fast
  on a stressed student's first glance

