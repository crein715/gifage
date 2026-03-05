import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getSession } from '../lib/auth';
import Login from './pages/Login';
import Library from './pages/Library';
import type { Session } from '@supabase/supabase-js';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[480px] bg-white dark:bg-black">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Login onLogin={() => getSession().then(setSession)} />;
  }

  return (
    <Library
      session={session}
      onLogout={() => setSession(null)}
    />
  );
}
