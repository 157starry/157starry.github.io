# Grammar Detector · bagian server

File di folder ini **tidak dipakai langsung oleh GitHub Pages**. Isinya disalin ke Supabase (proyek Starry Lab / quefory).

| File | Dipasang di |
|---|---|
| `setup.sql` | Supabase → SQL Editor (jalankan sekali) |
| `grammar-detector.ts` | Supabase → Edge Functions → function bernama `grammar-detector` |
| `visitors.sql` | Supabase → SQL Editor (jalankan sekali) |
| `tense-visitors.ts` | Supabase → Edge Functions → function bernama `tense-visitors` |

Secret yang dibutuhkan (Edge Functions → Secrets), jangan pernah ditaruh di repo:

- `ANTHROPIC_API_KEY`: API key Claude
- `OWNER_PASS` (opsional): kata sandi pemilik. Masukkan sekali lewat tautan "Kunci pemilik" di halaman Detector; browser itu lalu bebas dari batas per pengunjung (rem harian tetap berlaku). Kata sandi yang salah dihapus otomatis dan tetap dihitung sebagai cek biasa.

## Pengaturan yang bisa diubah (di `grammar-detector.ts`)

- `PER_VISITOR = 20`: cek AI per pengunjung per hari
- `PER_DAY = 500`: rem darurat, total cek AI per hari untuk seluruh website (±US$0,20/hari paling banyak)
- `MODEL = "claude-haiku-5-5"`

Kalau function belum terpasang, kuota habis, atau saldo API habis, halaman Detector otomatis memakai detector cadangan berbasis aturan (`js/rules.js`), jadi website tetap jalan.

## Buku Tamu (pengunjung)

- Setiap browser mendapat ID acak (`jk-vid` di localStorage). Nama dari kartu kedatangan disimpan sebagai label; tanpa nama tercatat sebagai "Tamu #n".
- Dicatat: nama panggilan, kunjungan (1 per sesi browser), pertama/terakhir datang, jumlah cek Detector, roda gigi, lantai menara, skor terbaik. **Tidak** disimpan: email, IP mentah, isi kalimat.
- Dashboard: `#/pemilik` (butuh kunci pemilik). Selama kunci pemilik aktif, kunjunganmu sendiri tidak dicatat, dan catatan lama dari browsermu dihapus otomatis saat Buku Tamu dibuka.
- Anti-spam: maksimal 30 ID browser baru per jaringan per hari.
