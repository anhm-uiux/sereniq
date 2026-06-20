import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { chatRequestSchema } from '@/lib/validation/schemas';
import { generateChatReply } from '@/lib/ai/chat';
import type { ApiErrorResponse } from '@/types';

const RECENT_CONTEXT_LIMIT = 5;

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json<ApiErrorResponse>({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiErrorResponse>(
      { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
      { status: 400 }
    );
  }

  const { message } = parsed.data;

  // Pull recent journal insights to give the companion personalized context.
  const { data: recentEntries } = await supabase
    .from('journal_entries')
    .select('ai_summary, ai_emotion_tags, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(RECENT_CONTEXT_LIMIT);

  const recentContext = (recentEntries ?? []).map((e) => ({
    summary: e.ai_summary ?? '',
    emotionTags: e.ai_emotion_tags ?? [],
    createdAt: e.created_at,
  }));

  try {
    const { reply, flaggedForSafety } = await generateChatReply(message, recentContext);

    // Save both sides of the exchange.
    await supabase.from('chat_messages').insert([
      { user_id: user.id, role: 'user', content: message, flagged_for_safety: flaggedForSafety },
      { user_id: user.id, role: 'assistant', content: reply, flagged_for_safety: flaggedForSafety },
    ]);

    return NextResponse.json({ reply, flaggedForSafety });
  } catch (err) {
    console.error('[api/chat] Chat generation failed:', err);
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Chat service is temporarily unavailable' },
      { status: 502 }
    );
  }
}
