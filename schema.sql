-- BizLink FINAL Supabase Schema
-- Safe/idempotent schema for the existing BizLink Vercel + Supabase project.
-- Adds protected admin authorization without changing the existing env variable names.

begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('customer','owner','admin'))
);

-- Keep existing installations compatible with the admin role editor.
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default now()
);

create unique index if not exists categories_name_unique on public.categories (lower(name));
create unique index if not exists categories_slug_unique on public.categories (slug);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  description text,
  phone text,
  address text,
  image_url text,
  status text not null default 'pending',
  is_featured boolean not null default false,
  featured_until timestamptz,
  created_at timestamptz not null default now(),
  constraint businesses_status_check check (status in ('pending','approved','rejected'))
);

create index if not exists businesses_owner_id_idx on public.businesses(owner_id);
create index if not exists businesses_category_id_idx on public.businesses(category_id);
create index if not exists businesses_status_idx on public.businesses(status);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists reviews_business_user_unique on public.reviews(business_id,user_id);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null,
  status text not null default 'pending',
  provider text,
  reference text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists subscriptions_reference_unique on public.subscriptions(reference) where reference is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id,email,full_name)
  values(new.id,new.email,nullif(new.raw_user_meta_data->>'full_name',''))
  on conflict(id) do update
  set email=excluded.email,
      full_name=coalesce(excluded.full_name,public.profiles.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Security-definer helper prevents RLS recursion when admin policies check the profile role.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.businesses enable row level security;
alter table public.reviews enable row level security;
alter table public.subscriptions enable row level security;

-- Profiles
 drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select to authenticated using (id=auth.uid());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Categories
 drop policy if exists categories_public_select on public.categories;
create policy categories_public_select on public.categories
for select to anon,authenticated using (true);

drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all on public.categories
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Businesses
 drop policy if exists businesses_public_select on public.businesses;
create policy businesses_public_select on public.businesses
for select to anon,authenticated using (status='approved' or owner_id=auth.uid() or public.is_admin());

drop policy if exists businesses_owner_insert on public.businesses;
create policy businesses_owner_insert on public.businesses
for insert to authenticated with check (owner_id=auth.uid() or public.is_admin());

drop policy if exists businesses_owner_update on public.businesses;
create policy businesses_owner_update on public.businesses
for update to authenticated using (owner_id=auth.uid() or public.is_admin()) with check (owner_id=auth.uid() or public.is_admin());

drop policy if exists businesses_admin_delete on public.businesses;
create policy businesses_admin_delete on public.businesses
for delete to authenticated using (public.is_admin());

-- Reviews
 drop policy if exists reviews_public_select on public.reviews;
create policy reviews_public_select on public.reviews
for select to anon,authenticated using (true);

drop policy if exists reviews_user_insert on public.reviews;
create policy reviews_user_insert on public.reviews
for insert to authenticated with check (user_id=auth.uid());

drop policy if exists reviews_admin_delete on public.reviews;
create policy reviews_admin_delete on public.reviews
for delete to authenticated using (public.is_admin());

-- Subscriptions
 drop policy if exists subscriptions_user_select on public.subscriptions;
create policy subscriptions_user_select on public.subscriptions
for select to authenticated using (user_id=auth.uid() or public.is_admin());

-- Starter categories
insert into public.categories(name,slug,description) values
('Restaurants','restaurants','Food and dining businesses'),
('Beauty & Wellness','beauty-wellness','Salons, barbers and wellness services'),
('Shopping','shopping','Retail and local shops'),
('Professional Services','professional-services','Professional and business services'),
('Home Services','home-services','Repairs, maintenance and home services'),
('Automotive','automotive','Vehicle sales, repairs and services')
on conflict (slug) do update set name=excluded.name, description=excluded.description;

-- Storage bucket and policies (if Storage tables are available)
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets(id,name,public)
    values('business-images','business-images',true)
    on conflict(id) do update set public=true;
  end if;
end $$;

do $$
begin
  if to_regclass('storage.objects') is not null then
    execute 'drop policy if exists business_images_public_read on storage.objects';
    execute 'create policy business_images_public_read on storage.objects for select to anon,authenticated using (bucket_id = ''business-images'')';
    execute 'drop policy if exists business_images_authenticated_upload on storage.objects';
    execute 'create policy business_images_authenticated_upload on storage.objects for insert to authenticated with check (bucket_id = ''business-images'')';
  end if;
end $$;

commit;

-- ADMIN SETUP
-- 1. Create the admin account normally in BizLink/Supabase Auth.
-- 2. Replace the email below and run it in Supabase SQL Editor:
-- update public.profiles set role='admin' where lower(email)=lower('YOUR_EMAIL_HERE');
-- 3. Sign in at /login, then open /admin.
