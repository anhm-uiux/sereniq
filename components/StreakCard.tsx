import React from 'react';

interface StreakCardProps {
  streak: number;
}

export default function StreakCard({ streak }: StreakCardProps) {
  return (
    <div className="glass-card p-6 border border-border-glass flex items-center justify-between shadow-lg w-full">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
          Consistency Streak
        </h3>
        <p className="text-xs text-text-muted">
          Your wellness check-in streak
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="text-3xl font-bold text-accent-warm">{streak}</span>
          <span className="text-text-primary text-sm font-medium ml-1.5">
            {streak === 1 ? 'day' : 'days'} of checking in
          </span>
        </div>
        
        {/* Soothing glowing circle indicator */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          <span className="absolute w-full h-full rounded-full bg-accent-warm/20 animate-ping opacity-75" />
          <span className="relative w-4 h-4 rounded-full bg-accent-warm" />
        </div>
      </div>
    </div>
  );
}
