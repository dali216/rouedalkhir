-- Roued Al Khair V2 — à exécuter dans Supabase SQL Editor
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'volunteer' check (role in ('volunteer','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  event_date timestamptz not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.events enable row level security;

-- Profile policies
create policy "Users can read own profile" on public.profiles
for select to authenticated using (id = auth.uid());

create policy "Admins can read all profiles" on public.profiles
for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "Users can create own profile" on public.profiles
for insert to authenticated with check (id = auth.uid() and role = 'volunteer');

-- Events policies
create policy "Authenticated users can read events" on public.events
for select to authenticated using (true);

create policy "Admins can create events" on public.events
for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "Admins can delete events" on public.events
for delete to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Après avoir créé ton premier compte, remplace EMAIL_ICI par son email :
-- update public.profiles set role='admin'
-- where id = (select id from auth.users where email='EMAIL_ICI');

-- IMPORTANT : si l'inscription email est activée, le profil sera créé après confirmation.
