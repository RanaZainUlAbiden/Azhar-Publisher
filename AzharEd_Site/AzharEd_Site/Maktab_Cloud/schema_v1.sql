-- ============================================================
-- MAKTAB مکتب — database schema v1
-- Already applied to the live Supabase project (Maktab / gfefjykpytjanvikdsed)
-- on 2026-07-14 via the dashboard SQL editor. Kept here as the
-- source-of-truth migration for the developer.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references schools(id) on delete cascade,
  role text not null default 'teacher' check (role in ('admin','teacher','parent')),
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  cls text not null,
  sec text not null default 'A',
  guardian text, phone text,
  monthly_fee numeric not null default 0,
  photo text,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists parent_children (
  parent_id uuid not null references profiles(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  primary key (parent_id, student_id)
);

create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null, role text, phone text, salary numeric,
  archived boolean not null default false
);

create table if not exists attendance (
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  day date not null,
  status text not null check (status in ('P','A','L')),
  marked_at timestamptz not null default now(),
  primary key (student_id, day)
);

create table if not exists staff_attendance (
  school_id uuid not null references schools(id) on delete cascade,
  staff_id uuid not null references staff(id) on delete cascade,
  day date not null,
  status text not null check (status in ('P','A','L')),
  primary key (staff_id, day)
);

create table if not exists fees (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  month text not null,
  amount numeric not null,
  paid_on date not null default current_date
);

create table if not exists gradebook (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  cls text not null, sec text not null, term text not null,
  subjects jsonb not null default '[]'::jsonb,
  rows jsonb not null default '[]'::jsonb,      -- same shape the app uses in localStorage today
  updated_at timestamptz not null default now(),
  unique (school_id, cls, sec, term)
);

create table if not exists planner (
  school_id uuid not null references schools(id) on delete cascade,
  key text not null,                            -- e.g. 'Nursery A|1st Term|W3'
  rows jsonb not null default '{}'::jsonb,
  notes text not null default '',
  primary key (school_id, key)
);

create table if not exists diary (
  school_id uuid not null references schools(id) on delete cascade,
  key text not null,
  entries jsonb not null default '{}'::jsonb,
  primary key (school_id, key)
);

create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------- helper functions ----------
create or replace function my_school() returns uuid
language sql stable security definer set search_path = public as
$$ select school_id from profiles where id = auth.uid() $$;

create or replace function my_role() returns text
language sql stable security definer set search_path = public as
$$ select role from profiles where id = auth.uid() $$;

-- ---------- row level security ----------
-- (policies as applied; see dashboard → Authentication → Policies for the live set)
-- pattern: admin/teacher full access within their school; parents read-only on
-- their own children (students, attendance, fees) plus school-wide gradebook,
-- diary and notices reads.

-- ---------- bootstrap (applied separately) ----------
-- insert into schools (name) select 'Azhar Model School' where not exists (select 1 from schools);
-- trigger handle_new_user(): every new auth signup automatically gets a profiles row —
-- assigned to the first school; the FIRST user ever becomes 'admin', later ones 'teacher'
-- unless invited with role metadata.
