# s(T☆R)light ✦

*finding æquanimitas in a princess-coded constellation*

Website pribadi berbentuk langit malam. Setiap bintang membuka satu halaman:

| Bintang | Isi |
|---|---|
| **lect(o)** | Tulisan panjang: analisis dan esai |
| **Florilegium** | Kutipan, buku yang kamu sarankan, link bacaan bagus |
| **Nocturnes** | Lagu-lagu favorit, *the soundtrack of my little universe* |
| **Lieux** | Tempat berkesan di peta, dengan foto |
| **Starry Lab** | Proyek yang kamu buat (Quefory sudah ada) |

Setiap isi baru menambah satu bintang kecil ✧ di langit homepage.

## Isi folder

| File | Fungsi |
|---|---|
| `index.html` | Homepage langit malam |
| `lecto.html`, `florilegium.html`, `nocturnes.html`, `lieux.html`, `lab.html` | Halaman tiap bintang |
| `admin.html` + `admin.js` | **Keeper's room**: tempat menambah dan mengatur isi |
| `style.css` | Warna & tampilan (ubah di bagian `:root`) |
| `config.js` | Kunci Supabase, judul, posisi bintang |
| `common.js` | Fungsi bersama |
| `assets/` | Gambar preview, ikon, gambar Quefory |
| `supabase-starlight.sql` | Setup database. Dijalankan sekali, **jangan di-upload ke GitHub** |

---

## Setup (sekali saja, ±10 menit)

Pakai **project Supabase yang sama dengan Quefory**, dan **login Keeper yang sama**.

### 1. Jalankan SQL
1. Supabase → project **quefory** → **SQL Editor** → **New query**.
2. Tempel seluruh isi `supabase-starlight.sql` → **Run**.
3. Harus muncul "Success". Ini membuat tabel untuk kelima bintang dan tempat menyimpan foto.

### 2. Buat repo GitHub
1. GitHub → **+** → **New repository**.
2. Nama repo **persis**: `157starry.github.io` · **Public** · tanpa README → **Create repository**.

### 3. Upload file
1. Klik **uploading an existing file**.
2. Drag semua file **kecuali `supabase-starlight.sql`**, termasuk **folder `assets`**.
3. Commit message: `Launch s(T☆R)light` → **Commit changes**.

### 4. Nyalakan GitHub Pages
**Settings → Pages** → Source: *Deploy from a branch* → Branch `main`, `/ (root)` → **Save**.

### 5. Selesai ✧
- Website: **https://157starry.github.io/**
- Keeper's room: **https://157starry.github.io/admin.html**
- Quefory tetap di **https://157starry.github.io/quefory/**

---

## Cara mengisi (dari HP pun bisa)

Buka `admin.html` → login → pilih tab bintang → **+ New**.

- **lect(o):** Isi judul, subjudul, topik, lalu tulisannya. Tombol toolbar: **B** tebal · *I* miring · **H** subjudul · **❝** kutipan besar · 🔗 link · • daftar · ✧ pemisah · 🖼 gambar · **Preview**. Tulisan tersimpan sebagai **draft** sampai kamu centang **Published**. Centang **Feature** agar tampil besar di atas.
- **Florilegium:** Pilih jenis: *Quote*, *Book*, atau *Good read*. Cover buku opsional; kalau kosong, otomatis dibuatkan sampul warna.
- **Nocturnes:** Tempel link YouTube / Spotify / Apple Music. Atur urutan dengan **↑ ↓**. Centang **★ On repeat** untuk satu lagu andalan minggu ini.
- **Lieux:** Cari nama tempat atau ketuk peta untuk menaruh pin, lalu tambah foto. Foto otomatis diperkecil supaya ringan.
- **Starry Lab:** Tambah proyek baru. Quefory sudah terisi.

Hapus atau sembunyikan isi lewat tombol **Delete** atau centang **Visible**.

## Catatan tulisan analisis
Publikasikan setelah tugas dinilai, cek aturan mata kuliah, ubah jadi format esai, hapus NIM/nama kelas/nama teman, dan cantumkan sumber.

## Mengubah tampilan
| Ingin mengubah… | Edit di |
|---|---|
| Judul & subjudul homepage, posisi bintang | `config.js` |
| Warna | `style.css` → `:root` |
| Tagline halaman | file `.html` halaman itu |
