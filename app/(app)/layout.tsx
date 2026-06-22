import React from 'react';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-bg-base relative pb-28">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-accent-warm/5 to-transparent blur-3xl pointer-events-none" />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-8 relative z-10">
        {children}
      </main>

      {/* Floating Glassmorphic Nav Bar at the bottom */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
        <div className="glass-card px-6 py-4 flex justify-between items-center border border-border-glass shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <Link
            href="/home"
            className="text-text-primary hover:text-accent-warm transition-colors font-semibold tracking-wide"
          >
            Home
          </Link>
          <Link
            href="/chat"
            className="text-text-primary hover:text-accent-warm transition-colors font-semibold tracking-wide"
          >
            Chat
          </Link>
          <Link
            href="/trends"
            className="text-text-primary hover:text-accent-warm transition-colors font-semibold tracking-wide"
          >
            Trends
          </Link>
          <SignOutButton />
        </div>
      </nav>
    </div>
  );
}
