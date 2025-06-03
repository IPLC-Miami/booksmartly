# AuthSessionMissingError Fix Checklist

## 1. Verify VITE Environment Variables in Build
- [ ] Check if VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present in production build
- [ ] Verify variables are baked into the built JS bundle
- [ ] Test in DevTools console on production site

## 2. Ensure .env is Loaded Before Build on Server
- [ ] SSH into VPS and check .env file exists
- [ ] Verify .env contains correct VITE_ variables
- [ ] Rebuild after confirming .env is present

## 3. Verify Supabase Client Configuration
- [ ] Check supabaseClient.js has correct createClient configuration
- [ ] Ensure persistSession: true, detectSessionInUrl: false, autoRefreshToken: true
- [ ] Verify production bundle has correct client setup

## 4. Fix useGetCurrentUser Hook Implementation
- [ ] Review current useGetCurrentUser hook
- [ ] Ensure it properly handles session rehydration
- [ ] Make sure it waits for getSession() before calling getUser()
- [ ] Add proper error handling for missing sessions

## 5. Implement AuthGuard for Dashboard Routes
- [ ] Create/update ProtectedRoutes component
- [ ] Wrap Dashboard routes with session-first guard
- [ ] Ensure no components call auth functions before session is ready

## 6. Search and Fix Direct Auth Calls
- [ ] Search for direct supabase.auth.getSession() calls
- [ ] Search for direct supabase.auth.getUser() calls
- [ ] Wrap all auth calls in proper session checks

## 7. Re-Deploy and Verify
- [ ] Rebuild frontend with correct env vars
- [ ] Restart backend services
- [ ] Test in fresh incognito window
- [ ] Verify no AuthSessionMissingError in console

## 8. Clean Up
- [ ] Remove this temporary checklist file
- [ ] Remove any other temporary files created during process