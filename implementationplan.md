# Implementation Plan: New Manyatta Kenya (Supabase Auth + Booking Only)

## 1. Overview
New Manyatta Kenya offers Mountain Villas, Safari Experiences, and Urban Apartments. All pages are public. Privileged actions (e.g., booking) require authentication. This plan removes all payments and focuses on booking creation/management only.

## 2. Architecture

### Frontend (Vite + React + React Router)
- Auth UI: email/password and optional OAuth via Supabase Auth.
- Session state via src/auth/AuthContext.tsx.
- Pages are public; privileged actions redirect to /auth when not logged in.

### Backend (Supabase)
- Postgres (managed by Supabase).
- Supabase Auth for user accounts.
- Optional Storage for media later.

Required client env:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## 3. Database Schema (SQL)
Run the following in the Supabase SQL editor. This version contains no payment-related fields.

```sql
-- 1) Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone_number text,
  nationality text,
  preferences jsonb,
  created_at timestamptz default now()
);

-- 2) Properties (inventory)
create type if not exists public.property_category as enum ('mountain_villa', 'urban_apartment');
create type if not exists public.listing_status as enum ('active', 'maintenance', 'hidden');

create table if not exists public.properties (
  id uuid default gen_random_uuid() primary key,
  category property_category not null,
  name text not null,
  slug text unique not null,
  description text,
  location_data jsonb,
  base_price numeric(10,2) not null,
  long_term_price numeric(10,2),
  currency text default 'KES',
  max_guests int not null,
  amenities text[],
  images text[],
  status listing_status default 'active',
  created_at timestamptz default now()
);

-- 3) Safari packages
create table if not exists public.safari_packages (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  duration_nights int not null,
  description text,
  base_price_usd numeric(10,2) not null,
  min_guests int default 2,
  itinerary_details jsonb,
  included_services text[],
  excluded_services text[],
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 4) Bookings (no payments)
create type if not exists public.booking_status as enum ('requested', 'confirmed', 'cancelled', 'completed');

create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  safari_package_id uuid references public.safari_packages(id) on delete set null,
  start_date date not null,
  end_date date not null,
  guest_adults int default 1,
  guest_children int default 0,
  total_amount numeric(10,2) not null,
  currency text not null,
  status booking_status default 'requested',
  special_requests text,
  created_at timestamptz default now()
);

-- Index to speed up overlap checks
create index if not exists bookings_property_period_idx on public.bookings(property_id, start_date, end_date);
```

Notes:
- status lifecycle is booking-only: requested -> confirmed -> completed (or cancelled). No payment states.

## 4. RLS (Row Level Security)
Enable RLS and policies to keep public browsing open but protect user data.

```sql
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.safari_packages enable row level security;
alter table public.bookings enable row level security;

-- Public readable catalog
create policy if not exists "public read properties" on public.properties for select using (true);
create policy if not exists "public read safaris" on public.safari_packages for select using (true);

-- Profiles: owner read/write
create policy if not exists "own profile read" on public.profiles for select using (auth.uid() = id);
create policy if not exists "own profile write" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Public availability view (no PII)
create or replace view public.bookings_public as
  select id, property_id, safari_package_id, start_date, end_date, status
  from public.bookings
  where status in ('requested','confirmed');

grant usage on schema public to anon, authenticated;
grant select on public.bookings_public to anon, authenticated;

-- Owner access to full bookings
create policy if not exists "read own bookings" on public.bookings for select using (auth.uid() = user_id);
create policy if not exists "insert own bookings" on public.bookings for insert with check (auth.uid() = user_id);
create policy if not exists "update own active bookings" on public.bookings for update
  using (auth.uid() = user_id and status in ('requested'))
  with check (auth.uid() = user_id);
```

## 5. Triggers & Logic Functions

```sql
-- Create a profile row for every new auth user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles(id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- True if dates overlap for a property (used in availability checks)
create or replace function public.property_has_conflict(p_property uuid, p_start date, p_end date)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.bookings b
    where b.property_id = p_property
      and b.status in ('requested','confirmed')
      and daterange(b.start_date, b.end_date, '[]') && daterange(p_start, p_end, '[]')
  );
$$;
```

