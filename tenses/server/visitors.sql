-- Pengunjung Purrfect Tense · jalankan SEKALI di Supabase SQL Editor (New query → tempel → Run).
-- Satu baris = satu browser (ID acak dari browser), dengan nama panggilan kalau pengunjung mau kenalan.
-- Tidak menyimpan email, IP mentah, atau isi kalimat Detector.

create table if not exists public.tense_visitors (
  vid        uuid primary key,
  no         bigserial unique,           -- nomor Tamu (#1, #2, …) untuk yang belum kenalan
  name       text,
  first_seen timestamptz not null default now(),
  last_seen  timestamptz not null default now(),
  visits     int not null default 0,
  checks     int not null default 0,     -- jumlah cek Detector
  gears      int not null default 0,     -- roda gigi (tense dikuasai, 0–16)
  floors     int not null default 0,     -- lantai menara ditaklukkan (0–5)
  best       int not null default 0      -- skor menara terbaik
);

-- penghitung ID baru per jaringan per hari (anti-spam), disimpan sebagai hash, bukan IP
create table if not exists public.tense_visitor_ip (
  day date not null,
  ip  text not null,
  n   int  not null default 0,
  primary key (day, ip)
);

-- RLS aktif tanpa policy = tidak bisa dibaca/ditulis dari browser. Hanya server (Edge Function).
alter table public.tense_visitors enable row level security;
alter table public.tense_visitor_ip enable row level security;
