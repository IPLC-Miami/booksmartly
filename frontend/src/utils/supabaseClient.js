import { createClient } from '@supabase/supabase-js'
import { CookieStorage } from '@supabase/auth-helpers-shared'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use CookieStorage to persist across tabs
    storage: CookieStorage,
    cookieOptions: {
      sameSite: 'none',            // allow cross-site
      secure: import.meta.env.PROD, // only over HTTPS in prod
      domain: import.meta.env.PROD
        ? '.iplcmiami.com'
        : 'localhost',
    }
  }
});

export default supabase