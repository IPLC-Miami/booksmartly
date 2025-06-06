import { createClient } from "@supabase/supabase-js";
// require("dotenv").config();

// const SUPABASE_URL = "https://vakmfwtcbdeaigysjgch.supabase.co";
// const SUPABASE_ANON_KEY =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZha21md3RjYmRlYWlneXNqZ2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3MTU5MDQsImV4cCI6MjA1MzI5MTkwNH0.K0l8-rDbSauwnTrjZj3n82W3-vKwUcxx5dYyIFMGLpc";

// Get environment variables with fallback for GitHub Pages
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

// Create mock supabase client for GitHub Pages deployment
const createMockClient = () => {
  console.warn("Using mock Supabase client for GitHub Pages deployment.");
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Auth disabled in demo" } }),
      signUp: () => Promise.resolve({ data: null, error: { message: "Auth disabled in demo" } }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: { message: "Database disabled in demo" } }),
      update: () => Promise.resolve({ data: null, error: { message: "Database disabled in demo" } }),
      delete: () => Promise.resolve({ data: null, error: { message: "Database disabled in demo" } }),
    }),
  };
};

// Create supabase client with error handling
let supabase;

try {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === '' || SUPABASE_ANON_KEY === '') {
    supabase = createMockClient();
  } else {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: window.localStorage,
        storageKey: 'sb-auth-token',
        debug: process.env.NODE_ENV === 'development'
      },
      global: {
        headers: {
          'X-Client-Info': 'booksmartly-frontend'
        },
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(30000) // 30 second timeout
          });
        }
      }
    });
  }
} catch (error) {
  console.error("Error creating Supabase client:", error);
  supabase = createMockClient();
}

export { supabase };
