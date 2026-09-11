# BizLink Client Error Fix

The public navigation now catches Supabase initialization failures instead of crashing the entire Next.js app in the browser.

The login page also reports a clear configuration error when the public Supabase variables are unavailable.

Required Vercel Environment Variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

After changing Vercel environment variables, redeploy the project so the values are included in the new build.
