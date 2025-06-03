import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export function useGetCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        // Try to read the stored session first:
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // No session → user not logged in, or rehydration didn't finish yet.
          if (mounted) {
            setError(new Error('No active session'));
            setLoading(false);
          }
          return;
        }

        // We have a valid session, now fetch profile data:
        try {
          const userId = session.user.id;
          const { data: profile, error: fetchError } = await supabase
            .from('users')  // or whatever table holds your profile
            .select('*')
            .eq('id', userId)
            .single();

          if (fetchError) throw fetchError;
          if (mounted) {
            setUser(profile);
            setLoading(false);
          }
        } catch (err) {
          if (mounted) {
            setError(err);
            setLoading(false);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading, error };
}
