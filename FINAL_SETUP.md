# BizLink Final Build — Vercel + Supabase

This package combines the previous BizLink application with the protected admin dashboard.

## What is preserved
- Existing Next.js/Vercel project structure
- Existing Supabase variable names
- Existing customer/owner pages and API routes
- Existing BizLink schema structure
- Paystack variable placeholders

## Environment variables
Keep your existing values. The names are unchanged:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `PAYSTACK_SECRET_KEY` (optional)
- `NEXT_PUBLIC_APP_URL`

Copy `.env.example` to `.env.local` and enter your existing values. Never put service-role or Paystack secret keys in `NEXT_PUBLIC_*` variables.

## Supabase
Use `supabase/schema.sql`. It is designed to be rerunnable and includes the protected admin authorization helper and policies.

If your existing database is already populated, take a backup first. The schema uses `create table if not exists` and drops/recreates only the named BizLink policies so it can add the admin layer without intentionally deleting your business/user/review data.

## Create your admin
1. Create the admin user through the normal Supabase Auth/BizLink signup flow.
2. In Supabase SQL Editor run:

```sql
update public.profiles
set role='admin'
where lower(email)=lower('YOUR_EMAIL_HERE');
```

3. Log in at `/login`.
4. Open `/admin`.

## Run locally
```bash
npm install
npm run build
npm run dev
```

## Deploy
Push this folder to your Git repository and import it into Vercel. Add the same environment variables in Vercel Project Settings.
