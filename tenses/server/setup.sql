-- Grammar Detector · batas pemakaian
-- Jalankan SEKALI di Supabase: SQL Editor → New query → tempel semua isi file ini → Run.
-- Membuat tabel kecil penghitung cek per pengunjung per hari, plus fungsi penambahnya.
-- Pengunjung tidak disimpan sebagai IP mentah: yang disimpan hanya hash acak per hari.

create table if not exists public.detector_usage (
  day     date not null,
  visitor text not null,
  hits    int  not null default 0,
  primary key (day, visitor)
);

-- RLS aktif tanpa policy = tidak bisa dibaca/ditulis dari browser (anon). Hanya server.
alter table public.detector_usage enable row level security;

create or replace function public.detector_hit(p_visitor text, p_per_visitor int, p_per_day int)
returns text
language plpgsql
as $$
declare
  v int;
  total int;
begin
  -- bersih-bersih data lama (lebih dari 7 hari)
  delete from public.detector_usage where day < current_date - 7;

  select coalesce(sum(hits), 0) into total from public.detector_usage where day = current_date;
  if total >= p_per_day then
    return 'day';
  end if;

  insert into public.detector_usage (day, visitor, hits)
  values (current_date, p_visitor, 1)
  on conflict (day, visitor) do update set hits = public.detector_usage.hits + 1
  returning hits into v;

  if v > p_per_visitor then
    return 'visitor';
  end if;
  return 'ok';
end;
$$;

-- fungsi ini hanya untuk server, bukan untuk dipanggil dari browser
revoke all on function public.detector_hit(text, int, int) from public, anon, authenticated;
