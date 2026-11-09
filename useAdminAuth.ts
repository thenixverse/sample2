import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AdminAuth {
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

async function checkAdmin(): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('is_admin');
  if (error) {
    console.error('admin check failed', error);
    return false;
  }
  return data === true;
}

export function useAdminAuth(): AdminAuth {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setIsAdmin(data.session ? await checkAdmin() : false);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      (async () => {
        setSession(next);
        setIsAdmin(next ? await checkAdmin() : false);
        setLoading(false);
      })();
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  return { session, isAdmin, loading, refresh };
}
