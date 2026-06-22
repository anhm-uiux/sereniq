'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MoodTrendChartProps {
  data: {
    created_at: string;
    mood_score: number;
  }[];
}

export default function MoodTrendChart({ data }: MoodTrendChartProps) {
  // Format data: slice last 14 entries and ensure chronological sorting
  const chartData = [...data]
    .slice(-14)
    .map((entry) => {
      const date = new Date(entry.created_at);
      return {
        dateStr: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        mood: entry.mood_score,
      };
    });

  return (
    <div className="glass-card p-6 border border-border-glass h-80 flex flex-col justify-between shadow-lg">
      <div>
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-1">
          Mood Trend
        </h3>
        <p className="text-xs text-text-muted">Last 14 energy check-ins</p>
      </div>

      <div className="flex-1 w-full mt-4 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="dateStr"
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickLine={false}
            />
            <YAxis
              domain={[1, 5]}
              tickCount={5}
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(14, 13, 15, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#F5F1EC',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#A8A29A' }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="#F4A261"
              strokeWidth={2}
              activeDot={{ r: 5 }}
              dot={{ r: 3, fill: '#0E0D0F', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
