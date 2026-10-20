-- s(T☆R)light · add "Recommend" (♡) to Florilegium books (run once)
alter table public.star_flori add column if not exists featured boolean not null default false;
notify pgrst, 'reload schema';
