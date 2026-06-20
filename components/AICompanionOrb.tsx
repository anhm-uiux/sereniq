import React from 'react';

interface AICompanionOrbProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function AICompanionOrb({ size = 'md' }: AICompanionOrbProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 blur-xl',
    md: 'w-32 h-32 blur-2xl',
    lg: 'w-48 h-48 blur-3xl',
  };

  const containerSizes = {
    sm: 'w-20 h-20',
    md: 'w-40 h-40',
    lg: 'w-60 h-60',
  };

  return (
    <div className={`relative flex items-center justify-center ${containerSizes[size]}`}>
      {/* Outer glowing aura */}
      <div
        className={`absolute rounded-full bg-gradient-to-tr from-accent-warm/40 via-accent-warm/20 to-transparent animate-gentle-pulse ${sizeClasses[size]}`}
      />
      {/* Inner core */}
      <div
        className={`absolute rounded-full bg-gradient-to-br from-white/20 via-accent-warm/30 to-accent-cool/10 border border-white/10 backdrop-blur-sm ${
          size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-16 h-16' : 'w-28 h-28'
        } shadow-[0_0_30px_rgba(244,162,97,0.3)]`}
      />
      {/* Subtle core accent */}
      <div
        className={`absolute rounded-full bg-white/40 blur-xs ${
          size === 'sm' ? 'w-2 h-2 top-6' : size === 'md' ? 'w-4 h-4 top-12' : 'w-6 h-6 top-20'
        }`}
      />
    </div>
  );
}
