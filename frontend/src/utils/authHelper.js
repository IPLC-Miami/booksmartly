import { supabase } from './supabaseClient';

/**
 * Get the current session and access token
 * @returns {Promise<{session: object|null, accessToken: string|null}>}
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return { session: null, accessToken: null };
    }
    
    return {
      session,
      accessToken: session?.access_token || null
    };
  } catch (error) {
    console.error('Error in getCurrentSession:', error);
    return { session: null, accessToken: null };
  }
}

/**
 * Get authentication headers for API calls
 * @returns {Promise<object>} Headers object with Authorization if token exists
 */
export async function getAuthHeaders() {
  const { accessToken } = await getCurrentSession();
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
}

/**
 * Make an authenticated fetch request
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export async function authenticatedFetch(url, options = {}) {
  const authHeaders = await getAuthHeaders();
  
  return fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
    credentials: 'include', // Include cookies for additional auth support
  });
}

/**
 * Get the current user ID from session
 * @returns {Promise<string|null>} User ID or null
 */
export async function getCurrentUserId() {
  const { session } = await getCurrentSession();
  return session?.user?.id || null;
}