import React, { useState } from 'react';
import type { JournalInsight } from '@/lib/ai/insight';

interface MoodTapProps {
  onInsight: (insight: JournalInsight | null, moodScore: number) => void;
  onLoading: (isLoading: boolean) => void;
}

export default function MoodTap({ onInsight, onLoading }: MoodTapProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  // Cool -> Warm gradient colors (mood-positive to mood-low)
  // Mood 1 (coolest, low energy/calm) -> Mood 5 (warmest, high energy/positive)
  const moods = [
    { score: 1, label: 'Very Low', activeClass: 'bg-accent-cool text-bg-base border-accent-cool shadow-lg shadow-accent-cool/20' },
    { score: 2, label: 'Low', activeClass: 'bg-accent-cool/60 text-text-primary border-accent-cool/40 shadow-lg shadow-accent-cool/10' },
    { score: 3, label: 'Neutral', activeClass: 'bg-text-muted/40 text-text-primary border-text-muted/40' },
    { score: 4, label: 'Good', activeClass: 'bg-accent-warm/60 text-bg-base border-accent-warm/40 shadow-lg shadow-accent-warm/10' },
    { score: 5, label: 'Very Good', activeClass: 'bg-accent-warm text-bg-base border-accent-warm shadow-lg shadow-accent-warm/20' },
  ];

  const handleMoodTap = async (score: number) => {
    setSelectedMood(score);
    onLoading(true);
    setLocalLoading(true);
    onInsight(null, score); // Reset current insight on parent

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          journalText: ' ', // single space to pass min(1) validation in Zod schema
          moodScore: score,
        }),
      });

      const data = await response.json();
      if (response.ok && data.insight) {
        onInsight(data.insight, score);
      } else {
        console.error('Mood log failed:', data.error);
      }
    } catch (err) {
      console.error('Error logging mood:', err);
    } finally {
      onLoading(false);
      setLocalLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-sm font-semibold tracking-wider uppercase text-text-muted">
        How is your energy right now?
      </p>
      
      <div className="flex gap-4">
        {moods.map((mood) => {
          const isSelected = selectedMood === mood.score;
          return (
            <button
              key={mood.score}
              disabled={localLoading}
              onClick={() => handleMoodTap(mood.score)}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all relative group cursor-pointer ${
                isSelected
                  ? `${mood.activeClass} ring-2 ring-white/10 scale-110`
                  : 'bg-white/5 border border-border-glass text-text-muted hover:border-white/20 hover:scale-105 hover:text-text-primary'
              }`}
              title={mood.label}
            >
              <span className="text-lg">{mood.score}</span>
              
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-text-muted whitespace-nowrap pointer-events-none">
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
