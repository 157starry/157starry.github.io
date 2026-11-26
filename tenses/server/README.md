# Grammar Detector · bagian server

File di folder ini **tidak dipakai langsung oleh GitHub Pages**. Isinya disalin ke Supabase (proyek Starry Lab / quefory).

| File | Dipasang di |
|---|---|
| `setup.sql` | Supabase → SQL Editor (jalankan sekali) |
| `grammar-detector.ts` | Supabase → Edge Functions → function bernama `grammar-detector` |

Secret yang dibutuhkan: `ANTHROPIC_API_KEY` (Edge Functions → Secrets). Jangan pernah menaruh key itu di repo.

## Pengaturan yang bisa diubah (di `grammar-detector.ts`)

- `PER_VISITOR = 20`: cek AI per pengunjung per hari
- `PER_DAY = 500`: rem darurat, total cek AI per hari untuk seluruh website (±US$0,20/hari paling banyak)
- `MODEL = "claude-haiku-5-5"`

Kalau function belum terpasang, kuota habis, atau saldo API habis, halaman Detector otomatis memakai detector cadangan berbasis aturan (`js/rules.js`), jadi website tetap jalan.
