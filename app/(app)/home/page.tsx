'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AICompanionOrb from '@/components/AICompanionOrb';
import MoodTap from '@/components/MoodTap';
import SuggestionChips from '@/components/SuggestionChips';
import JournalExpandable from '@/components/JournalExpandable';
import InsightCard from '@/components/InsightCard';
import type { JournalInsight } from '@/lib/ai/insight';

export default function HomePage() {
  const supabase = createClient();
  const [name, setName] = useState('Student');
  const [latestInsight, setLatestInsight] = useState<JournalInsight | null>(null);
  const [selectedMood, setSelectedMood] = useState<number>(3); // neutral default
  const [expandPrompt, setExpandPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      // 1. Fetch user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();
        if (profile?.display_name) {
          setName(profile.display_name);
        } else if (user.email) {
          setName(user.email.split('@')[0]);
        }

        // 2. Fetch today's latest journal entry
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { data: entries } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', todayStart.toISOString())
          .order('created_at', { ascending: false })
          .limit(1);

        if (entries && entries.length > 0) {
          const entry = entries[0];
          setLatestInsight({
            summary: entry.ai_summary || '',
            triggers: entry.ai_triggers || [],
            emotionTags: entry.ai_emotion_tags || [],
            riskLevel: entry.flagged_for_safety ? 'elevated' : 'none',
            flaggedForSafety: entry.flagged_for_safety || false,
          });
          setSelectedMood(entry.mood_score);
        }
      }
    }

    loadData();
  }, [supabase]);

  const handleMoodInsight = (insight: JournalInsight | null, moodScore: number) => {
    setSelectedMood(moodScore);
    if (insight) {
      setLatestInsight(insight);
    }
  };

  const handleExpandJournal = (prompt: string) => {
    setExpandPrompt(prompt);
  };

  const handleJournalInsight = (insight: JournalInsight) => {
    setLatestInsight(insight);
    setExpandPrompt(null); // close expandable box on success
  };

  return (
    <div className="flex flex-col items-center space-y-10 py-6 max-w-lg mx-auto">
      {/* Greeting line */}
      <div className="text-center space-y-2">
        <h2 className="font-serif text-3xl md:text-4xl text-text-primary tracking-wide">
          Hello, {name}
        </h2>
        <p className="text-sm text-text-muted">Take a deep breath. Let's check in.</p>
      </div>

      {/* Orb Visual Anchor */}
      <div className="flex justify-center my-4 animate-gentle-pulse">
        <AICompanionOrb size="lg" />
      </div>

      {/* Mood Tap Row */}
      <MoodTap onInsight={handleMoodInsight} onLoading={setLoading} />

      {/* Suggestion Chips */}
      <SuggestionChips onExpandJournal={handleExpandJournal} />

      {/* Loading state indicator */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-text-muted py-2">
          <div className="w-2 h-2 rounded-full bg-accent-warm animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-accent-warm animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-accent-warm animate-bounce [animation-delay:0.4s]" />
          <span>Processing insight...</span>
        </div>
      )}

      {/* Journal Textbox (Conditional Expand) */}
      {expandPrompt !== null && (
        <JournalExpandable
          initialText={expandPrompt}
          moodScore={selectedMood}
          onInsight={handleJournalInsight}
          onClose={() => setExpandPrompt(null)}
        />
      )}

      {/* Latest Insight Card */}
      {latestInsight && (
        <div className="w-full space-y-3 pt-6 border-t border-white/5">
          <p className="text-xs font-semibold tracking-wider uppercase text-text-muted text-center">
            Today's Check-in Insight
          </p>
          <InsightCard insight={latestInsight} />
        </div>
      )}
    </div>
  );
}
