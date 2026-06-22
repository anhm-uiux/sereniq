# SerenIQ

AI-powered wellness companion for students navigating board exam and competitive test stress
(NEET, JEE, CUET, CAT, GATE, UPSC). Built for PromptWars.

See `PRD.md` for the full product spec, `SETUP.md` for setup steps, and
`ANTIGRAVITY_TASK_BRIEF.md` for the agent task brief used to build the remaining UI.

## Folder Structure — what's done vs what's pending

```
sereniq/
├── PRD.md                          ✅ complete — read first
├── SETUP.md                        ✅ complete — setup walkthrough
├── ANTIGRAVITY_TASK_BRIEF.md       ✅ complete — paste into Antigravity's agent
├── supabase_schema.sql             ✅ complete — run in Supabase SQL editor FIRST
├── .env.example                    ✅ complete — copy to .env.local, fill with real keys
├── .gitignore                      ✅ complete
├── package.json                    ✅ complete — all dependencies listed
├── next.config.js                  ✅ complete
├── postcss.config.js               ✅ complete
├── tailwind.config.ts              ✅ complete — design tokens (colors, fonts) defined here
├── tsconfig.json                   ✅ complete
├── middleware.ts                   ✅ complete — Supabase auth session + route protection
│
├── app/
│   ├── layout.tsx                  ✅ complete — root layout
│   ├── globals.css                 ✅ complete — glass-card / chip CSS utilities
│   ├── (auth)/
│   │   ├── login/                  ⏳ EMPTY — needs page.tsx (Antigravity Task Brief Section 2)
│   │   └── signup/                 ⏳ EMPTY — needs page.tsx (Antigravity Task Brief Section 2)
│   ├── (app)/
│   │   ├── home/                   ⏳ EMPTY — needs page.tsx (Antigravity Task Brief Section 3)
│   │   ├── chat/                   ⏳ EMPTY — needs page.tsx (Antigravity Task Brief Section 4)
│   │   └── trends/                 ⏳ EMPTY — needs page.tsx (Antigravity Task Brief Section 5)
│   └── api/
│       ├── analyze/route.ts        ✅ complete — journal → AI insight → saved to DB
│       └── chat/route.ts           ✅ complete — message → personalized AI reply → saved to DB
│
├── components/                     ⏳ EMPTY — AICompanionOrb, MoodTap, SuggestionChips,
│                                       JournalExpandable, InsightCard, ChatWindow,
│                                       MoodTrendChart, WellnessBalanceDonut, StreakCard
│                                       (all specified in ANTIGRAVITY_TASK_BRIEF.md)
│
├── lib/
│   ├── ai/
│   │   ├── provider.ts             ✅ complete — Claude + Gemini fallback
│   │   ├── prompts.ts              ✅ complete — all system prompts, centralized
│   │   ├── safety.ts               ✅ complete — crisis-keyword guardrail
│   │   ├── insight.ts              ✅ complete — generateInsight()
│   │   └── chat.ts                 ✅ complete — generateChatReply()
│   ├── supabase/
│   │   ├── client.ts               ✅ complete — browser client
│   │   └── server.ts               ✅ complete — server client (API routes only)
│   └── validation/
│       └── schemas.ts              ✅ complete — Zod schemas for both API routes
│
├── types/
│   └── index.ts                    ✅ complete — shared TypeScript interfaces
│
└── public/                         ⏳ EMPTY — add any static assets here if needed
```

✅ = built and tested, don't modify without good reason
⏳ = intentionally empty, this is what's left to build

## Quick Start

```bash
git clone git@github.com:anhm-uiux/sereniq.git
cd sereniq
npm install
cp .env.example .env.local   # then fill in real values — see SETUP.md
npm run dev
```

Before running anything: open the Supabase SQL editor at your project
(`https://obxvfxgfoieojjdzfkkn.supabase.co`) and run the full contents of
`supabase_schema.sql`. Nothing else works until that's done.
