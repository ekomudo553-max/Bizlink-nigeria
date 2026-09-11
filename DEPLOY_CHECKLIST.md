# BizLink Vercel Deployment Checklist

- [ ] Extract the ZIP and use the folder containing `package.json` as the Vercel project root.
- [ ] Connect/deploy to Vercel as a Next.js project.
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` in Vercel Project Settings → Environment Variables.
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Project Settings → Environment Variables.
- [ ] Run `supabase/schema.sql` once in the Supabase SQL Editor for a new database, or reconcile it with your existing schema.
- [ ] Create your first user through `/signup`.
- [ ] Promote that user to admin using the SQL at the bottom of `supabase/schema.sql`.
- [ ] Sign in at `/login` and open `/admin`.
- [ ] Do not rerun the schema for every Vercel deployment.
- [ ] Do not commit real Supabase service-role keys or Paystack secret keys.

The included schema is idempotent for its managed objects and now includes `profiles.updated_at` so admin role changes work with the dashboard.
