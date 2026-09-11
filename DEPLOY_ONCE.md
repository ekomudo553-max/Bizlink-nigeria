# BizLink — deploy once, reuse forever

This package is designed so you do NOT need to re-enter Supabase variables or rerun the database schema on every deployment.

## 1. Supabase: do this once

Use your existing Supabase project. The database schema in `supabase/schema.sql` is included for reference/setup, but **do not rerun it on every Vercel deployment**.

If the database is already configured, leave it alone.

For admin access, create the account in Supabase Auth and promote it once in SQL Editor:

```sql
update public.profiles
set role = 'admin'
where lower(email) = lower('YOUR_EMAIL_HERE');
```

## 2. Vercel: configure variables once

In the Vercel project, add these environment variables once:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

If you later use a server-side service-role route, add `SUPABASE_SERVICE_ROLE_KEY` as a Vercel secret. Never expose it to the browser and never commit it to GitHub.

Vercel keeps these project environment variables for future deployments. You do **not** put your real keys inside this ZIP.

## 3. Future deployments

After the first Vercel project is configured, future deployments from the same GitHub repository reuse the same environment variables and the same Supabase database.

You only need to push/upload the updated project files and deploy again.

## 4. Vercel Drop

For a drag-and-drop deployment, extract this ZIP first and deploy the folder whose root contains `package.json`.

The root must contain:

- `package.json`
- `app/`
- `components/`
- `lib/`
- `supabase/`
- `middleware.js`
- `vercel.json`

## Security

Real Supabase keys are intentionally not embedded in the ZIP. This prevents accidental publication of credentials and is also the correct way to make deployments reusable.
