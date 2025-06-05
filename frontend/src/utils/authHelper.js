import { supabase } from "../config/supabaseClient";

/**
 * AUTHENTICATION DISABLED - ALL FUNCTIONS RETURN NULL/EMPTY VALUES
 * This file has been modified to disable authentication while maintaining API compatibility
 */

/**
 * Get current session - DISABLED
 * @returns {Promise<null>} Always returns null (no session)
 */
export const getCurrentSession = async () => {
  // Authentication disabled - return null session
  return null;
};

/**
 * Get authentication headers - DISABLED
 * @returns {Object} Empty headers object
 */
export const getAuthHeaders = () => {
  // Authentication disabled - return empty headers
  return {};
};

/**
 * Make authenticated fetch request - DISABLED AUTH
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response without auth headers
 */
export const authenticatedFetch = async (url, options = {}) => {
  // Authentication disabled - make regular fetch without auth headers
  const fetchOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      // No auth headers added
    },
  };

  return fetch(url, fetchOptions);
};

/**
 * Get current user ID - DISABLED
 * @returns {Promise<null>} Always returns null (no user)
 */
export const getCurrentUserId = async () => {
  // Authentication disabled - return null user ID
  return null;
};

// Export original supabase client for other non-auth uses if needed
export { supabase };