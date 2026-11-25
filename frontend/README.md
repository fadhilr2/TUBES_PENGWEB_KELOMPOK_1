# SewaSkill Frontend

Aplikasi web React untuk pencari jasa, penyedia, dan admin SewaSkill. Frontend menampilkan data dari REST API NestJS dan menggunakan Bootstrap serta CSS custom. Ikon antarmuka memakai koleksi Lucide melalui React Icons.

[Kembali ke panduan repository](../README.md) · [Panduan backend](../backend/README.md)

## Teknologi

- React 19 dan React Router 7.
- Vite 8.
- Bootstrap 5.3 dan CSS per fitur.
- React Icons 5.7 dengan import dari `react-icons/lu`.
- ESLint dan Prettier.

## Menjalankan frontend

Instal dependency dari root repository terlebih dahulu. Backend dan PostgreSQL perlu berjalan agar data aplikasi dapat dimuat.

```bash
npm install
npm run dev:frontend
```

Frontend tersedia pada [http://127.0.0.1:5173](http://127.0.0.1:5173). Vite menggunakan `strictPort`; port yang sudah dipakai tidak akan diganti otomatis.

Jika terminal sudah berada di folder `frontend/`, gunakan `npm run dev`. Instalasi tetap menggunakan workspace dan lockfile root.

## Konfigurasi API

Contoh tersedia pada [.env.example](.env.example). Secara default frontend menggunakan:

```dotenv
VITE_API_BASE_URL=/api/v1
```

File `frontend/.env` bersifat opsional. Variabel berawalan `VITE_` masuk ke kode browser, sehingga tidak boleh berisi password database atau secret backend.

Saat development dan preview, proxy Vite meneruskan `/api` ke `http://127.0.0.1:3001`. Pengaturan ini berada pada [vite.config.js](vite.config.js).

Jika backend memakai port berbeda, set `API_PROXY_TARGET` pada proses Vite. Contoh dari root repository menggunakan PowerShell:

```powershell
$env:API_PROXY_TARGET = 'http://127.0.0.1:3002'
npm run dev:frontend
```

Sesuaikan juga `PORT` backend. Jika origin frontend berubah, tambahkan origin tersebut pada `FRONTEND_ORIGIN` backend. Untuk hasil build yang dilayani tanpa Vite, server hosting perlu meneruskan `/api` ke backend dan mendukung fallback route SPA ke `index.html`.

## Halaman

| Route                                                                  | Fungsi                                                   |
| ---------------------------------------------------------------------- | -------------------------------------------------------- |
| `/`                                                                    | Beranda, kategori, rekomendasi, dan contoh karya         |
| `/katalog`                                                             | Pencarian, filter, pengurutan, dan tampilan kartu/tabel  |
| `/favorit`                                                             | Jasa favorit pengguna                                    |
| `/detail-jasa/:serviceId`                                              | Paket, profil penyedia, ulasan, dan pemesanan            |
| `/login`, `/register`                                                  | Masuk dan pendaftaran pencari jasa                       |
| `/profil`                                                              | Profil, saldo simulasi, dan pendaftaran penyedia         |
| `/jasa-saya`, `/tambah-jasa`, `/edit-jasa/:serviceId`                  | Pengelolaan jasa dan paket                               |
| `/order?service=...&package=...`                                       | Brief, kontak, deadline, dan pilihan paket               |
| `/pembayaran/:orderId`                                                 | Simulasi pembayaran berhasil/gagal                       |
| `/riwayat`                                                             | Pesanan pembelian/masuk, hasil, penerimaan, dan komplain |
| `/dashboard-penyedia`                                                  | Ringkasan pembelian, pendapatan, dan rating              |
| `/admin`, `/admin/pesanan`, `/admin/akun`, `/admin/jasa`, `/admin/log` | Halaman pengelolaan admin                                |

Route guard membantu navigasi sesuai role. Backend tetap memeriksa izin dan kepemilikan pada setiap operasi yang memerlukannya.

## Struktur source

```text
public/
  assets/images/          Service illustrations and portraits
  assets/photo-credits.json
  favicon.svg
src/
  components/             Header, footer, buttons, cards, and shared UI
  hooks/                  Page title hook
  pages/                  Application pages and admin tabs
  state/
    api.js                Fetch, cookies, CSRF, errors, and API pagination
    store.js              Route data loading and API actions
    DemoProvider.jsx      React context provider
    format.js             Currency, categories, and display helpers
  styles/                 Shared and feature styles
  App.jsx                 Routes, guards, and icon defaults
  main.jsx                React entry point
  siteContent.js          Homepage content and category icon components
```

## Alur data dan ikon

Halaman memakai `useDemo()` untuk membaca pengguna, data halaman, dan action API. `store.js` memuat resource sesuai route melalui `api.js`. Request mutasi membawa cookie dan token CSRF. Setelah perubahan berhasil, data yang diperlukan dimuat kembali.

Identitas berasal dari `/auth/me`. Browser tidak menyimpan password, saldo, atau database bisnis di localStorage. Jika API tidak tersedia, aplikasi menampilkan error dan tombol retry.

Komponen ikon diimpor langsung dari `react-icons/lu`. `IconContext` pada `App.jsx` menetapkan class `ui-icon` dan menandai ikon dekoratif agar tidak dibaca pembaca layar. Panah aksi memakai `LuArrowRight`; panah kembali, naik, dan turun mengikuti arah tindakan. Rating, favorit, menu, penutup, serta ikon kategori memakai koleksi yang sama.

Logo dan ilustrasi disimpan di `public/`. Kredit foto tersedia pada [photo-credits.json](public/assets/photo-credits.json).

## Perintah

| Dari root repository        | Dari folder `frontend/` | Fungsi                    |
| --------------------------- | ----------------------- | ------------------------- |
| `npm run dev:frontend`      | `npm run dev`           | Server development        |
| `npm run build -w frontend` | `npm run build`         | Build ke `frontend/dist/` |
| `npm run lint -w frontend`  | `npm run lint`          | Pemeriksaan ESLint        |
| `npm run preview`           | `npm run preview`       | Preview hasil build       |

Jalankan `npm run format` atau `npm run format:check` dari root untuk Prettier kedua proyek dan dokumentasinya.

## Pengujian browser

Runner memakai Brave pada endpoint CDP khusus `127.0.0.1:9222` dan database `sewaskill_test`. Pada Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-browser.ps1
npm run test:browser
```

Jalankan dari root. Runner memulai API dan Vite pada port sementara, menjalankan alur pencari/penyedia/admin, memeriksa layout desktop/mobile, lalu menghentikan proses miliknya. Screenshot disimpan pada `artifacts/` yang diabaikan Git.

Runner membersihkan data database test. Jangan menjalankannya bersamaan dengan `npm run test:backend`. Database development tidak di-reset.

## Batas fitur

Saldo dan pembayaran merupakan simulasi. Lampiran hanya metadata. Data localStorage versi lama tidak diimpor. Cache mengambil halaman API yang diperlukan untuk mempertahankan filter UI; pengambilan incremental untuk dataset besar belum menjadi target MVP.
