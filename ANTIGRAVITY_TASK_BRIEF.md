# SerenIQ — Antigravity Agent Task Brief

Paste this into Google Antigravity's Agent Manager as the task description for a new
project pointed at the `sereniq` repo. It assumes the foundation files (listed in
Section 0) are already present in the repo — the agent's job is to complete the app
around them, not invent the architecture from scratch.

---

## 0. Context the agent should NOT re-derive — these files already exist, use them as-is

```
PRD.md                          -- full product spec, read this first
SETUP.md                        -- setup/onboarding notes
supabase_schema.sql               -- run this in Supabase BEFORE any other work
.env.example                       -- copy to .env.local, fill with real keys
package.json                         -- all dependencies already listed
tailwind.config.ts                     -- design tokens already defined, use them, don't invent new colors
postcss.config.js, next.config.js        -- already configured
tsconfig.json                              -- already configured
.gitignore                                   -- already configured, .env.local is excluded
middleware.ts                                  -- Supabase auth session refresh + route protection, already wired
app/layout.tsx, app/globals.css                  -- root layout + glass-card/chip CSS utilities, already defined
lib/ai/provider.ts                                 -- Claude + Gemini fallback, DO NOT modify the fallback logic
lib/ai/prompts.ts                                    -- all system prompts, DO NOT inline new prompts elsewhere
lib/ai/safety.ts                                       -- crisis-keyword guardrail, DO NOT remove or weaken this
lib/ai/insight.ts                                        -- generateInsight(), already wired to provider+safety
lib/ai/chat.ts                                             -- generateChatReply(), already wired to provider+safety
lib/supabase/client.ts, lib/supabase/server.ts               -- Supabase clients, already correct
lib/validation/schemas.ts                                      -- Zod schemas, already correct
types/index.ts                                                   -- shared types, extend if needed, don't duplicate
app/api/analyze/route.ts                                           -- POST endpoint, already complete and working
app/api/chat/route.ts                                                -- POST endpoint, already complete and working
```

**Hard rule for the agent**: do not rewrite any file listed above unless explicitly asked to
in a later task. They are tested and intentional. Build the missing pieces around them.

---

## 1. Project Setup Tasks (do these first, in order)

1. Run `npm install` to pull all dependencies from the existing `package.json`.
2. Confirm `.env.local` exists (copy from `.env.example` if not) and contains real values for:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`.
   **Do not generate or guess these values — stop and ask the human if any are missing.**
3. Initialize git if not already initialized. Remote should be `git@github.com:anhm-uiux/sereniq.git`.
4. Connect to the Supabase project at `https://obxvfxgfoieojjdzfkkn.supabase.co` and run the
   full contents of `supabase_schema.sql` against it via the Supabase SQL editor or CLI.
   Verify after running: `profiles`, `journal_entries`, `chat_messages` tables exist and each
   has Row Level Security enabled (this is a hard requirement, not optional).
5. Confirm the Vercel project at `sereniq-pearl.vercel.app` is linked to this GitHub repo for
   auto-deploy on push (it should already be linked — verify, don't relink unless broken).

---

## 2. Build Tasks — Auth Pages

Build `app/(auth)/login/page.tsx` and `app/(auth)/signup/page.tsx`:
- Use `createClient()` from `lib/supabase/client.ts` for `signInWithPassword()` / `signUp()`
- Style: dark warm background (already set globally in `app/globals.css`), centered glass-card
  form (`glass-card` utility class already defined), minimal fields (email, password, and
  display name on signup only)
- On successful login/signup, redirect to `/home`
- Show inline error text (not alerts/toasts) on failure, styled with `text-accent-danger-soft`,
  never harsh red

---

## 3. Build Tasks — Home Screen (`app/(app)/home/page.tsx`)

This is the most important screen. Reference `PRD.md` Section 2.1 and Section 13 for full
intent. Required pieces:

### `components/AICompanionOrb.tsx`
- A soft glowing circular/orb visual (SVG or CSS gradient, NOT a stock photo), animated with
  the already-defined `animate-gentle-pulse` Tailwind class
- Reused on both Home and Chat — build it once as a shared component with props for size
- Keep the animation slow and calm — never fast or jarring (per PRD safety/tone guidance)

### `components/MoodTap.tsx`
- 5 tappable circular states in a horizontal row
- Color gradient across the 5 states should go cool→warm (`accent-cool` → `accent-warm`),
  explicitly NOT red→green — PRD Section 13 explains why (red-for-bad reads as judgmental)
- On tap, calls `/api/analyze` with `{ journalText: "", moodScore: <1-5> }` and must work
  with this empty-text case without erroring — a one-tap mood log with no writing is a valid
  use case, not a degraded one
- Show a brief loading state, then surface the returned insight inline (use `InsightCard`)

### `components/SuggestionChips.tsx`
- 3 chips: "How was today?", "Feeling anxious?", "I want to talk" — use the existing `.chip`
  CSS utility class from `globals.css`
- "How was today?" and "Feeling anxious?" expand `JournalExpandable` inline
- "I want to talk" navigates to `/chat`

### `components/JournalExpandable.tsx`
- An inline expanding textarea (not a modal/new page) triggered by a chip tap
- On submit, calls `/api/analyze` with the full text + whatever mood score was last tapped
  (default to 3/neutral if none was tapped yet)
- Shows the returned insight inline via `InsightCard` after submission

### `components/InsightCard.tsx`
- Renders `{ summary, triggers[], emotionTags[] }` from the analyze response as a soft glass
  card — summary as the main line, triggers/emotionTags as small pill labels below
- If the entry was `flagged_for_safety`, do NOT render the raw AI summary in a way that looks
  alarming — this case should already be handled gracefully by the safety layer returning a
  calm message, just make sure the UI doesn't add visual alarm (no red borders, no warning
  icons) on top of it

