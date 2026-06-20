import React from 'react';

interface WellnessBalanceDonutProps {
  score: number; // 0 to 100
}

export default function WellnessBalanceDonut({ score }: WellnessBalanceDonutProps) {
  const roundedScore = Math.round(score);
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card p-6 border border-border-glass h-80 flex flex-col justify-between items-center shadow-lg w-full">
      <div className="w-full text-left">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-1">
          Wellness Balance
        </h3>
        <p className="text-xs text-text-muted">7-day composite indicator</p>
      </div>

      <div className="relative flex items-center justify-center my-4">
        {/* SVG Donut */}
        <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6B7AA1" />
              <stop offset="100%" stopColor="#F4A261" />
            </linearGradient>
          </defs>
          
          {/* Unfilled track (accent-cool) */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-accent-cool/10"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Filled segment */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="url(#donutGradient)"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute text-center">
          <span className="text-3xl font-bold text-text-primary">{roundedScore}%</span>
          <span className="block text-[9px] text-text-muted uppercase tracking-wider mt-0.5">
            Balance
          </span>
        </div>
      </div>

      <p className="text-[10px] text-text-muted text-center leading-normal max-w-[220px]">
        This indicator is a gentle check-in guide and is not a clinical or diagnostic tool.
      </p>
    </div>
  );
}
