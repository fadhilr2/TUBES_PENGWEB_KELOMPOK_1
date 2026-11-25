# PRD SewaSkill: Frontend dan Backend API NestJS

Tanggal: 12 November 2026  
Status: Implementasi selesai dan diverifikasi; lihat `docs/IMPLEMENTATION.md` untuk hasil pemeriksaan.  
Target: MVP tugas besar dengan data bersama di server dan pembayaran simulasi

## 1. Tujuan dan batas pekerjaan

Ubah repository React yang sekarang berada di root menjadi satu repository dengan `frontend/` dan `backend/`. Backend menggunakan NestJS khusus REST API. Frontend tetap React + Vite dengan tampilan Bootstrap dan CSS custom yang sudah ada.

Dokumen ini menjadi spesifikasi implementasi yang telah disetujui. Koreksi pengguna: PostgreSQL dijalankan langsung tanpa Docker. Seluruh pekerjaan dilakukan tanpa commit.

Hasil implementasi yang dituju:

1. Satu repository Git, dengan `.git/` tetap di root dan dua aplikasi dalam folder terpisah.
2. Seluruh fitur frontend saat ini mempunyai sumber data dan validasi di API.
3. Data tersimpan setelah backend dimulai ulang dan dapat dipakai beberapa browser.
4. Struktur respons tetap dekat dengan data frontend, tanpa mengirim password atau data akun lain secara berlebihan.
5. Alur lokal dapat dijalankan dari petunjuk README dan perintah npm yang jelas.

### 1.1 Keputusan yang sudah berasal dari permintaan

| Keputusan            | Ketentuan                                                                               |
| -------------------- | --------------------------------------------------------------------------------------- |
| Repository           | Tetap satu repository Git                                                               |
| Frontend             | Pindahkan aplikasi sekarang ke `frontend/`                                              |
| Backend              | Buat aplikasi NestJS di `backend/`                                                      |
| Bentuk backend       | REST API; tanpa halaman aplikasi atau template HTML                                     |
| Acuan fitur dan data | Implementasi frontend yang ada, khususnya `src/state/store.js` dan `src/data/demo.json` |
| Urutan pengerjaan    | PRD terlebih dahulu, kemudian implementasi                                              |

### 1.2 Usulan teknis dalam draft

Persetujuan eksekusi menggunakan PostgreSQL + Prisma untuk relasi, migration, dan transaksi, serta sesi server dengan cookie. PostgreSQL lokal diakses langsung tanpa Docker.

### 1.3 Di luar cakupan MVP

- Migrasi Tailwind atau perombakan tampilan.
- Payment gateway, pembayaran bank sungguhan, penarikan dana, dan escrow uang sungguhan.
- Chat, WebSocket, notifikasi email, OAuth, verifikasi email, dan pemulihan password.
- Unggahan berkas sungguhan; lampiran masih berupa metadata dan hasil pekerjaan berupa teks/link.
- Microservices, Redis, message broker, aplikasi mobile, dan deployment ke server.
- Impor otomatis localStorage pengguna ke database bersama.

## 2. Kondisi frontend yang diverifikasi

| Sumber saat ini                | Temuan                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `package.json`, `src/main.jsx` | React, Vite, React Router, Bootstrap; belum ada backend                          |
| `src/state/store.js`           | Penyimpanan, autentikasi demo, aturan peran, CRUD, pesanan, saldo, dan audit log |
| `src/state/validators.js`      | Kategori, validasi nominal, password, URL, dan status akhir                      |
| `src/state/DemoProvider.jsx`   | Menyediakan seluruh state browser melalui React Context                          |
| `src/data/demo.json`           | 7 akun, 6 jasa, 13 paket, 7 pesanan, 12 ulasan, dan 1 log                        |
| `src/App.jsx`                  | Route publik, anggota, penyedia, dan admin                                       |
| `src/components/Footer.jsx`    | Reset seluruh data lokal melalui tombol publik                                   |

State menggunakan key localStorage `sewaskill-data-v2`. Seed memiliki `version`, `currentUserId`, `users`, `services`, `orders`, `reviews`, `favorites`, `recent`, dan `logs`. Pemeriksaan awal tidak menemukan relasi seed yang hilang, ulasan ganda per akun/jasa, atau ketidaksesuaian biaya pesanan.

Beberapa perilaku lokal tidak boleh disalin langsung menjadi kontrak server:

- Password plaintext di seed harus diganti hash di database dan dikeluarkan dari build frontend.
- `currentUserId` bukan identitas yang boleh ditentukan oleh request frontend.
- Browser tidak boleh menerima seluruh database lewat endpoint state global.
- Tombol reset publik tidak boleh menghapus database bersama.
- Saldo, harga, role, pemilik, dan status pesanan harus ditentukan atau divalidasi server.

## 3. Struktur repository dan cara menjalankan

```text
TUBES_PENGWEB_KELOMPOK_1/
  .git/
  .gitignore
  README.md
  package.json
  package-lock.json
  docs/
    PRD.md
  frontend/
    package.json
    index.html
    vite.config.js
    eslint.config.js
    .env.example
    public/
    src/
  backend/
    package.json
    tsconfig.json
    .env.example
    prisma/
      schema.prisma
      migrations/
      seed.ts
      fixtures/
    src/
      main.ts
      app.module.ts
      common/
      database/
      auth/
      users/
      services/
      reviews/
      orders/
      dashboard/
      admin/
      health/
    test/
```

