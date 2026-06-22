'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import MoodTrendChart from '@/components/MoodTrendChart';
import WellnessBalanceDonut from '@/components/WellnessBalanceDonut';
import StreakCard from '@/components/StreakCard';
import InsightCard from '@/components/InsightCard';
import type { JournalEntry } from '@/types';
import type { JournalInsight } from '@/lib/ai/insight';

export default function TrendsPage() {
  const supabase = createClient();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Computed states
  const [streak, setStreak] = useState(0);
  const [balanceScore, setBalanceScore] = useState(50); // Default to neutral 50%

  useEffect(() => {
    async function fetchEntries() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching journal entries:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setEntries(data);
        
        // 1. Calculate Streak
        const checkInDates = Array.from(
          new Set(data.map(e => new Date(e.created_at).toISOString().split('T')[0]))
        ).sort((a, b) => b.localeCompare(a)); // descending (most recent first)

        let calculatedStreak = 0;
        if (checkInDates.length > 0) {
          const todayStr = new Date().toISOString().split('T')[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (checkInDates[0] === todayStr || checkInDates[0] === yesterdayStr) {
            let expectedDate = new Date(checkInDates[0]);
            while (true) {
              const expectedStr = expectedDate.toISOString().split('T')[0];
              if (checkInDates.includes(expectedStr)) {
                calculatedStreak++;
                expectedDate.setDate(expectedDate.getDate() - 1);
              } else {
                break;
              }
            }
          }
        }
        setStreak(calculatedStreak);

        // 2. Calculate Wellness Balance
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentEntries = data.filter(e => new Date(e.created_at) >= sevenDaysAgo);
        
        // Unique days checked in during last 7 days
        const recentDates = new Set(recentEntries.map(e => new Date(e.created_at).toISOString().split('T')[0]));
        const frequencyPercentage = (recentDates.size / 7) * 100;

        // Avg mood in last 7 days (convert 1-5 scale to 0-100%)
        let avgMoodPercentage = 50; // default to neutral
        if (recentEntries.length > 0) {
          const sumMood = recentEntries.reduce((sum, e) => sum + e.mood_score, 0);
          const avgMood = sumMood / recentEntries.length;
          avgMoodPercentage = ((avgMood - 1) / 4) * 100;
        }

        // Weighted balance score
        const compositeScore = (0.6 * avgMoodPercentage) + (0.4 * frequencyPercentage);
        setBalanceScore(compositeScore);
      }
      setLoading(false);
    }

    fetchEntries();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-accent-warm border-t-transparent animate-spin" />
        <p className="text-sm text-text-muted">Loading trends...</p>
      </div>
    );
  }

  // Filter entries to show in history (only those with summaries or actual entries)
  const historyEntries = entries.filter(e => e.ai_summary);

  return (
    <div className="space-y-8 py-4">
      {/* Title block */}
      <div className="text-center md:text-left">
        <h2 className="font-serif text-2xl text-text-primary">Wellness Trends</h2>
        <p className="text-xs text-text-muted">Wellmetrix-style tracking of your energy and consistency.</p>
      </div>

      {entries.length === 0 ? (
        <div className="glass-card p-12 text-center border border-border-glass max-w-lg mx-auto space-y-4 shadow-xl">
          <h3 className="font-serif text-xl text-text-primary">Your dashboard is empty</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto">
            Log your mood or write your first journal entry on the Home page to start tracking your trends.
          </p>
        </div>
      ) : (
        <>
          {/* Main cards: charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MoodTrendChart data={entries} />
            <WellnessBalanceDonut score={balanceScore} />
          </div>

          {/* Streak Card */}
          <StreakCard streak={streak} />

          {/* Scrollable list of recent insights */}
          {historyEntries.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                Recent Insights & Triggers
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {historyEntries.map((entry) => {
                  const date = new Date(entry.created_at).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  });
                  const insight: JournalInsight = {
                    summary: entry.ai_summary || '',
                    triggers: entry.ai_triggers || [],
                    emotionTags: entry.ai_emotion_tags || [],
                    riskLevel: entry.flagged_for_safety ? 'elevated' : 'none',
                    flaggedForSafety: entry.flagged_for_safety,
                  };
                  return (
                    <div key={entry.id} className="space-y-1.5 animate-fade-in">
                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold ml-1">
                        {date} (Mood: {entry.mood_score})
                      </p>
                      <InsightCard insight={insight} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
