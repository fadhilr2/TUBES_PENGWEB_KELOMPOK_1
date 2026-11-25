# SewaSkill Backend

REST API NestJS untuk akun, katalog jasa, paket, ulasan, pesanan, saldo simulasi, serta pengelolaan admin. Backend memakai PostgreSQL langsung tanpa Docker dan tidak menyediakan halaman aplikasi produk.

[Kembali ke panduan repository](../README.md) · [Panduan frontend](../frontend/README.md)

## Teknologi

- NestJS 11 dan TypeScript.
- Prisma 6 serta PostgreSQL; pengembangan lokal memakai PostgreSQL 17.
- Argon2id untuk hash password.
- JWT (`@nestjs/jwt`, HS256) sebagai kredensial login, dengan pencabutan token di PostgreSQL.
- `express-session` dan `connect-pg-simple` hanya menyimpan token CSRF.
- `csrf-sync`, pemeriksaan origin, Helmet, dan pembatasan percobaan autentikasi.
- Swagger pada environment non-production.

## Database lokal

Gunakan PostgreSQL yang sudah terpasang pada Windows atau WSL. Masuk ke `psql` sebagai administrator database.

Windows dengan `psql` pada PATH:

```powershell
psql -U postgres
```

WSL Debian:

```powershell
wsl -d Debian -- sudo service postgresql start
wsl -d Debian -- sudo -u postgres psql
```

Buat role dan database khusus proyek. Ganti password contoh sebelum menjalankan SQL.

```sql
CREATE ROLE sewaskill LOGIN PASSWORD 'replace-with-your-local-password';
CREATE DATABASE sewaskill OWNER sewaskill;
CREATE DATABASE sewaskill_test OWNER sewaskill;
```

Database `sewaskill` digunakan aplikasi. Database `sewaskill_test` hanya untuk pengujian dan fixture yang dapat dibersihkan runner.

## Environment dan instalasi

Jalankan dari root repository:

```bash
npm install
npm run setup:env
```

Helper membuat `backend/.env` dari [.env.example](.env.example) dan menghasilkan `SESSION_SECRET` dan `JWT_SECRET` acak. File yang sudah ada tidak ditimpa. Isi kedua connection string menggunakan kredensial PostgreSQL lokal:

```dotenv
DATABASE_URL=postgresql://sewaskill:replace-with-your-local-password@127.0.0.1:5432/sewaskill?schema=public
TEST_DATABASE_URL=postgresql://sewaskill:replace-with-your-local-password@127.0.0.1:5432/sewaskill_test?schema=public
```

Password dengan karakter khusus harus di-URL-encode pada connection string.

| Variabel             | Fungsi atau nilai default                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `NODE_ENV`           | `development`; seed demo ditolak pada `production`                                           |
| `PORT`               | Port API, default `3001`                                                                     |
| `DATABASE_URL`       | Koneksi database aplikasi                                                                    |
| `TEST_DATABASE_URL`  | Koneksi database test lokal `sewaskill_test`                                                 |
| `SESSION_SECRET`     | Secret acak minimal 32 karakter; placeholder ditolak                                         |
| `JWT_SECRET`         | Secret acak minimal 32 karakter, berbeda dari `SESSION_SECRET`; API menolak start bila lemah |
| `UPLOAD_LIMIT`       | Batas unggah gambar per IP per 15 menit, default 60                                          |
| `SESSION_DAYS`       | Umur JWT dan cookie, default 7 hari; rentang 1 sampai 30                                     |
| `FRONTEND_ORIGIN`    | Daftar origin frontend yang diizinkan, dipisahkan koma                                       |
| `AUTH_IP_LIMIT`      | Maksimum percobaan auth per IP dalam 15 menit, default 300                                   |
| `AUTH_ACCOUNT_LIMIT` | Maksimum percobaan auth per alamat email dalam 15 menit, default 30                          |

Environment backend tidak dikirim ke browser. `.env` diabaikan Git.

## Migration, seed, dan server