PostgreSQL dijalankan langsung tanpa Docker. Gunakan instalasi PostgreSQL lokal dan koneksi `DATABASE_URL`.

### 3.1 Aturan pemindahan Git

- Pertahankan `.git/`, README utama, `.gitignore`, dan `docs/` di root.
- Pindahkan source, aset publik, HTML entry, dan konfigurasi frontend secara eksplisit. Jangan memindahkan seluruh isi root secara rekursif.
- Pertahankan perubahan kerja yang sudah ada, termasuk perapian `.field` dan penghapusan teks bantuan password di `AuthPage.jsx`.
- Jangan menjalankan `git init` di `frontend/` atau `backend/`. Jika generator membuat Git internal, cegah sejak scaffolding.
- Gunakan npm workspaces dengan satu lockfile root. Lockfile frontend lama dikonsolidasikan melalui instalasi workspace; hindari dua sumber resolusi dependensi.
- `node_modules`, `dist`, coverage, `.env`, database volume, dan artefak pengujian tidak dilacak Git. `.env.example` boleh dilacak tanpa rahasia.
- Periksa perubahan menggunakan diff yang mendeteksi rename. Dilarang membuang perubahan pengguna dengan reset atau restore massal.

### 3.2 Kontrak perintah lokal yang dituju

| Perintah dari root     | Hasil                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| `npm install`          | Instal dependensi kedua workspace                                 |
| `npm run dev:frontend` | Jalankan Vite pada port 5173                                      |
| `npm run dev:backend`  | Jalankan NestJS dalam mode watch; port default 3001, dapat diubah |
| `npm run db:migrate`   | Terapkan migration database development                           |
| `npm run db:seed`      | Isi fixture development secara eksplisit                          |
| `npm run lint`         | Periksa kedua workspace                                           |
| `npm run build`        | Build frontend dan backend                                        |
| `npm run test:backend` | Jalankan pengujian aturan domain dan integrasi API                |
| `npm run format:check` | Periksa format source dan dokumentasi                             |

Perintah di atas disediakan pada root workspace. Node.js 22.12+ menjadi baseline awal; versi dependency dikunci melalui lockfile root. Periksa port sebelum menjalankan server agar tidak mengganggu aplikasi lokal lain.

### 3.3 Konfigurasi

Frontend menggunakan `VITE_API_BASE_URL=/api/v1`. Proxy Vite meneruskan `/api` ke backend. Aset `/assets/...` tetap dilayani frontend sehingga path gambar yang ada tidak berubah.

Backend membutuhkan `DATABASE_URL`, `PORT`, `FRONTEND_ORIGIN`, `NODE_ENV`, dan konfigurasi sesi melalui environment. Nilai rahasia hanya berada di environment backend. Production menggunakan satu origin melalui reverse proxy untuk frontend dan `/api`; deployment tidak termasuk pekerjaan MVP.

## 4. Peran dan kebutuhan pengguna

| Peran      | Kemampuan                                                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Tamu       | Membaca katalog, detail jasa, profil publik penyedia, dan ulasan; daftar dan login                                                              |
| `pencari`  | Mengelola profil, favorit, riwayat terakhir dilihat, membuat pesanan, membayar simulasi, meninjau hasil, menulis ulasan, dan mendaftar penyedia |
| `penyedia` | Mengelola jasa sendiri, menerima pesanan, mengirim hasil, membaca dashboard, serta mengelola favorit dan profil                                 |
| `admin`    | Membaca ringkasan, mengelola akun non-admin, memoderasi jasa, memutus pesanan, dan membaca log                                                  |

Pertahankan batas role dalam store: pembuatan pesanan baru dan penulisan ulasan hanya untuk `pencari`. Setelah berubah menjadi `penyedia`, pengguna tetap dapat menyelesaikan pesanan pembelian lamanya berdasarkan kepemilikan. Role tidak menjadi pengganti pemeriksaan pemilik resource.

User story utama:

- Sebagai pencari, saya dapat membuat pesanan dengan harga paket dari server agar total pembayaran tidak berubah karena manipulasi browser.
- Sebagai penyedia, saya dapat memperbarui paket tanpa mengubah harga dan judul pesanan lama.
- Sebagai admin, saya dapat menyetujui atau refund sekali saja, termasuk ketika dua request datang bersamaan.
- Sebagai anggota, saya dapat membuka akun di browser lain dan menemukan data yang sama setelah login.

## 5. Model data dan kompatibilitas

Nama properti JSON memakai camelCase seperti frontend. ID tetap string opaque: ID fixture seperti `t1`, `buyer`, dan `DEMO-1001` dipertahankan; ID baru dibuat server. Jangan mensyaratkan seluruh ID berbentuk UUID karena seed saat ini menggunakan beberapa bentuk ID.

Tanggal waktu dikirim sebagai ISO 8601 UTC. `deadline` adalah tanggal kalender `YYYY-MM-DD`, bukan timestamp. Nominal rupiah adalah bilangan bulat, bukan float.

