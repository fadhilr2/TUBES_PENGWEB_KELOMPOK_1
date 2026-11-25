# Catatan Implementasi SewaSkill

Tanggal verifikasi: 12 November 2026.

## Hasil

Repository sekarang menggunakan npm workspaces dengan aplikasi React di `frontend/` dan REST API NestJS di `backend/`. `.git/` tetap berada di root. Perubahan sebelumnya pada posisi input dan penghapusan teks bantuan password tetap dipertahankan.

PostgreSQL 17 dijalankan langsung pada WSL Debian dan diakses proses Node.js Windows melalui koneksi lokal. Tidak ada konfigurasi Docker atau container yang diperlukan untuk proyek ini. Database development dan test dibuat terpisah; kredensial lokal berada pada `backend/.env` yang diabaikan Git.

Tidak ada commit, staging, atau push yang dilakukan selama implementasi.

## Perubahan utama

- Auth register/login/logout/me menggunakan hash Argon2id, sesi PostgreSQL, cookie HttpOnly, CSRF, pemeriksaan origin, serta batas percobaan berdasarkan IP dan akun.
- DTO menolak field tak dikenal. Guard memeriksa status akun, role, dan versi sesi terkini. Endpoint resource memeriksa kepemilikan.
- Schema relasional mencakup akun, jasa, paket, pesanan, ulasan, favorit, recent, audit, ledger saldo, dan sesi. Dua migration SQL menyertakan constraint nominal, rating, durasi, nama paket aktif, dan saldo aman.
- Katalog, profil, pendaftaran penyedia, CRUD jasa/paket/ulasan, favorit, recent, riwayat, dashboard, dan halaman admin memakai resource API.
- Cache React diisi sesuai route dan akses pengguna. Identitas diambil dari `/auth/me`; tidak ada endpoint seluruh state database atau fallback data lokal ketika API gagal.
- Katalog, dashboard, dan kartu jasa memakai nilai rating/agregat dari server. Pagination API tidak dipotong diam-diam oleh cache frontend.
- Perubahan bisnis memakai loading state, tombol yang dinonaktifkan ketika mutasi berjalan, penanganan error, dan invalidasi cache. Tombol pemeriksaan pembayaran mengambil status terbaru dari API.
- Pembayaran simulasi, pembatalan, pengiriman hasil, penerimaan/komplain, persetujuan, dan refund menjalankan transisi server. Saldo, ledger, dan log berubah dalam transaksi serializable dengan retry konflik.
- Penghapusan akun/jasa menggunakan penjagaan pesanan aktif dan soft delete untuk mempertahankan relasi transaksi. Penghapusan riwayat hanya menyembunyikannya dari pembeli.
- Fixture dipindahkan ke backend. Seed meng-hash password, mempertahankan ID serta opening balance, dan tidak mengubah database yang sudah berisi akun.
- Reset publik dan pemanggilan pembayaran ke layanan contoh eksternal dihapus. Reset database hanya tersedia sebagai perintah development dengan konfirmasi target.
- README mencakup PostgreSQL langsung, setup environment, migration, seed, server, Swagger, dan perintah pengujian.
- Dokumentasi dipisahkan menjadi README root, README frontend, dan README backend. Tautan lokal dan nama script diperiksa terhadap file proyek.
- Ikon antarmuka memakai Lucide melalui React Icons, termasuk panah lurus, menu, favorit, rating, kategori, dan tombol tutup. Ikon simbol teks serta gambar ikon kategori lama diganti.
- Helper `sumBy` dan `countByStatus`, prop ulasan katalog yang tidak dipakai, serta konfigurasi Nest CLI yang tidak dibaca oleh build TypeScript dihapus.

## Hasil pemeriksaan

| Pemeriksaan                          | Hasil                                                                                           |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `npm run lint`                       | Lulus untuk frontend dan pemeriksaan TypeScript backend                                         |
| `npm run build`                      | Build frontend dan backend lulus                                                                |
| `npm run format:check`               | Seluruh source dan dokumentasi lulus Prettier                                                   |
| `git diff --check`                   | Tidak ada error whitespace                                                                      |
| `npm run test:backend`               | 12 tes lulus, 0 gagal                                                                           |
| `npm run test:browser`               | Alur selesai dan refund lulus melalui UI                                                        |
| Pemeriksaan responsif                | 32 kombinasi halaman/peran/viewport pada lebar 375 dan 1366; tanpa overflow horizontal          |
| Layout autentikasi                   | 10 pemeriksaan login/register pada lebar 375, 767, 768, 1024, dan 1366; input 52px dan sejajar  |
| Error browser                        | 0 runtime error pada runner browser                                                             |
| API terputus dan retry               | Menampilkan error, tidak membuat seed pengganti, lalu pulih setelah retry                       |
| Logout pada katalog                  | Sesi berakhir dan katalog publik dimuat kembali                                                 |
| `npm audit`                          | 0 kerentanan pada lockfile yang diverifikasi                                                    |
| Instalasi bersih                     | `npm ci`, generate Prisma, lint, dan build lulus pada salinan sementara tanpa node_modules awal |
| Runtime native pada instalasi bersih | Hash Argon2id berhasil                                                                          |
| Seed berulang                        | Tidak menggandakan fixture atau menambah saldo                                                  |
| Restart API                          | Identitas sesi dan data pesanan tetap tersimpan                                                 |