Dari root repository:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev:backend
```

Jika terminal sudah berada di `backend/`, jalankan `npm run db:generate`, `npm run db:migrate`, `npm run db:seed`, dan `npm run dev`.

Hentikan backend sebelum generate Prisma pada Windows agar file engine tidak terkunci. Migration menggunakan SQL yang dilacak Git. Server tidak menjalankan seed atau reset otomatis.

Seed mengambil fixture dari `prisma/fixtures/demo.json`, mempertahankan ID dan opening balance, serta meng-hash password. Database yang sudah berisi akun tidak ditimpa. Kredensial akun contoh tersedia pada [README global](../README.md#akun-development).

| Layanan    | Alamat default                                                             |
| ---------- | -------------------------------------------------------------------------- |
| Prefix API | `http://127.0.0.1:3001/api/v1`                                             |
| Readiness  | [http://127.0.0.1:3001/api/v1/health](http://127.0.0.1:3001/api/v1/health) |
| Swagger    | [http://127.0.0.1:3001/api/docs](http://127.0.0.1:3001/api/docs)           |

Server development bind ke `127.0.0.1`. Swagger hanya dibuat pada environment non-production.

## Struktur source

```text
prisma/
  schema.prisma           Database models
  migrations/             Versioned SQL and constraints
  fixtures/demo.json      Development fixture
  seed.ts                 Non-destructive seed
  reset.ts                Confirmed local development reset
src/
  auth/                   JWT issue/verify, login, and role guard
  users/                  Profiles and account management
  services/               Services, packages, favorites, and recent views
  reviews/                Review CRUD
  orders/                 Order state changes and balance transactions
  dashboard/              Provider statistics
  admin/                  Moderation, summaries, and audit queries
  common/                 DTOs, serializers, security, and response handling
  database/               Prisma client and transaction retries
  health/                 Database readiness
  app.module.ts           Controller and service registration
  main.ts                 Application startup and middleware
test/
  api.test.ts             API, authorization, and concurrency tests
```

Controller membaca route, body, dan pengguna aktif. DTO memvalidasi input sebelum service memproses aturan bisnis. Service membaca atau mengubah data melalui Prisma. Query dan perhitungan ditulis dengan kondisi serta loop yang eksplisit.

## Autentikasi dan akses

Login memakai JWT. Token ditandatangani HS256 dengan `JWT_SECRET`, berisi hanya `sub`, `ver`, `jti`, `iss`, `aud`, `iat`, dan `exp`. Role, email, dan saldo tidak ada di token; guard membacanya dari database pada setiap request.

| Lapisan                | Cara kerja                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| Penyimpanan token      | Cookie `sewaskill.token` (HttpOnly, SameSite=Lax, Secure di production) atau header Bearer      |
| Verifikasi             | Algoritma dikunci HS256 (`none` dan HS512 ditolak), `iss`, `aud`, dan `exp` diperiksa           |
| Pencabutan saat logout | `jti` disimpan di tabel `RevokedToken`; token yang dicuri tidak berlaku lagi setelah logout     |
| Pencabutan saat blokir | Klaim `ver` dibandingkan dengan `sessionVersion` akun, naik saat blokir, ganti role, atau hapus |
| CSRF                   | Cookie tetap wajib X-CSRF-Token; header Bearer tidak melewati CSRF bila cookie ada              |
| Enumerasi email        | Email tidak dikenal tetap menjalankan verifikasi hash agar waktu responsnya sama                |

### Klien browser (cookie)

1. Panggil `GET /auth/csrf` menggunakan cookie jar.
2. Ambil `data.token` dan kirim melalui header `X-CSRF-Token` pada mutasi.
3. Panggil `POST /auth/login` dengan `email`, `password`, serta header `Origin` yang diizinkan.
4. Pertahankan cookie `sewaskill.token`. Login merotasi sesi CSRF; ambil token CSRF baru setelah login.
5. Gunakan `GET /auth/me` untuk membaca akun aktif.

### Klien lain, misalnya mobile (Bearer)

1. Panggil `GET /auth/csrf` dan `POST /auth/login` seperti di atas, dengan tambahan header `X-Auth-Mode: bearer`.
2. Balasan login berisi `data.token`. Tanpa header itu, token tidak pernah muncul di JSON.
3. Kirim `Authorization: Bearer <token>` pada request berikutnya. Request tanpa cookie ini tidak memerlukan `X-CSRF-Token`.
4. `POST /auth/logout` mencabut token.

Seluruh path memakai prefix `/api/v1`. Frontend menjalankan alur cookie melalui API client. Untuk Swagger, gunakan **Authorize** dengan token Bearer, atau panggil endpoint CSRF lalu masukkan token CSRF.

Password disimpan sebagai hash Argon2id. Guard memeriksa status akun, role terkini, dan versi sesi. Endpoint resource juga memeriksa pemiliknya. Unggahan gambar dibatasi frekuensinya, dibaca ulang oleh `sharp`, dan disimpan sebagai WebP dengan nama acak.

Register hanya membuat akun `pencari`. Akun admin berasal dari seed development; form manajemen tidak dapat membuat, mengubah, atau menghapus admin.

## Kelompok endpoint

| Prefix                | Fungsi                                                                          |
| --------------------- | ------------------------------------------------------------------------------- |
| `/auth`               | CSRF, register, login, logout, dan akun aktif                                   |
| `/catalog/meta`       | Kategori dan lokasi yang tersedia                                               |
| `/services`           | Katalog, detail, CRUD jasa, paket, dan ulasan per jasa                          |
| `/reviews/:id`        | Perubahan dan penghapusan ulasan milik sendiri                                  |
| `/users/me`           | Profil, konversi penyedia, jasa sendiri, favorit, recent, dan hapus akun        |
| `/orders`             | Pesanan sendiri, pembayaran simulasi, pembatalan, hasil, keputusan, dan riwayat |
| `/dashboard/provider` | Agregat pesanan, pendapatan, serta rating penyedia                              |
| `/admin`              | Ringkasan, keputusan pesanan, akun, moderasi jasa, dan log                      |
| `/health`             | Readiness layanan dan database                                                  |

Daftar method, body, dan akses setiap endpoint tersedia pada [PRD](../docs/PRD.md#7-kontrak-rest-api) serta Swagger.

Respons resource tunggal dibungkus `data`. Daftar menggunakan `data` dan `meta` berisi `page`, `pageSize`, serta `total`. Default `pageSize` adalah 20 dan maksimum 100. Respons delete tanpa body memakai HTTP 204.

Error berisi `error.code`, `error.message`, `error.fields`, dan `requestId`. Input salah menghasilkan 400, belum login 401, akses/CSRF ditolak 403, resource tidak tersedia 404, konflik data/status/saldo 409, dan rate limit 429.

## Aturan transaksi

- Harga dan biaya layanan 5% diambil serta dihitung server.
- Pesanan menyimpan snapshot nama jasa, nama paket, dan nominal.
- Pembayaran berhasil mendebit total pembeli; pembayaran gagal tidak mengubah saldo.
- Pembeli menerima hasil atau mengajukan komplain sebelum keputusan admin.
- Persetujuan admin mengkreditkan harga jasa ke penyedia; refund mengembalikan total ke pembeli.
- Status, saldo, ledger, dan audit ditulis dalam transaksi serializable dengan retry konflik.
- Request berulang atau paralel tidak boleh memproses saldo dua kali.
- Akun/jasa dengan pesanan aktif tidak dapat dihapus. Penghapusan riwayat hanya menyembunyikannya dari pembeli.

Schema mencakup akun, sesi, jasa, paket, pesanan, ulasan, favorit, recent, log, dan ledger saldo. Constraint database menjaga email unique, rating, nominal, durasi, serta nama paket aktif.

## Perintah

| Dari root repository       | Dari folder `backend/` | Fungsi                                |
| -------------------------- | ---------------------- | ------------------------------------- |
| `npm run dev:backend`      | `npm run dev`          | Build awal dan watch source/server    |
| `npm run build -w backend` | `npm run build`        | Compile TypeScript ke `backend/dist/` |
| `npm run start -w backend` | `npm run start`        | Jalankan hasil build                  |
| `npm run lint -w backend`  | `npm run lint`         | Pemeriksaan TypeScript tanpa emit     |
| `npm run db:generate`      | `npm run db:generate`  | Generate Prisma Client                |
| `npm run db:migrate`       | `npm run db:migrate`   | Terapkan migration                    |
| `npm run db:seed`          | `npm run db:seed`      | Isi fixture development               |
| `npm run test:backend`     | `npm run test`         | Build dan pengujian API               |

## Pengujian

```bash
npm run test:backend
```

Jalankan dari root. Runner memverifikasi target database lokal `sewaskill_test`, menerapkan migration, membersihkan fixture test, dan memulai API pada port sementara. Database development tidak di-reset.

Pengujian mencakup proyeksi publik, autentikasi, CSRF/origin, akses role, ownership, CRUD, nominal pesanan, saldo, request paralel, refund, recent, serta persistensi sesi setelah restart API. Jangan menjalankan runner bersamaan dengan pengujian browser karena keduanya menggunakan database test yang sama.

Pengujian integrasi (24 tes) mencakup pemeriksaan JWT: flag cookie, klaim minimal, token palsu (alg none, HS512, secret lain, kedaluwarsa, audience/issuer salah), pencabutan saat logout, mode Bearer, serta startup yang menolak `JWT_SECRET` lemah.

## Midtrans Sandbox

Pembayaran memakai Midtrans Snap mode uji. Tidak ada uang sungguhan. Jangan mengisi kunci produksi.

1. Masuk ke https://dashboard.sandbox.midtrans.com, pastikan environment **Sandbox**, lalu buka **Settings > Access Keys**.
2. Salin **Server Key** (awalan `SB-Mid-server-`) ke `backend/.env`. Kunci ini rahasia dan file `.env` sudah diabaikan Git.
3. Pastikan `MIDTRANS_IS_PRODUCTION=false`. Isi `PAYMENT_DEMO_ENABLED=false` bila pembayaran saldo demo tidak ingin ditampilkan.
4. Mulai ulang API. `GET /api/v1/payments/config` harus menampilkan `"midtransEnabled": true`.

| Variabel                 | Nilai sandbox           | Fungsi                                                |
| ------------------------ | ----------------------- | ----------------------------------------------------- |
| `MIDTRANS_SERVER_KEY`    | `SB-Mid-server-...`     | Autentikasi ke Snap dan Status API                    |
| `MIDTRANS_IS_PRODUCTION` | `false`                 | Memilih host `app.sandbox.midtrans.com`               |
| `PAYMENT_DEMO_ENABLED`   | `true` atau `false`     | Menampilkan atau menyembunyikan pembayaran saldo demo |
| `FRONTEND_ORIGIN`        | `http://localhost:5173` | Tujuan kembali setelah bayar (callback `finish`)      |

Alur: pembeli menekan **Bayar dengan Midtrans**, backend membuat transaksi Snap lalu mengembalikan `redirectUrl`, browser pindah ke halaman Midtrans, dan setelah selesai kembali ke `/pembayaran/:id`. Halaman itu otomatis memanggil `sync` yang bertanya ke Status API Midtrans, jadi status tidak bergantung pada notifikasi masuk.

| Endpoint                               | Akses   | Fungsi                                               |
| -------------------------------------- | ------- | ---------------------------------------------------- |
| `GET /payments/config`                 | Publik  | Metode pembayaran yang aktif                         |
| `POST /payments/orders/:id/checkout`   | Pencari | Membuat transaksi Snap, mengembalikan `redirectUrl`  |
| `POST /payments/orders/:id/sync`       | Pencari | Mengecek status ke Midtrans dan melunasi pesanan     |
| `POST /payments/midtrans/notification` | Publik  | Webhook Midtrans, wajib signature SHA-512 yang valid |

Keamanan: nominal dan mata uang dari Midtrans dicocokkan dengan pesanan, `redirect_url` harus berada di host Midtrans, notifikasi ulang tidak menggandakan saldo, dan status hanya berubah lewat transaksi database.

Notifikasi dari Midtrans ke `localhost` tidak bisa masuk. Untuk mencobanya, buka tunnel (misalnya `cloudflared tunnel --url http://localhost:3001`) lalu isi **Settings > Configuration > Payment Notification URL** di dashboard sandbox dengan `<url-tunnel>/api/v1/payments/midtrans/notification`. Tanpa itu, tombol **Cek status pembayaran** tetap berfungsi.

Pembayaran uji: pilih metode di halaman Midtrans, lalu gunakan simulator di https://simulator.sandbox.midtrans.com (kartu uji `4811 1111 1111 1114`, CVV `123`, OTP `112233`).

## Reset development

```bash
npm run db:reset
```

Perintah root ini menghapus data demo pada target lokal dan menjalankan seed kembali. Reset memerlukan `NODE_ENV=development`, nama database yang diizinkan, dan konfirmasi `RESET sewaskill` atau `RESET sewaskill_test` sesuai target. Tidak ada endpoint reset publik.

## Batas fitur

API hanya terhubung ke Midtrans mode sandbox. Transfer uang sungguhan, chat, OAuth, dan layanan email tidak tersedia. Saldo tetap simulasi; lampiran hanya metadata. Pengujian frontend dan catatan hasil tersedia pada [README frontend](../frontend/README.md) dan [catatan implementasi](../docs/IMPLEMENTATION.md).