| Entitas          | Properti utama dan ketentuan                                                                                                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`           | `id`, `name`, `email`, `passwordHash`, `role`, `status`, `location`, `balance`, `avatar`, `skills`, `experience`, `createdAt`, `updatedAt`, `deletedAt`. Email dinormalisasi lowercase dan unique. `passwordHash` tidak pernah masuk respons. |
| `Session`        | Sesi server terkait `userId`, expiry, dan revocation. Identitas tidak dibaca dari localStorage. Gunakan middleware sesi dan penyimpanan PostgreSQL yang terawat.                                                                              |
| `Service`        | `id`, `ownerId`, `title`, `category`, `description`, `days`, `portfolioUrl`, `image`, `hidden`, timestamps, dan `deletedAt`. `location` pada respons diambil dari profil pemilik agar selalu sinkron.                                         |
| `ServicePackage` | `id`, `serviceId`, `name`, `description`, `price`, urutan tampilan, dan penanda nonaktif bila sudah direferensikan pesanan. Respons jasa tetap memakai array `packages`.                                                                      |
| `Order`          | Seluruh field pesanan frontend, termasuk snapshot nama jasa/paket, nominal, kontak pembeli, metadata lampiran, hasil, komplain, keputusan, status, dan timestamps transisi.                                                                   |
| `Review`         | `id`, `serviceId`, `userId`, `rating`, `comment`, timestamps. Unique pasangan `serviceId` + `userId`.                                                                                                                                         |
| `Favorite`       | Pasangan unique `userId` + `serviceId`. Serializer dapat menghasilkan array ID untuk adapter frontend.                                                                                                                                        |
| `RecentView`     | Pasangan unique `userId` + `serviceId`, `viewedAt`. Hanya 12 jasa terakhir per pengguna; melihat ulang memindahkan jasa ke posisi teratas.                                                                                                    |
| `ActivityLog`    | `id`, `actorId` nullable, `action`, `details`, `createdAt`. Hanya admin dapat membaca. Tidak menyalin pembatasan penghapusan otomatis 500 log dari browser.                                                                                   |
| `BalanceEntry`   | `id`, `userId`, `orderId` nullable, `kind`, nominal perubahan bertanda, `createdAt`, serta kunci operasi unik untuk mencegah saldo diproses dua kali.                                                                                         |

### 5.1 Field pesanan

Pertahankan `buyerId`, `sellerId`, `serviceId`, `serviceTitle`, `packageId`, `packageName`, `price`, `fee`, `total`, `status`, `brief`, `deadline`, `paymentMethod`, `buyerName`, `email`, `whatsapp`, `attachments`, `resultUrl`, `complaint`, `decision`, `hiddenForBuyer`, dan `createdAt`.

Field waktu opsional mencakup `paymentAttemptAt`, `paidAt`, `deliveredAt`, `reviewedByBuyerAt`, `closedAt`, serta `paymentResult` dan `adminId`. Bedakan field kosong dan nullable dalam DTO; adapter mengubah null menjadi string kosong hanya ketika komponen lama membutuhkannya.

`attachments` berisi `{ name, size }`. Field ini tidak menyatakan bahwa file sudah diunggah. Server tidak menerima path lokal pengguna sebagai bukti unggahan.

### 5.2 Enum dan aturan integritas

- Role: `pencari`, `penyedia`, `admin`.
- Status akun: `aktif`, `diblokir`.
- Kategori: `desain`, `koding`, `video`, `konten`, `foto`.
- Status pesanan: `menunggu_pembayaran`, `dibayar`, `dikirim`, `menunggu_admin`, `selesai`, `direfund`, `dibatalkan`.
- Keputusan pembeli: kosong, `diterima`, atau `komplain`.
- Hasil pembayaran: kosong, `berhasil`, atau `gagal`.
- Metode pembayaran simulasi: `bca`, `mandiri`, `gopay`, `ovo`, `dana`.
- Harga paket: integer 1 sampai 1.000.000.000. Nilai saldo awal atau edit admin mengikuti batas 0 sampai 1.000.000.000 dari validator lama; hasil kredit tetap harus aman sebagai integer.
- Penyimpanan saldo dan agregat memakai tipe database yang tidak mudah overflow; serializer hanya mengeluarkan angka yang aman untuk JavaScript.

### 5.3 Penghapusan dan snapshot

Penghapusan akun atau jasa ditolak jika masih ada pesanan nonfinal. Gunakan soft delete untuk mempertahankan relasi transaksi lama. Profil dan jasa yang dihapus tidak dapat login atau muncul di katalog. Email akun yang dihapus tetap dicadangkan pada MVP agar aturan unique sederhana dan tidak ambigu.

Ulasan jasa yang dihapus tidak tampil. Favorit dan recent tidak mengembalikan jasa terhapus. Nama tampilan akun terhapus dapat menjadi `Akun dihapus` pada tampilan publik. Snapshot judul, paket, harga, dan kontak pesanan tidak berubah ketika source diedit. Data transaksi hanya dapat dibaca pihak pesanan dan admin.

## 6. Kebutuhan fungsional

### 6.1 Autentikasi dan profil

- Register selalu menghasilkan `pencari` aktif dengan saldo demo 500.000. Request tidak boleh menentukan role, status, atau saldo.
- Nama dan lokasi minimal 2 karakter; email valid dan unique; password minimal 6 karakter mengikuti kontrak demo saat ini. Teks bantuan password yang baru dihapus tidak ditambahkan kembali.
- Password disimpan memakai hash password terawat, dengan Argon2id sebagai pilihan awal. Password dan cookie tidak masuk log aplikasi.
- Login membuat sesi server dan merotasi ID sesi. Logout membatalkan sesi. Status akun dan role terkini diperiksa pada request yang membutuhkan akses.
- Cookie sesi menggunakan `HttpOnly`, `SameSite=Lax`, dan `Secure` pada HTTPS. Sesi memiliki expiry server yang didokumentasikan, dengan usulan awal 7 hari tanpa remember-me.
- Request mutasi, termasuk login/register/logout, memakai proteksi CSRF dan pemeriksaan origin. Middleware sesi PostgreSQL tidak boleh diganti memory store pada penggunaan bersama.
- Profil dapat mengubah nama dan lokasi. Perubahan lokasi langsung tercermin pada semua jasa milik pengguna.
- Pencari dapat menjadi penyedia dengan `skills` dan `experience`; role baru ditetapkan server.
- Penghapusan akun sendiri memerlukan konfirmasi; backend tetap memeriksa pesanan aktif dan melarang penghapusan admin.

### 6.2 Katalog, jasa, favorit, dan recent

- Katalog hanya menampilkan jasa yang tidak tersembunyi atau terhapus, dengan pemilik aktif yang masih berperan penyedia.
- Pencarian mencakup judul, deskripsi, nama penyedia, dan lokasi. Filter kategori, lokasi, harga minimum/maksimum, serta urutan rating/harga mengikuti frontend.
- Harga filter dan urutan memakai harga paket termurah. Rating dihitung dari ulasan yang berlaku; jasa tanpa ulasan bernilai agregat 0. Gunakan tie-break ID agar pagination stabil.
- Penyedia mengelola jasa sendiri. Jasa memiliki minimal satu paket, nama paket unik tanpa membedakan huruf besar/kecil, ID paket unik, dan durasi 1 sampai 365 hari.
- Judul minimal 3 karakter dan deskripsi minimal 10. Portofolio menerima HTTP/HTTPS; gambar dapat memakai HTTP/HTTPS atau path aset internal yang aman.
- Frontend tidak boleh menentukan `ownerId` atau lokasi jasa. Update paket tidak boleh mengambil ID paket milik jasa lain.
- Hapus jasa ditolak selama masih dipakai pesanan aktif. Admin dapat menyembunyikan/menampilkan jasa tanpa mengganti pemiliknya.
- Favorit menggunakan operasi tambah/hapus yang idempotent. Recent hanya untuk anggota dan maksimal 12 jasa.

### 6.3 Ulasan

- Pencari dapat membuat, mengedit, dan menghapus ulasan sendiri untuk jasa yang tersedia.
- Rating integer 1 sampai 5, komentar wajib, dan satu ulasan per akun per jasa.
- Tidak boleh mengulas jasa sendiri atau mengubah ulasan pengguna lain.
- MVP mempertahankan perilaku saat ini: ulasan tidak mensyaratkan pesanan selesai. Label pembelian terverifikasi tidak ditambahkan tanpa fitur verifikasi tersendiri.

### 6.4 Pesanan dan saldo simulasi

- Pencari membuat pesanan dari jasa dan paket yang tersedia, dengan brief minimal 5 karakter.
- Server menentukan pembeli, penyedia, snapshot paket, dan nominal. `fee = Math.round(price * 0.05)` dan `total = price + fee`.
- Deadline opsional harus berupa tanggal valid, tidak lebih awal dari tanggal pembuatan menurut Asia/Jakarta. Tidak ada default deadline baru yang mengubah perilaku form.
- Metode pembayaran wajib masuk enum. Kontak pembeli divalidasi; metadata lampiran dibatasi ukuran request, nama, jumlah, dan bilangan byte nonnegatif. Batas per metadata file mengikuti form saat ini, 500 MiB; body JSON tetap dibatasi karena tidak berisi byte file.
- Pembayaran simulasi gagal mencatat percobaan dan membiarkan status menunggu pembayaran. Pembayaran berhasil mengurangi saldo pembeli satu kali.
- Saldo tidak cukup menolak transaksi tanpa perubahan sebagian. Penyedia harus masih tersedia pada saat pembayaran.
- Penyedia pemilik pesanan mengirim hasil berupa teks atau link HTTP/HTTPS. Skema URL lain ditolak.
- Pembeli menerima hasil atau mengirim komplain dengan alasan minimal 3 karakter; keduanya masuk antrian admin.
- Persetujuan admin mengkreditkan `price` ke penyedia. Refund mengembalikan `total` kepada pembeli. Biaya layanan hanya tersisa pada transaksi yang selesai, sebagai bagian simulasi.
- Status, saldo, balance entry, dan audit log ditulis dalam satu transaksi. Pakai penguncian/conditional update dan constraint unik, bukan pola baca lalu tulis tanpa perlindungan konkurensi.
- Penghapusan riwayat hanya menyembunyikan pesanan final untuk pembeli melalui `hiddenForBuyer`; data tetap tersedia untuk penyedia dan admin.
- Pemblokiran akun menghentikan akses akun tersebut. Pesanan tetap tersimpan; admin dapat menyelesaikan kasus yang sudah masuk `menunggu_admin`. Pesanan lebih awal yang terhambat dapat dilanjutkan setelah akun diaktifkan kembali; tidak ada settlement paksa baru pada MVP.

### 6.5 Transisi pesanan

| Status awal           | Operasi              | Pelaku           | Status akhir     | Efek saldo              |
| --------------------- | -------------------- | ---------------- | ---------------- | ----------------------- |
| `menunggu_pembayaran` | Simulasi gagal       | Pembeli pemilik  | Tetap            | Tidak ada               |
| `menunggu_pembayaran` | Simulasi berhasil    | Pembeli pemilik  | `dibayar`        | Pembeli dikurangi total |
| `menunggu_pembayaran` | Batal                | Pembeli pemilik  | `dibatalkan`     | Tidak ada               |
| `dibayar`             | Kirim hasil          | Penyedia pemilik | `dikirim`        | Tidak ada               |
| `dikirim`             | Terima atau komplain | Pembeli pemilik  | `menunggu_admin` | Tidak ada               |
| `menunggu_admin`      | Setujui              | Admin            | `selesai`        | Penyedia ditambah harga |
| `menunggu_admin`      | Refund               | Admin            | `direfund`       | Pembeli ditambah total  |

Status final tidak dapat dibuka kembali. Transisi di luar tabel ditolak. Request paralel atau pengulangan tidak boleh mendebit, mengkredit, atau me-refund dua kali.

### 6.6 Dashboard dan admin

- Dashboard penyedia menghitung pesanan jasa sendiri, pendapatan dari status `selesai`, distribusi rating, dan lima ulasan terbaru. Saldo dan hasil agregasi dihitung server.
- Pertahankan hitungan pembelian frontend yang mengabaikan `menunggu_pembayaran` dan `dibatalkan`; pisahkan angka selesai/refund agar maknanya jelas.
- Admin mendapat ringkasan, daftar pesanan, keputusan antrian, daftar akun, daftar jasa, dan log dengan filter serta pagination.
- Admin dapat membuat/mengedit akun `pencari` atau `penyedia`, memblokir/mengaktifkan, mengubah saldo demo, dan menghapus sesuai penjagaan pesanan aktif.
- Edit saldo admin menghasilkan balance entry penyesuaian dan log. Perubahan role pada akun dengan pesanan aktif ditolak.
- Admin tidak dapat membuat admin baru, mengubah akun admin lain melalui form manajemen, atau menghapus akun admin.
- Role admin awal hanya berasal dari seed development atau prosedur operator terpisah yang terdokumentasi.

## 7. Kontrak REST API

Prefix seluruh endpoint: `/api/v1`. Swagger berada di `/api/docs`, hanya aktif pada development atau diakses dengan pembatasan yang jelas. Dokumentasi API bukan halaman produk backend.

### 7.1 Format respons dan query

- Resource tunggal: `{ "data": { ... } }`.
- Daftar: `{ "data": [], "meta": { "page": 1, "pageSize": 20, "total": 0 } }`.
- Error: `{ "error": { "code": "ORDER_STATE_CONFLICT", "message": "Pesanan sudah diproses.", "fields": {} }, "requestId": "..." }`.
- Error validasi memakai `400`; belum login `401`; role/CSRF `403`; resource tidak ditemukan atau milik orang lain `404`; benturan email/status/saldo `409`; rate limit `429`.
- Create memakai `201`, read/update/action `200`, delete tanpa body `204`. Respons `204` tidak dibungkus `data`.
- Query daftar memakai `page`, `pageSize` default 20 dan maksimum 100. Katalog menerima `q`, `category`, `location`, `minPrice`, `maxPrice`, dan `sort=rating|harga-asc|harga-desc`.
- Query dan body divalidasi eksplisit. Field tak dikenal ditolak untuk mencegah mass assignment; angka, boolean, dan tanggal tidak dikonversi secara longgar.

### 7.2 Endpoint publik dan anggota

| Method dan path                         | Akses            | Fungsi atau body utama                                              |
| --------------------------------------- | ---------------- | ------------------------------------------------------------------- |
| `GET /health`                           | Publik           | Status layanan; readiness database tanpa membocorkan konfigurasi    |
| `GET /auth/csrf`                        | Publik           | Inisialisasi sesi/token CSRF                                        |
| `POST /auth/register`                   | Publik + CSRF    | `name`, `email`, `password`, `location`                             |
| `POST /auth/login`                      | Publik + CSRF    | `email`, `password`                                                 |
| `POST /auth/logout`                     | Login + CSRF     | Batalkan sesi                                                       |
| `GET /auth/me`                          | Login            | Profil privat pengguna aktif                                        |
| `PATCH /users/me`                       | Login            | `name`, `location`                                                  |
| `POST /users/me/provider`               | Pencari          | `skills`, `experience`, `location` opsional                         |
| `DELETE /users/me`                      | Anggota          | Konfirmasi `HAPUS`, pemeriksaan pesanan aktif                       |
| `GET /catalog/meta`                     | Publik           | Kategori dan pilihan lokasi jasa tersedia                           |
| `GET /services`                         | Publik           | Katalog terfilter dan paginated, ringkasan provider/rating/paket    |
| `GET /services/:id`                     | Publik           | Detail jasa tersedia beserta profil publik pemilik                  |
| `GET /services/:id/reviews`             | Publik           | Ulasan paginated dengan profil reviewer terbatas                    |
| `GET /users/me/services`                | Penyedia         | Jasa sendiri, termasuk tersembunyi                                  |
| `GET /users/me/services/:id`            | Penyedia pemilik | Detail untuk edit jasa sendiri, termasuk yang tersembunyi           |
| `POST /services`                        | Penyedia         | Data jasa dan `packages`                                            |
| `PATCH /services/:id`                   | Penyedia pemilik | Perubahan jasa/paket                                                |
| `DELETE /services/:id`                  | Penyedia pemilik | Hapus bila tidak ada pesanan aktif                                  |
| `GET /users/me/favorites`               | Anggota          | Daftar jasa favorit yang tersedia                                   |
| `PUT /users/me/favorites/:serviceId`    | Anggota          | Tambah favorit, idempotent                                          |
| `DELETE /users/me/favorites/:serviceId` | Anggota          | Hapus favorit, idempotent                                           |
| `GET /users/me/recent`                  | Anggota          | Maksimal 12 jasa terakhir yang tersedia                             |
| `POST /users/me/recent/:serviceId`      | Anggota          | Catat view tanpa duplikasi                                          |
| `POST /services/:id/reviews`            | Pencari          | `rating`, `comment`                                                 |
| `PATCH /reviews/:id`                    | Pencari pemilik  | `rating`, `comment`                                                 |
| `DELETE /reviews/:id`                   | Pencari pemilik  | Hapus ulasan sendiri                                                |
| `GET /orders`                           | Anggota          | Riwayat milik sendiri; `view=purchases                              | incoming`, status, dan pencarian |
| `GET /orders/:id`                       | Pihak pesanan    | Detail untuk pembayaran/riwayat, termasuk nominal snapshot          |
| `POST /orders`                          | Pencari          | `serviceId`, `packageId`, brief, deadline, kontak, metode, metadata |
| `POST /orders/:id/payment`              | Pembeli pemilik  | `{ "success": true }` atau `false`; simulasi saja                   |
| `POST /orders/:id/cancel`               | Pembeli pemilik  | Batal sebelum bayar                                                 |
| `POST /orders/:id/delivery`             | Penyedia pemilik | `resultUrl`                                                         |
| `POST /orders/:id/decision`             | Pembeli pemilik  | `accepted` boolean, `complaint` bila ditolak                        |
| `DELETE /orders/:id/history`            | Pembeli pemilik  | Sembunyikan riwayat final                                           |
| `GET /dashboard/provider`               | Penyedia         | Agregat dashboard milik sendiri                                     |

Tamu tidak mendapat email, saldo, role internal yang tidak diperlukan, atau status privat akun dari profil publik. Profil publik hanya memuat ID, nama tampilan, avatar, lokasi, keahlian, dan pengalaman yang diperlukan. Pengguna mendapat email dan saldo sendiri melalui `/auth/me`; admin mendapat DTO akun yang tetap tidak memiliki hash password.

### 7.3 Endpoint admin

| Method dan path                        | Fungsi                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `GET /admin/summary`                   | Agregat ringkasan dan jumlah antrian                                       |
| `GET /admin/orders`                    | Semua pesanan dengan pagination, filter, dan kontak sesuai kebutuhan admin |
| `GET /admin/orders/:id`                | Detail pesanan untuk keputusan admin                                       |
| `POST /admin/orders/:id/review`        | `approve` boolean; approve/refund sekali saja                              |
| `GET /admin/users`                     | Daftar akun dan pencarian                                                  |
| `POST /admin/users`                    | Buat akun non-admin                                                        |
| `PATCH /admin/users/:id`               | Ubah akun non-admin; password kosong berarti tidak diubah                  |
| `DELETE /admin/users/:id`              | Hapus akun non-admin yang tidak memiliki pesanan aktif                     |
| `GET /admin/services`                  | Daftar jasa termasuk yang tersembunyi                                      |
| `PATCH /admin/services/:id/moderation` | `hidden` boolean                                                           |
| `DELETE /admin/services/:id`           | Hapus jasa dengan penjagaan pesanan aktif                                  |
| `GET /admin/logs`                      | Log paginated dengan filter aktor, aksi, dan tanggal                       |

### 7.4 Integrasi React dan peta store

Gunakan satu API client berbasis `fetch` dengan credentials, token CSRF, normalisasi error, dan pembatalan request bila halaman dilepas. Pertahankan nama action lama bila membantu migrasi, tetapi jangan menyediakan lagi snapshot seluruh database.

| Action lokal                                             | API pengganti                                                                          |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `login`, `register`, `logout`                            | `/auth/*`                                                                              |
| `updateProfile`, `becomeProvider`, `deleteAccount`       | `/users/me*`                                                                           |
| `saveService`, `deleteService`, `moderateService`        | `/services*` dan `/admin/services*`                                                    |
| `toggleFavorite`, `viewService`                          | `/users/me/favorites*` dan `/users/me/recent*`                                         |
| `saveReview`, `deleteReview`                             | `/services/:id/reviews` dan `/reviews/:id`                                             |
| `createOrder`, `payOrder`, `cancelOrder`, `deliverOrder` | `/orders*` beserta action terkait                                                      |
| `acceptOrder`, `complainOrder`, `deleteOrder`            | `/orders/:id/decision` dan `/orders/:id/history`                                       |
| `reviewOrder`, `saveUser`, `deleteUser`                  | `/admin/orders/:id/review` dan `/admin/users*`                                         |
| `getSnapshot`, `subscribe`                               | State/cache frontend per resource; bukan endpoint global                               |
| `reset`                                                  | Tidak memiliki endpoint publik; diganti perintah seed/reset development yang eksplisit |

Setiap halaman berpindah dari filter seluruh `state.users/orders/services` ke resource dan agregat sesuai aksesnya. Audit pemanggil yang masih menganggap operasi sinkron, termasuk favorit, recent, logout, dan reset. Semua mutasi mempunyai loading state, error yang terlihat, serta pencegahan klik ganda.

Saat reload, pemeriksaan `/auth/me` selesai sebelum route guard memutus akses. `401` berarti pengguna keluar; kegagalan jaringan atau database menampilkan retry, bukan memaksa logout atau diam-diam memakai seed. Setelah mutasi, invalidasi data yang terpengaruh, termasuk saldo, profil, katalog, riwayat, dan dashboard. Rating, total halaman, dan filter harus berasal dari dataset server yang sama.

## 8. Keamanan dan keandalan yang dibutuhkan

1. Semua endpoint privat memeriksa sesi, status akun, role, dan kepemilikan server-side. Akses ID pesanan atau jasa orang lain tidak cukup untuk mengubah resource.
2. Validasi DTO memakai `ValidationPipe` dengan whitelist dan penolakan field tak dikenal. Panjang string, array, request body, dan rentang query diberi batas yang terdokumentasi.
3. Login/register mempunyai rate limit yang bisa dikonfigurasi. Gunakan batas gabungan akun dan IP yang mempertimbangkan IP kampus bersama; jangan hanya mengandalkan pemblokiran IP ketat.
4. CORS hanya untuk origin yang diizinkan jika akses lintas origin diperlukan. Jangan memakai wildcard dengan credentials. Deploy satu origin tetap memerlukan CSRF.
5. Saldo dan status memakai transaksi database, constraint, serta penanganan konflik. Duplikasi request tidak boleh menyebabkan efek saldo kedua, termasuk pembayaran dua pesanan berbeda dari saldo yang sama.
6. Respons error tidak menampilkan stack trace, SQL, connection string, password, atau token. Log operasional memiliki request ID; audit mutasi tidak ditulis oleh client.
7. Akun diblokir, dihapus, berubah password melalui admin, atau turun role kehilangan sesi/akses yang relevan. Saldo dan izin tidak di-cache sebagai klaim yang terus dipercaya.
8. Seed dan reset tidak berjalan saat server startup. Reset database membutuhkan perintah development terpisah, environment development, dan konfirmasi database target.

## 9. Seed dan transisi sumber data

- Gunakan JSON frontend saat ini sebagai fixture awal backend, dengan ID dan relasi yang sama.
- Hash password fixture pada proses seed. Akun demo dan kredensial yang diketahui hanya dipakai pada environment demo/development yang dinyatakan jelas.
- Saldo seed merupakan opening balance pada waktu fixture. Pesanan seed diimpor dengan status historisnya; jangan memutar ulang debit/settlement dari pesanan lama.
- Seed aman dijalankan ulang: tidak menggandakan akun, paket, ulasan, atau saldo. Seed tidak menimpa perubahan operasional database yang sudah terisi tanpa mode reset eksplisit.
- `currentUserId` dan preferensi sesi lokal tidak diimpor. Login baru menggunakan sesi server.
- Jangan otomatis mengunggah `sewaskill-data-v2` dari browser karena data dapat dimanipulasi dan berbeda antaranggota kelompok.
- Setelah cutover, singkirkan seed berisi password dari source/frontend build dan hentikan penggunaan localStorage sebagai sumber data bisnis. Preferensi tampilan non-sensitif boleh tetap lokal.
- Tombol reset publik dan teks yang mengklaim semua data tersimpan di browser diperbarui sesuai sistem baru. Pembayaran tetap diberi label simulasi.

## 10. Rencana implementasi dalam lima tahap

| Tahap                       | Pekerjaan                                                                                                   | Kriteria keluar                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1. Struktur repository      | Rekam diff awal, pindahkan frontend, siapkan workspaces dan NestJS API, rapikan ignore/config               | Satu `.git`, perubahan lokal tetap utuh, frontend lint/build lulus dari lokasi baru, health API dapat dibuka            |
| 2. Database dan autentikasi | Schema, migration, fixture, sesi PostgreSQL, hash password, DTO, CSRF, role guard                           | Seed relasional lulus, login/register/logout/me bekerja, respons tidak bocor password, restart tidak menghilangkan data |
| 3. Resource inti            | Profil, penyedia, katalog, paket, favorit, recent, ulasan                                                   | CRUD dan ownership berjalan via API, pagination/filter konsisten, snapshot pesanan terlindungi                          |
| 4. Transaksi dan admin      | Pesanan, pembayaran simulasi, hasil, keputusan, ledger, dashboard, manajemen dan log                        | Kedua jalur approve/refund lulus, konkurensi tidak menggandakan saldo, role admin terlindungi                           |
| 5. Integrasi dan handoff    | Ganti store lokal per halaman, loading/error, hentikan seed frontend/reset publik, dokumentasi dan validasi | Semua alur berjalan dari UI dengan API; fresh install, lint, build, format, dan pengujian utama lulus                   |

Jangan menggabungkan migrasi CSS dengan pemindahan folder. Pisahkan perubahan struktur dari perubahan perilaku agar diff dan regresi mudah diperiksa. Commit/publish mengikuti instruksi Git pengguna; tidak ada push otomatis.

## 11. Kriteria penerimaan dan pengujian

### 11.1 Repository dan local setup

- Checkout baru dapat diinstal dan dijalankan dengan README tanpa path absolut mesin pengembang.
- `.git/` hanya berada di root. Tidak ada nested repository, `.env` rahasia, node_modules, atau build output yang masuk staging.
- Route frontend dan path gambar tetap berfungsi setelah dipindah, termasuk deep link langsung ke halaman login, detail, dan pembayaran.
- Hasil perapian input serta penghapusan teks bantuan password tetap terlihat.

### 11.2 Identitas, akses, dan data

- Dua browser dapat login sebagai akun berbeda dan melihat perubahan server yang sama setelah refetch.
- Reload mempertahankan login yang belum expired. Logout dan akun terblokir tidak dapat memakai sesi untuk mutasi.
- Pengubahan body agar berisi role admin, saldo, ownerId, atau harga sendiri ditolak.
- Tamu/pencari tidak dapat membaca daftar akun, kontak pesanan lain, log admin, password, atau hash.
- Setelah backend/database restart, data tetap ada. Saat backend mati, UI menampilkan error/retry dan tidak membuat data demo pengganti.

### 11.3 Aturan domain dan konkurensi

- Paket kosong, nama paket ganda, ID paket lintas jasa, harga tidak valid, rating di luar 1 sampai 5, dan ulasan ganda ditolak.
- Given harga paket 85.000, when pesanan dibuat, then fee 4.250 dan total 89.250 berasal dari server.
- Given saldo 500.000 dan pembayaran 89.250, when simulasi berhasil, then saldo pembeli 410.750.
- Given pesanan dibayar tadi, when admin menyetujui setelah peninjauan pembeli, then saldo penyedia bertambah 85.000 tepat satu kali.
- Given pesanan sejenis dikomplain, when admin melakukan refund, then saldo pembeli kembali ke nilai sebelum pembayaran.
- Simulasi gagal, saldo kurang, dan transisi ilegal tidak meninggalkan perubahan saldo parsial.
- Dua request bayar pada pesanan sama tidak mendebit dua kali. Dua pembayaran berbeda yang bersaing tidak membuat saldo negatif.
- Request bayar bersamaan dengan batal, approve bersamaan dengan refund, serta edit saldo admin bersamaan dengan pembayaran menghasilkan satu keadaan valid dan ledger yang cocok.
- Pengeditan harga, judul jasa, nama paket, atau lokasi profil tidak mengubah snapshot pesanan lama.
- Hapus akun/jasa dengan pesanan aktif ditolak. Menyembunyikan riwayat final tidak menghapus data penyedia/admin.

### 11.4 Verifikasi akhir

Gunakan pengujian service/domain dan integrasi API dengan database test terpisah untuk aturan akses dan transaksi. Gunakan pengujian browser untuk satu alur pembeli-penyedia-admin pada jalur selesai, satu jalur refund, dan perilaku loading/error.

Jalankan lint, build, format check, serta pemeriksaan responsif pada halaman terdampak. Catat hasil nyata, bukan hanya daftar perintah yang direncanakan. Migration dan seed diuji pada database kosong; pengulangan seed diuji tidak menambah saldo atau fixture kedua.

## 12. Risiko dan mitigasi

| Risiko                                                   | Mitigasi                                                                                 |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Perubahan lokal hilang ketika folder dipindah            | Inventaris diff sebelum migrasi, pindahkan file eksplisit, bandingkan diff sesudahnya    |
| Tampilan rusak setelah source dipindah                   | Pertahankan struktur internal frontend dan URL aset, verifikasi build serta deep link    |
| API mengirim semua state agar integrasi terlihat cepat   | Gunakan DTO/resource sesuai peran, refactor pembaca state per halaman                    |
| Operasi sinkron lama menimbulkan race/loading yang salah | Audit seluruh pemanggil store, tunggu Promise, invalidasi cache, cegah submit ganda      |
| Saldo ganda atau negatif                                 | Transaksi, conditional update/locking, kunci ledger unik, pengujian request paralel      |
| Reset browser menjadi reset database publik              | Hapus action publik; pisahkan seed/reset development dari REST API                       |
| Seed fixture menimpa data baru                           | Seed eksplisit dan non-destruktif; reset hanya pada target development yang diverifikasi |
| Cookie gagal pada setup lintas origin                    | Pakai proxy development dan satu origin deployment; dokumentasikan origin/cookie/CSRF    |
| Scope tugas membesar                                     | Pertahankan pembayaran dan berkas sebagai simulasi; fitur di luar cakupan ditunda        |

Sebelum migration atau reset yang mengubah data, verifikasi database target dan siapkan backup bila sudah berisi data penting. Jika tahap struktur perlu dibatalkan, pulihkan hanya perubahan migrasi yang tercatat sambil mempertahankan perubahan lokal pengguna. Jangan memakai reset repository massal atau menghapus volume database sebagai langkah pemulihan rutin.

## 13. Keputusan implementasi

Implementasi memakai PostgreSQL langsung tanpa Docker, Prisma 6, NestJS 11, dan sesi cookie tersimpan di PostgreSQL. Batas body JSON adalah 128 KiB. Rate limit autentikasi memakai batas IP dan akun terpisah yang dapat diatur melalui environment. Versi dependency tersimpan pada satu lockfile root. Petunjuk konfigurasi dan batas pengujian tersedia pada README.

Pekerjaan API baru dianggap selesai ketika frontend benar-benar memakai API pada semua alur di atas. Folder backend berisi scaffold saja belum memenuhi PRD.

## 14. Referensi teknis

- [NestJS Validation](https://docs.nestjs.com/techniques/validation): validasi DTO dan kebijakan properti request.
- [NestJS Session](https://docs.nestjs.com/techniques/session): integrasi sesi dan kebutuhan penyimpanan sesi yang sesuai.
- [NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction): dokumentasi kontrak API melalui Swagger.
- [PostgreSQL Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html): isolasi transaksi dan penanganan konkurensi.

Referensi di atas mendukung mekanisme teknis. Pemilihan stack, endpoint, dan batas MVP dalam dokumen ini merupakan rancangan proyek berdasarkan frontend yang diperiksa.
