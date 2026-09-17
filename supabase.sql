-- =========================================
-- ROUED AL KHAIR V2 — FIX AUTH + PROFILES
-- =========================================

create extension if not exists pgcrypto;

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'volunteer'
    check (role in ('volunteer','admin')),
  created_at timestamptz not null default now()
);

-- EVENTS
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  event_date timestamptz not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.events enable row level security;


-- =========================================
-- FUNCTION: CHECK ADMIN
-- =========================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;


-- =========================================
-- AUTOMATIC PROFILE CREATION
-- =========================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    role
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'volunteer'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();


-- =========================================
-- REMOVE OLD POLICIES
-- =========================================

drop policy if exists "Users can read own profile"
on public.profiles;

drop policy if exists "Admins can read all profiles"
on public.profiles;

drop policy if exists "Users can create own profile"
on public.profiles;

drop policy if exists "Authenticated users can read events"
on public.events;

drop policy if exists "Admins can create events"
on public.events;

drop policy if exists "Admins can delete events"
on public.events;


-- =========================================
-- PROFILE POLICIES
-- =========================================

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
);

create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (
  public.is_admin()
);


-- =========================================
-- EVENTS POLICIES
-- =========================================

create policy "Authenticated users can read events"
on public.events
for select
to authenticated
using (true);

create policy "Admins can create events"
on public.events
for insert
to authenticated
with check (
  public.is_admin()
);

create policy "Admins can delete events"
on public.events
for delete
to authenticated
using (
  public.is_admin()
);
