-- ============================================================
-- bchlanding — Supabase schema (replaces Firebase/Firestore)
-- Dedicated project (ref whrakxbrisgxilwdqpvk); uses the public schema.
--
-- Design: each former Firestore "document" is stored as a `doc jsonb`
-- column, preserving the exact shape the app already produces/consumes.
-- A few GENERATED columns expose the fields we filter / sort / count on
-- (immutable casts only), plus real created_at/updated_at for ordering.
-- All DB access is server-side via the service_role key; RLS is ON and
-- denies anon/authenticated by default (service_role bypasses RLS).
-- ============================================================

-- ---------- leads (test-ride bookings + Viper pre-bookings) ----------
create table if not exists public.leads (
  id             text primary key,
  doc            jsonb not null,
  category       text generated always as (doc->>'category') stored,
  payment_status text generated always as (doc#>>'{payment,status}') stored,
  source         text generated always as (doc->>'source') stored,
  lead_status    text generated always as (doc->>'status') stored,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists leads_category_idx       on public.leads (category);
create index if not exists leads_payment_status_idx on public.leads (payment_status);
create index if not exists leads_source_idx         on public.leads (source);
create index if not exists leads_created_at_idx      on public.leads (created_at desc);

-- ---------- products ----------
create table if not exists public.products (
  id           text primary key,
  doc          jsonb not null,
  category     text generated always as (doc->>'category') stored,
  deleted      boolean generated always as ((doc->>'deleted')::boolean) stored,
  stock_status text generated always as (doc#>>'{stock,status}') stored,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_deleted_idx  on public.products (deleted);

-- ---------- categories ----------
create table if not exists public.categories (
  slug       text primary key,
  doc        jsonb not null,
  sort_order int generated always as ((doc->>'order')::int) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists categories_order_idx on public.categories (sort_order asc);

-- ---------- app settings (tracking pause/live toggles) ----------
create table if not exists public.app_settings (
  key        text primary key,
  doc        jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- engagement (daily aggregate counters) ----------
create table if not exists public.engagement (
  id         text primary key,
  doc        jsonb not null,
  date       text generated always as (doc->>'date') stored,
  updated_at timestamptz not null default now()
);
create index if not exists engagement_date_idx on public.engagement (date desc);

-- ---------- visitor_events (individual event log) ----------
create table if not exists public.visitor_events (
  id         uuid primary key default gen_random_uuid(),
  doc        jsonb not null,
  action     text generated always as (doc->>'action') stored,
  created_at timestamptz not null default now()
);
create index if not exists visitor_events_created_at_idx on public.visitor_events (created_at desc);
create index if not exists visitor_events_action_idx     on public.visitor_events (action);

-- ---------- admin_users (profile rows, keyed to auth.users id) ----------
create table if not exists public.admin_users (
  id         uuid primary key,
  doc        jsonb not null,
  email      text generated always as (doc->>'email') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- lock down: RLS on (no policies => service_role only) ----------
alter table public.leads          enable row level security;
alter table public.products       enable row level security;
alter table public.categories     enable row level security;
alter table public.app_settings   enable row level security;
alter table public.engagement     enable row level security;
alter table public.visitor_events enable row level security;
alter table public.admin_users    enable row level security;
