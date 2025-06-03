import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const API_URL = import.meta.env.VITE_API_BASE_URL;

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

        // We have a valid session, now fetch profile data using backend API:
        try {
          const userId = session.user.id;
          const accessToken = session.access_token;
          
          // Use the backend API that handles multi-role system
          const response = await fetch(`${API_URL}/users/userById/${userId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
          }

          const profile = await response.json();
          
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
