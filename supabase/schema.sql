-- Slurp Log schema. Paste into Supabase → SQL Editor → Run.

-- The two of us. Each person's PIN is how the app knows who's using it.
-- CHANGE THESE PINS before running (8+ digits recommended).
create table people (
  id text primary key check (id in ('a', 'b')),
  name text not null,
  pin text not null unique
);
insert into people (id, name, pin) values ('a', 'Rico', '11111111'), ('b', 'Rhiz', '22222222');

create table visits (
  id uuid primary key default gen_random_uuid(),
  food_type text not null default 'ramen',
  spot_name text not null,
  area text,
  style text,
  lat double precision,
  lng double precision,
  date date not null default current_date,
  ordered text,
  photos text[] not null default '{}',
  created_by text references people,
  created_at timestamptz not null default now()
);

-- One row per person per visit, so each of us only ever writes our own row.
create table ratings (
  visit_id uuid not null references visits on delete cascade,
  person text not null references people,
  scores jsonb not null default '{}',   -- { broth: 8, noodles: 7, ... }
  note text not null default '',
  updated_at timestamptz not null default now(),
  primary key (visit_id, person)
);

create table wishes (
  id uuid primary key default gen_random_uuid(),
  spot_name text not null,
  note text,
  added_by text references people,
  lat double precision,
  lng double precision,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

-- Access: the app sends the PIN as an `x-slurp-pin` header on every request.
-- Without a valid PIN nothing can be read or written.
create function my_person() returns text
language sql stable security definer set search_path = public
as $$
  select id from people
  where pin = current_setting('request.headers', true)::json->>'x-slurp-pin'
$$;

alter table people enable row level security;
alter table visits enable row level security;
alter table ratings enable row level security;
alter table wishes enable row level security;

create policy "members read people" on people for select using (my_person() is not null);
create policy "members update own name" on people for update using (id = my_person());

create policy "members all visits" on visits for all
  using (my_person() is not null) with check (my_person() is not null);

create policy "members read ratings" on ratings for select using (my_person() is not null);
create policy "write own rating" on ratings for insert with check (person = my_person());
create policy "update own rating" on ratings for update using (person = my_person());
create policy "delete own rating" on ratings for delete using (person = my_person());

create policy "members all wishes" on wishes for all
  using (my_person() is not null) with check (my_person() is not null);

-- Photos: public-read bucket (paths are random UUIDs), members upload/delete.
insert into storage.buckets (id, name, public) values ('photos', 'photos', true);
create policy "members upload photos" on storage.objects for insert
  with check (bucket_id = 'photos' and my_person() is not null);
create policy "members delete photos" on storage.objects for delete
  using (bucket_id = 'photos' and my_person() is not null);

-- Hide PINs from the API; the app only needs id + name.
revoke select on people from anon, authenticated;
grant select (id, name), update (name) on people to anon, authenticated;
