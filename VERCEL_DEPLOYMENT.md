# Vercel deployment checklist

1. Create one Vercel project for BizLink.
2. Import the GitHub repository or deploy the extracted project folder.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel **once**.
4. Deploy.
5. Do not run `supabase/schema.sql` again unless you are intentionally applying a database migration.
6. Future deployments reuse the same Vercel environment variables and Supabase project.

If a deployment fails, inspect the Vercel build log. Do not change the database schema just to fix a frontend build error.