## 6. Edge Functions (no payments)
Implement the following Supabase Edge Functions.

1) availability-check
- Input: { property_id, start_date, end_date }
- Logic: return { available: !property_has_conflict(...) }
- Auth: public

2) booking-create
- Input: { product_type: 'property'|'safari', product_id, start_date, end_date, guests, special_requests? }
- Logic: require user; compute simple total (see pricing notes below); insert booking with status 'requested'; return booking row
- Auth: user required

3) booking-confirm (admin/staff action)
- Input: { booking_id }
- Logic: flip status to 'confirmed' after manual review; optionally send notification
- Auth: only service role / admin

4) itinerary-by-id
- Input: { id }
- Logic: read safari_packages.itinerary_details and return for rendering

Skeleton (Deno):
```ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
});
```

## 7. Auth Settings
- Enable Email/Password, optionally Google/GitHub.
- Redirect URLs: http://localhost:5173 and production domain.
- Email confirmation: recommended for production.
- JWT: default expiry ~1h; refresh enabled.

## 8. Pricing & Availability (no payments)
- Properties: total = base_price * nights; if nights >= 30 and long_term_price present, prorate monthly.
- Safaris: total = base_price_usd * guests; optional seasonal adjustments later.
- Availability conflict when (start_date, end_date) overlaps for same product with status in ('requested','confirmed').

## 9. Seed Data
```sql
insert into public.properties (category, name, slug, description, base_price, currency, max_guests)
values ('mountain_villa','Kirinyaga Haven','kirinyaga-haven','Luxury villa at Mt. Kenya', 12000,'KES',6)
on conflict do nothing;

insert into public.safari_packages (title, slug, duration_nights, description, base_price_usd, itinerary_details)
values ('Weekend Escape','weekend-escape',2,'Quick immersion into the wild',850,
  '[{"day":1,"title":"Into the Aberdares","activities":["Lunch at The Ark","Game drive"],"lodging":"The Ark"}]'::jsonb
) on conflict do nothing;
```

## 10. Migration Order
1) Create types and tables
2) Enable RLS
3) Create policies
4) Create view bookings_public and grants
5) Create triggers/functions
6) Seed data
7) Deploy Edge functions

## 11. Frontend Integration Notes
- useAuth() provides user and session state; redirect to /auth when unauthenticated.
- Booking actions across Navbar, BookingWidget, MountainVillas, Safaris, UrbanApartments already require login.
- Implement a booking creation page later to call booking-create function and persist real bookings (current UI navigations are placeholders).

## 12. Future Enhancements
- Admin dashboard to confirm/cancel bookings.
- Seasonal rates table and rule engine.
- Reviews and ratings with RLS (owner write, public read).
- Calendar sync (ICS export, Google Calendar).

---

## 13. Explore Route Backend (Supabase)

Purpose: Power the Explore links in the footer and any "browse all" experiences with flexible filtering across properties and safari packages.

Schema additions (optional helpers):

```sql
-- Tagging for flexible filtering
create table if not exists public.tags (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  created_at timestamptz default now()
);

-- Junction tables for tags
create table if not exists public.property_tags (
  property_id uuid references public.properties(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (property_id, tag_id)
);

create table if not exists public.safari_tags (
  safari_id uuid references public.safari_packages(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (safari_id, tag_id)
);
```

RLS:
```sql
alter table public.tags enable row level security;
alter table public.property_tags enable row level security;
alter table public.safari_tags enable row level security;

-- Public can read tags and tag associations
create policy if not exists "public read tags" on public.tags for select using (true);
create policy if not exists "public read property_tags" on public.property_tags for select using (true);
create policy if not exists "public read safari_tags" on public.safari_tags for select using (true);
```

Queries (client-side):
- Properties by category and status:
```sql
select * from public.properties
where category = 'mountain_villa' and status = 'active'
order by created_at desc
limit 20 offset 0;
```
- Safari packages by is_active and optional tags:
```sql
select sp.* from public.safari_packages sp
left join public.safari_tags st on st.safari_id = sp.id
left join public.tags t on t.id = st.tag_id
where sp.is_active = true and (t.name = any(NULLIF($1::text[], '{}')) or $1 is null)
group by sp.id
order by sp.created_at desc
limit 20 offset 0;
```

