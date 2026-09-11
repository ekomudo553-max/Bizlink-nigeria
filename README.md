# BizLink Protected Admin Dashboard

Copy these files into the existing BizLink Next.js project.

Required:
- @supabase/ssr
- @supabase/supabase-js
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Run the BizLink admin schema in Supabase first, then promote the desired
account to role = 'admin'.

Routes:
- /login
- /admin

The /admin route is protected by middleware and a second client-side role check.

