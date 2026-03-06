create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  price integer not null default 0,
  stock integer not null default 0,
  image_url text,
  is_published boolean not null default true,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
on public.products
for select
to anon, authenticated
using (is_published = true);
