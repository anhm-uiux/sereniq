import React, { useState, useEffect } from 'react';
import type { JournalInsight } from '@/lib/ai/insight';

interface JournalExpandableProps {
  initialText: string;
  moodScore: number;
  onInsight: (insight: JournalInsight) => void;
  onClose: () => void;
}

export default function JournalExpandable({
  initialText,
  moodScore,
  onInsight,
  onClose,
}: JournalExpandableProps) {
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please write something before submitting.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          journalText: text,
          moodScore: moodScore,
        }),
      });

      const data = await response.json();

      if (response.ok && data.insight) {
        onInsight(data.insight);
      } else {
        setError(data.error || 'Failed to analyze journal entry.');
      }
    } catch (err) {
      console.error('Error submitting journal:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full glass-card p-6 border border-border-glass mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-text-muted">
          Write it out (Mood score: {moodScore})
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors text-xs cursor-pointer bg-transparent border-none"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          required
          disabled={loading}
          placeholder="How is prep going? How is your sleep, focus, or pressure?"
          className="w-full px-4 py-3 bg-white/5 border border-border-glass rounded-xl text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent-warm/40 transition-colors resize-none"
        />

        {error && (
          <p className="text-sm text-accent-danger-soft bg-accent-danger-soft/10 px-4 py-2 rounded-lg border border-accent-danger-soft/20">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-accent-warm hover:bg-accent-warm/90 disabled:opacity-50 text-bg-base font-semibold rounded-xl transition-colors shadow-lg cursor-pointer"
          >
            {loading ? 'Analyzing...' : 'Log Journal'}
          </button>
        </div>
      </form>
    </div>
  );
}
