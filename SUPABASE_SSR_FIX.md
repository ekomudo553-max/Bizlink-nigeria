# Supabase SSR export fix

`@supabase/ssr` does **not** export `createClient`.

This project now uses:
- `createBrowserClient` for browser code
- `createServerClient` through `lib/supabase/server.js` for server/API code
- `createClient` from `@supabase/supabase-js` only for the service-role admin client

No application route should import `createClient` from `@supabase/ssr`.
