# SewaSkill

Platform pemesanan jasa digital untuk Tugas Besar Perancangan dan Pemrograman Web, Kelompok 1.

SewaSkill mempertemukan pencari jasa dengan penyedia layanan desain, pemrograman, video, penulisan konten, dan foto. Aplikasi memiliki katalog, paket layanan, pemesanan, ulasan, serta halaman pengelolaan untuk penyedia dan admin. Saldo dan pembayaran masih berupa simulasi.

## Proyek dalam repository

| Folder      | Fungsi                                        | Teknologi                                   | Panduan                               |
| ----------- | --------------------------------------------- | ------------------------------------------- | ------------------------------------- |
| `frontend/` | Tampilan aplikasi dan akses API               | React 19, Vite 8, Bootstrap 5, React Icons  | [README frontend](frontend/README.md) |
| `backend/`  | REST API, aturan bisnis, dan penyimpanan data | NestJS 11, TypeScript, Prisma 6, PostgreSQL | [README backend](backend/README.md)   |

Kedua proyek menggunakan npm workspaces dan satu `package-lock.json` di root. Database dijalankan langsung tanpa Docker. `.git/` tetap berada di root repository.

## Fitur utama

- Register, login, logout, profil, dan tiga peran: pencari, penyedia, serta admin.
- Katalog dengan pencarian, filter, pengurutan, favorit, dan riwayat jasa terakhir dilihat.
- Pengelolaan jasa dengan satu atau beberapa paket bernama dan berharga masing-masing.
- Ulasan milik pengguna yang dapat ditambah, diperbarui, dan dihapus.
- Pesanan dengan brief, deadline opsional, kontak, dan metadata lampiran.
- Simulasi pembayaran berhasil/gagal, pengiriman hasil, penerimaan, komplain, dan refund.
- Dashboard penyedia, moderasi jasa, manajemen akun, dan audit aktivitas admin.

## Menjalankan aplikasi

### 1. Prasyarat

- Node.js 22.12+ dan npm.
- PostgreSQL lokal; pengembangan proyek ini memakai PostgreSQL 17.
- Git.

Jalankan seluruh perintah berikut dari root repository.

```bash
npm install
npm run setup:env
```

`setup:env` membuat `backend/.env` dengan `SESSION_SECRET` dan `JWT_SECRET` acak dan mempertahankan file yang sudah ada. Isi koneksi `DATABASE_URL` dan `TEST_DATABASE_URL` sesuai PostgreSQL lokal. Langkah pembuatan role dan database tersedia pada [panduan database backend](backend/README.md#database-lokal).

### 2. Siapkan database

Setelah database `sewaskill` dan `sewaskill_test` tersedia serta environment telah diisi:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Hentikan backend sebelum generate Prisma pada Windows agar file engine tidak terkunci. Seed development mengisi database kosong dan tidak menimpa data akun yang sudah ada.

### 3. Jalankan server

```bash
npm run dev
```

Perintah tersebut menjalankan frontend dan backend bersama. Gunakan `npm run dev:frontend` atau `npm run dev:backend` jika ingin menjalankan keduanya pada terminal terpisah.

| Layanan             | Alamat default                                                             |
| ------------------- | -------------------------------------------------------------------------- |
| Frontend            | [http://127.0.0.1:5173](http://127.0.0.1:5173)                             |
| API readiness       | [http://127.0.0.1:3001/api/v1/health](http://127.0.0.1:3001/api/v1/health) |
| Swagger development | [http://127.0.0.1:3001/api/docs](http://127.0.0.1:3001/api/docs)           |

## Akun development

| Peran         | Email               | Password  |
| ------------- | ------------------- | --------- |
| Pencari jasa  | `deva@example.com`  | `demo123` |
| Penyedia jasa | `rizky@example.com` | `demo123` |
| Admin         | `admin@example.com` | `demo123` |

Akun baru selalu menjadi pencari dengan saldo simulasi 500.000. Pendaftaran penyedia tersedia pada halaman profil. Seed menyimpan password sebagai hash; kredensial di atas hanya untuk akun contoh development.

## Alur transaksi

```text
menunggu_pembayaran -> dibayar -> dikirim -> menunggu_admin -> selesai
                                                         -> direfund
menunggu_pembayaran -> dibatalkan
```

Backend menghitung biaya layanan sebesar 5%. Pembayaran berhasil mengurangi total dari saldo pembeli. Setelah pembeli meninjau hasil, admin meneruskan harga jasa ke penyedia atau mengembalikan total pembayaran ke pembeli. Perubahan status, saldo, ledger, dan audit disimpan dalam satu transaksi database.

## Perintah pengembangan

| Perintah dari root     | Fungsi                                         |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Jalankan kedua proyek                          |
| `npm run lint`         | Periksa frontend dan TypeScript backend        |
| `npm run build`        | Build kedua proyek                             |
| `npm run format`       | Rapikan source dan dokumentasi dengan Prettier |
| `npm run format:check` | Periksa format tanpa mengubah file             |
| `npm run test:backend` | Jalankan pengujian API dan transaksi           |
| `npm run test:browser` | Jalankan alur UI dan pemeriksaan responsif     |
| `npm audit`            | Periksa advisory dependency pada lockfile      |

Pengujian API dan browser memakai `sewaskill_test` serta membersihkan fixture di database test tersebut. Jalankan secara bergantian. Setup browser dan rincian pengujian tersedia pada [README frontend](frontend/README.md#pengujian-browser) dan [README backend](backend/README.md#pengujian).

## Batas aplikasi

Pembayaran, saldo, dan refund merupakan simulasi. Lampiran hanya menyimpan nama serta ukuran file; tidak ada unggahan berkas. Hasil pekerjaan berupa catatan atau tautan. Ulasan belum memerlukan pembelian terverifikasi. Data localStorage dari versi lama tidak diimpor otomatis.

Environment lokal, database, `node_modules`, build output, dan artefak pengujian diabaikan Git. Gunakan contoh environment pada masing-masing proyek tanpa memasukkan rahasia ke source.

## Dokumen

- [Frontend](frontend/README.md): halaman, komponen, ikon, konfigurasi API, dan pengujian UI.
- [Backend](backend/README.md): database, environment, endpoint, autentikasi, dan aturan transaksi.
- [PRD](docs/PRD.md): kebutuhan dan cakupan implementasi.
- [Catatan implementasi](docs/IMPLEMENTATION.md): perubahan dan hasil verifikasi.

## Tim pengembang

| Nama                      | GitHub           |
| ------------------------- | ---------------- |
| Fadhil R.                 | `@fadhilr2`      |
| I Putu Gede Deva Gundhala | `@theepar`       |
| Adita R.                  | `@aditarhm`      |
| Jeni                      | `@ejeniamutiara` |
| Abdurrahman Saleh         | `@JustAHermit`   |