Optional search function:
```sql
create or replace function public.search_catalog(q text)
returns table(source text, id uuid, title text, snippet text) language sql stable as $
  select 'property'::text, p.id, p.name, left(coalesce(p.description,''), 140)
  from public.properties p
  where p.status = 'active' and (p.name ilike '%'||q||'%' or p.description ilike '%'||q||'%')
  union all
  select 'safari', s.id, s.title, left(coalesce(s.description,''), 140)
  from public.safari_packages s
  where s.is_active = true and (s.title ilike '%'||q||'%' or s.description ilike '%'||q||'%');
$;
```

## 14. Customize Your Safari Backend (Supabase)

Purpose: Capture user customization requests from Safaris page's "Customize Your Safari" CTA and manage their lifecycle.

Schema:
```sql
create type if not exists public.custom_request_status as enum ('submitted','reviewing','quoted','scheduled','closed');

create table if not exists public.safari_custom_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  preferred_dates daterange,
  nights int,
  guests_adults int default 2,
  guests_children int default 0,
  budget numeric(10,2),
  currency text default 'USD',
  interests text[], -- e.g. '{"photography","big-five","culture"}'
  regions text[],   -- e.g. '{"mara","samburu"}'
  notes text,
  status custom_request_status default 'submitted',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.safari_custom_recommendations (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references public.safari_custom_requests(id) on delete cascade,
  title text not null,
  days jsonb not null, -- array of day objects similar to safari_packages.itinerary_details
  estimated_total numeric(10,2),
  currency text default 'USD',
  created_at timestamptz default now()
);

-- simple update trigger on requests
create or replace function public.touch_updated_at()
returns trigger as $
begin
  new.updated_at = now();
  return new;
end;
$ language plpgsql;

create trigger safari_custom_requests_touch
before update on public.safari_custom_requests
for each row execute procedure public.touch_updated_at();
```

RLS:
```sql
alter table public.safari_custom_requests enable row level security;
alter table public.safari_custom_recommendations enable row level security;

-- Owner policies for requests
create policy if not exists "own request read" on public.safari_custom_requests
  for select using (auth.uid() = user_id);
create policy if not exists "own request insert" on public.safari_custom_requests
  for insert with check (auth.uid() = user_id);
create policy if not exists "own request update" on public.safari_custom_requests
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Recommendations readable by the request owner
create policy if not exists "read recs by owner" on public.safari_custom_recommendations
  for select using (
    exists (
      select 1 from public.safari_custom_requests r
      where r.id = request_id and r.user_id = auth.uid()
    )
  );

-- Insert recommendations: service role/admin only (no public policy). Use server key in Edge function.
```

Edge Functions:
- custom-request-create (user)
  - Input: { nights, preferred_dates, guests_adults, guests_children, budget, currency?, interests?, regions?, notes? }
  - Action: Insert safari_custom_requests row with user_id from auth; return request id

- custom-recommendation-generate (service role)
  - Input: { request_id }
  - Action: Read request, compute a draft itinerary (can use templates or simple heuristics using regions/interests) and insert into safari_custom_recommendations

- custom-request-status-update (service role)
  - Input: { request_id, status }
  - Action: Update the status field

Example Deno handler snippet for user function:
```ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  const jwt = authHeader?.replace('Bearer ', '') || '';
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
  );

  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return new Response('Unauthorized', { status: 401 });

  const body = await req.json();
  const { nights, preferred_dates, guests_adults, guests_children, budget, currency, interests, regions, notes } = body;

  const { data, error } = await supabase
    .from('safari_custom_requests')
    .insert({
      user_id: user.id,
      nights,
      preferred_dates,
      guests_adults,
      guests_children,
      budget,
      currency,
      interests,
      regions,
      notes
    })
    .select('id')
    .single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify({ id: data.id }), { headers: { 'content-type': 'application/json' } });
});
```

Client integration:
- Explore page can query properties and safari_packages with filters and tags.
- "Customize Your Safari" CTA should require auth (already gated in UI). After login:
  - Open a customization form (dates, nights, guests, budget, interests, regions, notes)
  - Submit to custom-request-create Edge function
  - Show a timeline for the request status and any recommendations generated later