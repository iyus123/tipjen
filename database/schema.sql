create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  price integer not null default 0,
  stock integer not null default 0,
  image_url text,
  published boolean not null default true,
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


do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_products_updated_at'
  ) then
    create trigger set_products_updated_at
    before update on public.products
    for each row execute function public.set_updated_at();
  end if;
end $$;

alter table public.products enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'Public can read published products'
  ) then
    create policy "Public can read published products"
      on public.products
      for select
      to anon, authenticated
      using (published = true);
  end if;
end $$;
