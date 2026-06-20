'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.push('/home');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background ambient glow matching references */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-warm/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md glass-card p-8 border border-border-glass relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-text-primary tracking-wide mb-2">SerenIQ</h1>
          <p className="text-sm text-text-muted">Sign in to your wellness companion</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-border-glass rounded-xl text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent-warm/40 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-border-glass rounded-xl text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent-warm/40 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-accent-danger-soft bg-accent-danger-soft/10 px-4 py-2 rounded-lg border border-accent-danger-soft/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-warm hover:bg-accent-warm/90 disabled:opacity-50 text-bg-base font-semibold rounded-xl transition-colors shadow-lg shadow-accent-warm/15 cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-text-muted">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-accent-warm hover:underline font-semibold bg-transparent border-none cursor-pointer"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