Pengujian API mencakup proyeksi publik, CSRF/origin, strict DTO, register, akses antar-role, ownership, moderasi, ulasan, snapshot pesanan, saldo kurang, pembayaran gagal, pembayaran ganda, approve/refund paralel, persaingan pembayaran dengan pembatalan, penyesuaian saldo admin bersamaan dengan pembayaran, recent maksimal 12, perubahan role, soft delete, dan rate limit autentikasi.

Pengujian browser memakai API dan Vite pada port sementara serta database `sewaskill_test`. Browser menjalankan register, login, pembuatan jasa, favorit, ulasan, checkout, pembayaran, pengiriman hasil, penerimaan/komplain, dan keputusan admin. Screenshot lokal tersedia pada `artifacts/` yang diabaikan Git.

Verifikasi dilakukan menggunakan Node.js 26.12.1 dan PostgreSQL 17.11. Database development tidak di-reset oleh runner. Layanan PostgreSQL bersama tidak dimulai ulang untuk pengujian; pemeriksaan restart dilakukan terhadap proses API dan sesi persistennya.

## Dependency dan konfigurasi

Kode bisnis dan pemuatan data dirapikan agar lebih mudah diikuti. Kondisi bertingkat memakai `if/else`, perhitungan memakai loop dengan variabel bernama jelas, dan body request ditulis dengan field eksplisit. Query database disusun bertahap; callback transaksi memakai nama `transaction`. Pemuatan resource frontend memakai `async/await` berurutan tanpa rangkaian `.then()` atau fungsi async yang langsung dipanggil.

Framework NestJS, Prisma, validasi DTO, sesi login, pemeriksaan akses, dan transaksi saldo tetap digunakan. Perapian ini mempertahankan kontrak API dan fitur yang sudah diuji.

Satu lockfile root mengunci dependency kedua workspace. Override `deepmerge-ts` dan `minimatch` menggunakan versi yang menutup advisory pada dependency tooling; generate/migration Prisma, lint, build, pengujian API, dan instalasi bersih tetap lulus dengan resolusi tersebut.

Port development adalah 5173 untuk frontend dan 3001 untuk API. Swagger tersedia pada `/api/docs` di environment non-production. Environment contoh berisi placeholder; secret sesi dibuat acak oleh `npm run setup:env`.

## Batas MVP

Saldo, pembayaran, dan refund tetap simulasi. Lampiran hanya metadata; tidak ada transfer berkas atau pembayaran sungguhan. Data localStorage lama tidak diimpor. API memakai pagination, sedangkan cache frontend mengumpulkan halaman resource yang diperlukan untuk mempertahankan filter UI yang ada; pengambilan incremental untuk dataset besar belum menjadi target MVP.

Deployment, OAuth, pemulihan password, chat, notifikasi email, dan payment gateway berada di luar cakupan PRD ini.

## Pembaruan 25 November 2026: JWT dan Midtrans Sandbox

- Kredensial login berubah dari sesi cookie ke JWT HS256 (cookie HttpOnly atau header Bearer). Sesi PostgreSQL kini hanya menyimpan token CSRF. Pencabutan memakai tabel `RevokedToken` dan klaim `ver` terhadap `sessionVersion`. Migration `202611250001_jwt_revocation`.
- Login tidak lagi membocorkan keberadaan email lewat waktu respons. Endpoint unggah gambar dibatasi frekuensinya. API menolak start bila `JWT_SECRET` kosong, pendek, placeholder, atau sama dengan `SESSION_SECRET`.
- Midtrans Sandbox: `callbacks.finish`, sinkron otomatis saat pembeli kembali, dan perbaikan status transaksi yang belum ada (Midtrans membalas HTTP 200 dengan `status_code: "404"`). Dibuktikan end to end ke sandbox sungguhan memakai Virtual Account BCA dan simulator Midtrans.
- Pengujian: 24 tes integrasi dan runner browser (settlement dan refund, 32 pemeriksaan responsif, 10 pemeriksaan layout login, 0 runtime error).
