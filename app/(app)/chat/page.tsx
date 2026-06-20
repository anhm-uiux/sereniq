import React from 'react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import ChatWindow from '@/components/ChatWindow';

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialMessages: any[] = [];
  if (user) {
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    
    if (msgs) {
      initialMessages = msgs;
    }
  }

  return (
    <div className="py-4 space-y-6">
      <div className="text-center md:text-left">
        <h2 className="font-serif text-2xl text-text-primary">Companion Chat</h2>
        <p className="text-xs text-text-muted">A quiet space to process stress and find calm.</p>
      </div>
      <ChatWindow initialMessages={initialMessages} />
    </div>
  );
}
