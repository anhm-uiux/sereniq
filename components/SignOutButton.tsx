'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-text-muted hover:text-accent-danger-soft transition-colors font-medium text-sm cursor-pointer bg-transparent border-none"
    >
      Sign Out
    </button>
  );
}
