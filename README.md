# SewaSkill - Platform Freelance Jasa Digital

> Tugas Besar - Perancangan dan Pemrograman Web  
> Kelompok 1

---

## Deskripsi Proyek

SewaSkill adalah platform web untuk mencari dan memesan jasa freelance digital skala mikro, seperti edit video, desain grafis, bimbingan koding, dan penulisan konten.

Proyek ini dikembangkan menggunakan React 19 dan Bootstrap 5 dengan arsitektur Single Page Application (SPA), serta menyimpan data di localStorage dengan seed dari JSON lokal. Desain menggunakan section selebar layar, container responsif, warna hitam-putih dengan aksen biru, dan animasi ringan tanpa perpindahan tombol saat hover.

---

## Tim Pengembang

| No  | Nama Anggota                  |      GitHub      |
| :-: | :---------------------------- | :--------------: |
|  1  | **Fadhil R.**                 |   `@fadhilr2`    |
|  2  | **I Putu Gede Deva Gundhala** |    `@theepar`    |
|  3  | **Adita R.**                  |   `@aditarhm`    |
|  4  | **Jeni**                      | `@ejeniamutiara` |
|  5  | **Abdurrahman Saleh**         |  `@JustAHermit`  |

---

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 8
- **Routing:** React Router DOM v7
- **CSS Framework:** Bootstrap 5.3
- **Data:** localStorage (tanpa backend), seed awal dari `src/data/demo.json`
- **Linter:** ESLint 10
- **State:** React Context di atas `src/state/store.js`

---

## Halaman dan Fitur

| Halaman            | Route                                                                  | Fitur                                                                                            |
| ------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Beranda            | `/`                                                                    | Hero gradien, enam contoh karya, kategori, rekomendasi kota/kebutuhan, terakhir dilihat          |
| Katalog & favorit  | `/katalog`, `/favorit`                                                 | Pencarian jasa/talent/lokasi, filter kategori dan harga, urutan, kartu/tabel, favorit            |
| Detail jasa        | `/detail-jasa/:serviceId`                                              | Profil penyedia, paket, portofolio, ulasan CRUD milik sendiri, pemesanan                         |
| Login & register   | `/login`, `/register`                                                  | Akun demo tiga peran; akun baru selalu pencari jasa                                              |
| Profil             | `/profil`                                                              | Nama/lokasi, saldo demo, pendaftaran penyedia, keluar, hapus akun dengan penjagaan pesanan aktif |
| Kelola jasa        | `/jasa-saya`, `/tambah-jasa`, `/edit-jasa/:serviceId`                  | CRUD jasa milik sendiri; paket bernama unik dengan harga masing-masing                           |
| Pemesanan          | `/order?service=...&package=...`                                       | Brief, deadline, pilihan paket, metode bayar, biaya layanan 5%                                   |
| Pembayaran         | `/pembayaran/:orderId`                                                 | Simulasi berhasil/gagal dengan saldo demo, retry                                                 |
| Riwayat            | `/riwayat`                                                             | Batal, kirim hasil, terima, komplain, dan hapus riwayat selesai                                  |
| Dashboard penyedia | `/dashboard-penyedia`                                                  | Pembelian per jasa, pendapatan selesai, sebaran rating, ulasan terbaru                           |
| Admin              | `/admin`, `/admin/pesanan`, `/admin/akun`, `/admin/jasa`, `/admin/log` | Ringkasan, persetujuan/refund, CRUD dan blokir akun, moderasi posting, log aktivitas             |

### Akun Demo

| Peran         | Email               | Kata sandi |
| ------------- | ------------------- | ---------- |
| Pencari jasa  | `deva@example.com`  | `demo123`  |
| Penyedia jasa | `rizky@example.com` | `demo123`  |
| Admin         | `admin@example.com` | `demo123`  |

Seed dimuat dari `src/data/demo.json`. Perubahan tersimpan di localStorage dengan key `sewaskill-data-v2`. Untuk mengulang demo dari awal, klik tombol **Reset data** di footer atau hapus data situs pada browser.

Alur pesanan: `menunggu_pembayaran → dibayar → dikirim → menunggu_admin → selesai / direfund`. Pesanan belum dibayar dapat dibatalkan. Persetujuan admin menambahkan harga jasa ke saldo penyedia; penolakan mengembalikan total pembayaran ke pembeli.

Versi ini mengikuti referensi fitur mobile. Autentikasi, saldo, pembayaran, dan penyerahan metadata file merupakan simulasi lokal; tidak ada backend, transfer uang, atau unggahan file sungguhan. Aturan peran dan validasi dijalankan di `src/state/store.js`.

Aset visual berada di `public/assets/images/`; sumber foto dan lisensinya dicatat pada `public/assets/photo-credits.json`.

---

## Cara Menjalankan Proyek

### 1. Prasyarat

- Node.js 20.19+ atau 22.12+ (sesuai kebutuhan Vite 8)
- Git

### 2. Clone Repository

```bash
git clone https://github.com/fadhilr2/TUBES_PENGWEB_KELOMPOK_1.git
cd TUBES_PENGWEB_KELOMPOK_1
```

### 3. Pindah Branch (Opsional)

```bash
git checkout deva
```

### 4. Install Dependensi

```bash
npm install
```

### 5. Jalankan Server Lokal

```bash
npm run dev
```

Akses aplikasi melalui browser di `http://localhost:5173/`.

### 6. Perintah Lainnya

- Menjalankan linter:
  ```bash
  npm run lint
  ```
- Build untuk produksi:
  ```bash
  npm run build
  ```

---

## Struktur Folder

```text
public/
  assets/images/       Gambar ilustrasi dan foto; kredit di photo-credits.json
src/
  data/demo.json       Seed akun, jasa, pesanan, ulasan, dan log
  components/          Navbar, footer, UI bersama, kartu jasa, galeri
  hooks/               Hook judul halaman
  pages/               Halaman pengguna, penyedia, dan admin
  state/               store.js (data + aturan), validators.js, provider, dan format
  styles/              CSS per fitur (base, header, components, home, catalog, detail, services, account, orders, dashboard, admin, footer)
  App.jsx              Routing dan penjagaan akses peran
  index.css            Mengimpor semua file CSS di styles/
```

## Validasi

```bash
npm run lint
npm run build
```
