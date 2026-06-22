import React from 'react';
import type { JournalInsight } from '@/lib/ai/insight';

interface InsightCardProps {
  insight: JournalInsight;
}

export default function InsightCard({ insight }: InsightCardProps) {
  const { summary, triggers, emotionTags, flaggedForSafety } = insight;

  return (
    <div
      className={`w-full glass-card p-6 border transition-all ${
        flaggedForSafety
          ? 'border-accent-danger-soft/20 bg-accent-danger-soft/5'
          : 'border-border-glass'
      }`}
    >
      <div className="space-y-4">
        {/* Main empathetic summary */}
        <p className="text-text-primary text-base font-medium leading-relaxed">
          {summary}
        </p>

        {/* Triggers and Emotions section */}
        {((triggers && triggers.length > 0) || (emotionTags && emotionTags.length > 0)) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            {/* Emotion tags */}
            {emotionTags?.map((tag, idx) => (
              <span
                key={`emotion-${idx}`}
                className="px-2.5 py-1 text-xs rounded-full bg-accent-cool/10 text-accent-cool border border-accent-cool/10"
              >
                {tag}
              </span>
            ))}

            {/* Triggers */}
            {triggers?.map((trigger, idx) => (
              <span
                key={`trigger-${idx}`}
                className="px-2.5 py-1 text-xs rounded-full bg-white/5 text-text-muted border border-border-glass"
              >
                {trigger}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