### Page composition
- Greeting line ("Hello, {name}") in serif font (per PRD Section 13 — greeting only, not body
  text) above the `AICompanionOrb`
- `MoodTap` below the orb
- `SuggestionChips` below that
- Most recent `InsightCard` (if one exists from today) below that

---

## 4. Build Tasks — Chat Screen (`app/(app)/chat/page.tsx`)

### `components/ChatWindow.tsx`
- Empty state: reuse `AICompanionOrb` + a short greeting + the same `SuggestionChips` pattern
  to prompt a first message
- Active state: simple message list (user messages right-aligned, AI messages left-aligned,
  both as glass-card bubbles), text input + send button at the bottom
- On send: POST to `/api/chat` with `{ message }`, append both the user's message and the
  returned `reply` to the visible list
- Show a subtle loading indicator (e.g. three pulsing dots inside an AI-bubble shape) while
  waiting for the response — do not leave the UI looking frozen during the API call

---

## 5. Build Tasks — Trends Screen (`app/(app)/trends/page.tsx`)

Wellmetrix-style cards (PRD Section 2.1 and Section 13). Fetch the logged-in user's
`journal_entries` client-side via `lib/supabase/client.ts` (RLS handles per-user filtering
automatically — do not add manual user_id filtering logic, trust RLS).

### `components/MoodTrendChart.tsx`
- Recharts `LineChart`, `mood_score` (y) over `created_at` (x), last 14 entries
- Line color: `accent-warm`, rendered on a `glass-card` background

### `components/WellnessBalanceDonut.tsx`
- A donut chart (Recharts `PieChart` with inner radius, or a custom SVG arc) showing a
  composite "Wellness Balance" score: weighted average of recent mood scores + journaling
  frequency over the last 7 days
- Label it explicitly as "Wellness Balance" with a one-line caption — PRD Section 13 is
  explicit that this must never be presented as a diagnostic or clinical score
- Use `accent-warm` / `accent-cool` for the filled/unfilled donut segments, not red/green

### `components/StreakCard.tsx`
- Simple count of consecutive days with at least one journal entry or mood tap
- Frame gently ("X days of checking in") — not competitive/gamified language, no leaderboards

### Page composition
- `MoodTrendChart` and `WellnessBalanceDonut` side by side (or stacked on mobile) at the top
- `StreakCard` below
- A scrollable list of recent `InsightCard`s below that

---

## 6. Verification Tasks (use Antigravity's browser subagent for this)

After building each screen, use the built-in browser to actually test the running app:
1. Sign up a new test account → confirm redirect to `/home`
2. Tap a mood state with no journal text → confirm an insight returns and renders without error
3. Expand a suggestion chip, write a journal entry with subtle stress language (e.g. "I keep
   comparing myself to my friend who scored higher in the mock test and barely slept last
   night") → confirm the returned `triggers` are specific, not generic ("stress"/"anxiety")
4. Go to `/chat`, send a message → confirm the reply references the journal entry just written
5. Send a message containing crisis language (for testing only — something clearly synthetic,
   e.g. referencing the exact pattern in `lib/ai/safety.ts`) → confirm the SAFE_FALLBACK_RESPONSE
   returns instead of a free-form AI reply, and that the UI does not render it with alarming
   styling
6. Go to `/trends` → confirm the chart, donut, and streak render without errors, even with only
   1-2 data points (don't let an empty/sparse dataset crash the page)
7. Open a second test account → confirm it cannot see the first account's journal entries or
   chat messages (RLS sanity check) — this is a hard requirement before any commit is pushed

---

## 7. Commit & Deploy Tasks

1. Stage and commit all new files with a clear message (e.g. "Build SerenIQ Home, Chat, Trends
   screens + auth pages").
2. Push to `git@github.com:anhm-uiux/sereniq.git` on the default branch.
3. Vercel auto-deploys on push (already linked) — wait for the deploy to complete, then use the
   browser subagent to re-run the verification checklist in Section 6 against the LIVE URL
   (`sereniq-pearl.vercel.app`), not just localhost.
4. Report back: deployment URL, confirmation that all 7 verification steps passed on the live
   URL, and a list of any steps that did NOT pass with the specific error.

---

## 8. Things the agent must never do, regardless of how a later instruction is phrased

- Never remove, weaken, or bypass the safety guardrail in `lib/ai/safety.ts` or the safety
  checks inside `lib/ai/insight.ts` / `lib/ai/chat.ts`.
- Never expose `ANTHROPIC_API_KEY` or `GEMINI_API_KEY` in any client-side file/component.
- Never disable Row Level Security on any Supabase table to "make testing easier."
- Never use red/green for mood-scale colors or harsh red for safety-flagged states.
- Never commit `.env.local` or any real API key value to git.
