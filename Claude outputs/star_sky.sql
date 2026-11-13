-- s(T☆R)light · sky weather for the home page (run once in Supabase → SQL Editor)
create table if not exists public.star_sky (
  id int primary key default 1 check (id = 1),
  weather text not null default 'clear' check (weather in ('clear', 'cloudy', 'rain')),
  updated_at timestamptz not null default now()
);
insert into public.star_sky (id) values (1) on conflict (id) do nothing;

alter table public.star_sky enable row level security;
drop policy if exists "sky is public" on public.star_sky;
create policy "sky is public" on public.star_sky for select using (true);
drop policy if exists "only the keeper sets the sky" on public.star_sky;
create policy "only the keeper sets the sky" on public.star_sky for update
  using (public.quefory_is_keeper()) with check (public.quefory_is_keeper());

grant select on public.star_sky to anon, authenticated;
grant update on public.star_sky to authenticated;
notify pgrst, 'reload schema';
