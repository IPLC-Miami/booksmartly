import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function useGetCurrentUser() {
  // TEMP: Skip auth to fix timeout - return no user immediately
  // return {
  //   user: null,
  //   loading: false,
  //   error: null
  // };
  
  // ORIGINAL CODE COMMENTED OUT TO FIX TIMEOUT
  // /*
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchUserProfile(sessionData) {
      try {
        const userId = sessionData.user.id;
        const accessToken = sessionData.access_token;
        
        // Use the backend API that handles multi-role system
        const response = await fetch(`${API_URL}/users/getUserById/${userId}`, {
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
          setSession(sessionData);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        if (mounted) {
          setError(err);
          setUser(null);
          setSession(sessionData); // Still set session even if profile fetch fails
        }
      }
    }

    async function initializeAuth() {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setError(sessionError);
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (session) {
          await fetchUserProfile(session);
        } else {
          if (mounted) {
            setUser(null);
            setSession(null);
            setError(null);
          }
        }

        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setError(err);
          setUser(null);
          setLoading(false);
        }
      }
    }

    // Initialize auth state
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session) {
          setLoading(true);
          await fetchUserProfile(session);
          if (mounted) {
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT' || !session) {
          if (mounted) {
            setUser(null);
            setSession(null);
            setError(null);
            setLoading(false);
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Optionally refresh user profile on token refresh
          await fetchUserProfile(session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return { user, session, loading, error };
  // */
}
