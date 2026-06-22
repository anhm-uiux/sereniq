import React from 'react';
import { useRouter } from 'next/navigation';

interface SuggestionChipsProps {
  onExpandJournal: (prompt: string) => void;
}

export default function SuggestionChips({ onExpandJournal }: SuggestionChipsProps) {
  const router = useRouter();

  const chips = [
    { label: 'How was today?', action: () => onExpandJournal('Today was ') },
    { label: 'Feeling anxious?', action: () => onExpandJournal('I feel anxious because ') },
    { label: 'I want to talk', action: () => router.push('/chat') },
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center w-full">
      {chips.map((chip, index) => (
        <button
          key={index}
          onClick={chip.action}
          className="chip border-none select-none text-text-primary hover:text-white"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
