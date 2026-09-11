# BizLink Schema v3

This replaces the previous schema.

Key compatibility changes:
- No custom PostgreSQL enum types.
- Roles and business statuses use text CHECK constraints.
- Auth profile trigger is safely recreated.
- Policies are explicitly dropped/recreated.
- Category seed data is idempotent.
- Storage setup is guarded.
- The schema matches the current application's `profiles`, `categories`, `businesses`, `reviews`, and `subscriptions` queries.

Run the entire `supabase/schema.sql` in Supabase SQL Editor.
