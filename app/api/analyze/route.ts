import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { analyzeRequestSchema } from '@/lib/validation/schemas';
import { generateInsight } from '@/lib/ai/insight';
import type { ApiErrorResponse } from '@/types';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Auth check — RLS would block the DB write anyway, but fail fast and clearly.
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json<ApiErrorResponse>({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiErrorResponse>(
      { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
      { status: 400 }
    );
  }

  const { journalText, moodScore } = parsed.data;

  try {
    const insight = await generateInsight(journalText, moodScore);

    const { data, error: dbError } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        mood_score: moodScore,
        content: journalText,
        ai_summary: insight.summary,
        ai_triggers: insight.triggers,
        ai_emotion_tags: insight.emotionTags,
        flagged_for_safety: insight.flaggedForSafety,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[api/analyze] DB insert failed:', dbError);
      return NextResponse.json<ApiErrorResponse>({ error: 'Failed to save entry' }, { status: 500 });
    }

    return NextResponse.json({ entry: data, insight });
  } catch (err) {
    console.error('[api/analyze] AI analysis failed:', err);
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Analysis service is temporarily unavailable' },
      { status: 502 }
    );
  }
}
