# 📄 Anggota 2 — `katalog.html` (Katalog & Daftar Talent/Jasa)
> **Proyek:** SewaSkill — Platform Jasa Freelance Mikro | **Tugas Besar Pemrograman Web**

## 🎯 Tujuan Halaman
Halaman direktori utama yang menampilkan **daftar semua talent dan jasa** yang tersedia di platform SewaSkill. Pengguna dapat melihat tabel ringkasan talent dan kartu jasa dengan detail dasar.

---

## 📁 File yang Dibuat
- `katalog.html`

---

## 🗺️ Konteks Proyek — SewaSkill (5 Halaman, 5 Anggota)

Halaman ini adalah **bagian dari satu proyek utuh** bernama **SewaSkill**, sebuah platform jasa freelance mikro yang dikerjakan bersama oleh 5 anggota kelompok. Semua halaman harus bisa diakses satu sama lain melalui elemen `<nav>` yang **wajib konsisten** di setiap halaman.

### Peta Halaman Proyek

| File | Dikerjakan oleh | Peran dalam Proyek |
|------|----------------|--------------------|
| `index.html` | Anggota 1 | Pintu masuk utama platform, hero, dan kategori |
| **`katalog.html`** ← **(Kamu)** | Anggota 2 | Direktori daftar semua talent dengan tabel & filter |
| `tambah-jasa.html` | Anggota 3 | Form pendaftaran bagi talent baru |
| `detail-jasa.html` | Anggota 4 | Profil lengkap talent, galeri portofolio, & paket harga |
| `order.html` | Anggota 5 | Form checkout & konfirmasi pemesanan jasa |

### Alur Pengguna (User Journey)
```
[index.html] → [katalog.html] → [detail-jasa.html] → [order.html]
      ↑              ↑ (Kamu di sini)                       |
      └─────────────── [tambah-jasa.html] ─────────────────┘
                       (Jalur Talent/Penjual)
```

### Tanggung Jawabmu dalam Proyek Ini
- **Halaman `katalog.html`** adalah jembatan utama dari beranda menuju detail jasa.
- Setiap baris di tabel talent dan setiap kartu `<article>` harus memiliki link `<a href="detail-jasa.html">` menuju halaman milik **Anggota 4**.
- Form filter pencarian di halaman ini tidak perlu mengarah ke mana pun (tetap di halaman ini).
- **Konsistensi `<header>` dan `<footer>`** sangat penting — pastikan struktur navigasi di halamanmu sama persis dengan yang dipakai anggota lain.
- Tombol/link "Daftarkan Jasamu" harus mengarah ke `tambah-jasa.html` milik **Anggota 3**.

> ⚠️ **Penting:** Jangan mengubah nama file `.html` yang sudah disepakati. Semua link antar halaman bergantung pada nama file yang konsisten.


---

## ✅ Checklist Elemen Wajib

### Struktur Semantic HTML5
- [ ] `<header>` + `<nav>` — navigasi platform (sama di semua halaman)
- [ ] `<main>` — konten utama katalog
- [ ] `<section>` — untuk memisahkan bagian tabel dan bagian grid kartu
- [ ] `<article>` — untuk setiap kartu talent di grid
- [ ] `<footer>` — hak cipta platform

### Elemen HTML Wajib
- [ ] `<h1>` — **tepat satu** (contoh: "Katalog Jasa & Talent SewaSkill")
- [ ] `<h2>`, `<h3>` — untuk subjudul section dan nama talent di kartu
- [ ] `<table>` dengan `<thead>`, `<tbody>`, `<th scope="col">`, `<td>` — **WAJIB ADA**
- [ ] `<form>` — form filter/pencarian katalog
- [ ] `<input>`, `<select>`, `<label>` — elemen form filter
- [ ] `<img>` — foto profil talent (dengan `alt` deskriptif)
- [ ] `<a href="...">` — link ke halaman detail jasa

### Aksesibilitas (a11y)
- [ ] Setiap `<label>` **wajib** memiliki atribut `for` yang sesuai dengan `id` input terkait
  - BENAR: `<label for="filter-kategori">Kategori:</label> <select id="filter-kategori">`
  - SALAH: `<label>Kategori: <select>` (label tanpa `for`)
- [ ] `<table>` harus memiliki `<caption>` yang mendeskripsikan isi tabel
- [ ] `<th>` menggunakan atribut `scope="col"` (untuk header kolom)
- [ ] Setiap `<img>` **wajib** punya `alt` yang deskriptif

---

## 🗂️ Struktur Konten yang Harus Ada

### 1. `<header>` + `<nav>` (Navigasi Platform — Sama di Semua Halaman)

```html
<header>
  <a href="index.html">
    <img src="images/logo.png" alt="Logo SewaSkill — Platform Jasa Freelance Mikro">
    <span>SewaSkill</span>
  </a>
  <nav aria-label="Navigasi Utama">
    <ul>
      <li><a href="index.html">Beranda</a></li>
      <li><a href="katalog.html">Katalog Jasa</a></li>
      <li><a href="tambah-jasa.html">Daftarkan Jasamu</a></li>
      <li><a href="detail-jasa.html">Contoh Detail Jasa</a></li>
      <li><a href="order.html">Contoh Order</a></li>
    </ul>
  </nav>
</header>
```

### 2. Heading & Form Filter — Di dalam `<main>`

```html
<main>
  <h1>Katalog Jasa &amp; Talent SewaSkill</h1>
  <p>Temukan talent profesional sesuai kebutuhan proyekmu dari ratusan penyedia jasa terverifikasi.</p>

  <section id="filter-pencarian">
    <h2>Filter &amp; Pencarian</h2>
    <form action="#" method="get">

      <label for="cari-talent">Cari Talent atau Jasa:</label>
      <input type="search" id="cari-talent" name="q" placeholder="Contoh: edit video, desain logo...">

      <label for="filter-kategori">Kategori Skill:</label>
      <select id="filter-kategori" name="kategori">
        <option value="">-- Semua Kategori --</option>
        <option value="video">Edit Video</option>
        <option value="desain">Desain Grafis / Thumbnail</option>
        <option value="koding">Tutor / Joki Koding</option>
        <option value="konten">Penulisan Konten</option>
        <option value="foto">Editing Foto</option>
      </select>

      <label for="filter-harga">Maksimal Harga (Rp):</label>
      <input type="number" id="filter-harga" name="harga_max" min="0" step="5000" placeholder="Contoh: 100000">

      <label for="urut-berdasarkan">Urutkan:</label>
      <select id="urut-berdasarkan" name="sort">
        <option value="rating">Rating Tertinggi</option>
        <option value="harga-asc">Harga Terendah</option>
        <option value="harga-desc">Harga Tertinggi</option>
      </select>

      <button type="submit">Cari</button>
      <button type="reset">Reset</button>
    </form>
  </section>
```

### 3. Tabel Data Talent — **ELEMEN UTAMA DAN WAJIB**

```html
  <section id="tabel-talent">
    <h2>Daftar Talent Tersedia</h2>
    <table>
      <caption>Daftar talent dan penyedia jasa yang terdaftar di platform SewaSkill</caption>
      <thead>
        <tr>
          <th scope="col">Foto</th>
          <th scope="col">Nama Talent</th>
          <th scope="col">Bidang Skill</th>
          <th scope="col">Patokan Harga Mulai</th>
          <th scope="col">Rating</th>
          <th scope="col">Jumlah Order</th>
          <th scope="col">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <img src="images/talent-1.jpg" alt="Foto profil Rizky Aditya, talent edit video profesional" width="60">
          </td>
          <td>Rizky Aditya</td>
          <td>Edit Video Pendek (Reels/TikTok)</td>
          <td>Rp 50.000</td>
          <td>4.9 / 5.0 (120 ulasan)</td>
          <td>320 order</td>
          <td><a href="detail-jasa.html">Lihat Detail</a></td>
        </tr>
        <tr>
          <td>
            <img src="images/talent-2.jpg" alt="Foto profil Sari Dewi, desainer thumbnail YouTube" width="60">
          </td>
          <td>Sari Dewi</td>
          <td>Desain Thumbnail YouTube</td>
          <td>Rp 35.000</td>
          <td>4.8 / 5.0 (88 ulasan)</td>
          <td>210 order</td>
          <td><a href="detail-jasa.html">Lihat Detail</a></td>
        </tr>
        <tr>
          <td>
            <img src="images/talent-3.jpg" alt="Foto profil Budi Santoso, tutor pemrograman Python dan web" width="60">
          </td>
          <td>Budi Santoso</td>
          <td>Tutor Koding (Python &amp; Web)</td>
          <td>Rp 75.000</td>
          <td>4.7 / 5.0 (65 ulasan)</td>
          <td>150 order</td>
          <td><a href="detail-jasa.html">Lihat Detail</a></td>
        </tr>
        <tr>
          <td>
            <img src="images/talent-4.jpg" alt="Foto profil Maya Putri, penulis konten artikel SEO" width="60">
          </td>
          <td>Maya Putri</td>
          <td>Penulisan Konten &amp; Artikel SEO</td>
          <td>Rp 40.000</td>
          <td>4.6 / 5.0 (54 ulasan)</td>
          <td>130 order</td>
          <td><a href="detail-jasa.html">Lihat Detail</a></td>
        </tr>
        <!-- Tambahkan minimal 2 baris data lagi -->
      </tbody>
    </table>
  </section>
```

### 4. Grid Kartu Talent — Di bawah Tabel

```html
  <section id="kartu-talent">
    <h2>Jelajahi Talent</h2>

    <article>
      <img src="images/talent-1.jpg" alt="Foto profil Rizky Aditya, talent edit video profesional">
      <h3>Rizky Aditya</h3>
      <p><strong>Bidang:</strong> Edit Video Pendek</p>
      <p><strong>Mulai dari:</strong> Rp 50.000</p>
      <p><strong>Rating:</strong> 4.9/5.0</p>
      <a href="detail-jasa.html">Lihat Profil Lengkap</a>
    </article>

    <article>
      <img src="images/talent-2.jpg" alt="Foto profil Sari Dewi, desainer thumbnail YouTube berpengalaman">
      <h3>Sari Dewi</h3>
      <p><strong>Bidang:</strong> Desain Thumbnail</p>
      <p><strong>Mulai dari:</strong> Rp 35.000</p>
      <p><strong>Rating:</strong> 4.8/5.0</p>
      <a href="detail-jasa.html">Lihat Profil Lengkap</a>
    </article>

    <!-- Tambahkan minimal 2 artikel kartu lagi -->

  </section>

</main>
```

### 5. `<footer>`

```html
<footer>
  <p>&copy; 2025 SewaSkill. Hak Cipta Dilindungi.</p>
  <nav aria-label="Navigasi Footer">
    <ul>
      <li><a href="index.html">Beranda</a></li>
      <li><a href="katalog.html">Katalog Jasa</a></li>
      <li><a href="tambah-jasa.html">Daftarkan Jasamu</a></li>
    </ul>
  </nav>
</footer>
```

---

## 📐 Aturan Teknis

| Aturan | Detail |
|--------|--------|
| Jumlah `<h1>` | **Tepat 1** per halaman |
| `<table>` | **Wajib ada**, dengan `<caption>`, `<thead>`, `<tbody>`, `scope="col"` |
| `<label for>` | **Wajib** terhubung ke `id` input yang sesuai |
| `<img alt>` | **Wajib ada dan deskriptif** pada setiap gambar |
| CSS | **Dilarang** |
| JavaScript | **Dilarang** |
| Bahasa | `<html lang="id">` |

---

## ⚠️ Hal yang Sering Salah
1. `<table>` tanpa `<caption>` — selalu tambahkan caption
2. `<th>` tanpa `scope="col"` — wajib untuk aksesibilitas tabel
3. `<label>` tanpa `for` yang terhubung ke `id` input
4. `<img>` di dalam `<td>` tanpa atribut `alt`
5. Memakai `<div>` sebagai pengganti `<section>` atau `<article>`

---

## Tugas Minggu 3 — CSS Native untuk `katalog.html`

> **Instruksi terbaru:** Larangan CSS pada Minggu 2 sudah tidak berlaku untuk tugas ini. Pertahankan struktur semantik, tabel, form, isi, dan aksesibilitas HTML yang sudah benar.

### Peran dan Scope Anggota 2

Kerjakan hanya:

- `katalog.html`
- `style.css` pada blok `/* PAGE: KATALOG */` dan aturan responsive terkait katalog
- `screenshots/katalog-desktop.png` (Opsional / tahap akhir)
- `screenshots/katalog-mobile.png` (Opsional / tahap akhir)

Gunakan `style.css` baseline milik Anggota 1. Jangan membuat stylesheet kedua, jangan menimpa blok global, dan jangan mengubah CSS halaman anggota lain.

### Output Wajib

1. Tambahkan `<link rel="stylesheet" href="style.css">` di `<head>` dan gunakan `<body class="page-catalog">`.
2. Tambahkan `<div>`/`<span>` seperlunya untuk grouping visual, misalnya `.container`, `.filter-grid`, `.table-wrapper`, `.talent-grid`, `.talent-meta`, `.rating`, dan `.price`. Elemen semantik yang sudah ada tidak boleh diganti. Wajib gunakan kembali class shared yang sudah ada (seperti `.container`, `.button`, `.button--primary`, `.button--secondary`, dll.) dan hindari membuat class baru yang duplikat.
3. Styling katalog minimal mencakup:
   - judul dan deskripsi pembuka yang jelas;
   - form filter dalam panel/card dengan label tetap terbaca;
   - input, select, dan tombol dengan ukuran konsisten;
   - tabel dengan header kontras, zebra row atau hover ringan, padding yang cukup, dan border rapi;
   - kartu talent dalam grid dengan foto responsif, badge/rating, harga, dan CTA;
   - styling `ul`/`ol` bila ada, termasuk navigasi shared dari Anggota 1.
4. Semua selector khusus halaman harus diawali `.page-catalog` agar tidak merusak halaman lain.
5. Pada `@media (max-width: 768px)`, ubah filter dan grid menjadi satu kolom, kurangi padding, dan bungkus tabel dengan `.table-wrapper { overflow-x: auto; }`. Navigasi shared harus tampil vertikal.

### Standar Visual Final Bersama

Aturan ini berlaku untuk semua halaman dan harus dipertahankan saat mengedit `style.css`:

- **Hindari AI slop:** jangan memakai blob, kumpulan dot, pola dekoratif acak, gradient tanpa fungsi, card di dalam card, atau terlalu banyak bentuk pill. Setiap elemen visual harus membantu hierarki atau keterbacaan.
- **Tanpa CSS Variables (`var()` & `:root`):** Jangan gunakan custom properties CSS (`--nama-variabel`) maupun fungsi `var()`. Tuliskan nilai warna, spasi, radius, dan shadow secara langsung dan konsisten pada rule yang bersangkutan.
- **Reuse class yang sudah ada (Anti-duplikasi):** Wajib menggunakan kembali class-class shared/global yang sudah dibuat oleh Anggota 1 di bagian `GLOBAL / SHARED` (seperti `.container`, `.button`, `.button--primary`, `.button--secondary`, `.section`, `.section-heading`, `.eyebrow`, styling dasar form & tabel, dll.). Dilarang menduplikasi rule atau menciptakan utility/class baru jika styling serupa sudah tersedia.
- **Instruksi Khusus untuk AI (Prompting Guardrail):** Saat meminta bantuan AI untuk coding/refactor:
  - Instruksikan AI untuk membaca dan menggunakan class yang sudah ada di `style.css`.
  - Larang AI membuat class baru yang fungsinya tumpang-tindih dengan class yang sudah ada.
  - Larang keras AI menggunakan syntax `var(--...)` atau menambahkan deklarasi di `:root`.
  - AI tidak perlu diminta mengambil screenshot (hasil screenshot otomatis AI sering kurang bagus/tidak akurat); fokuskan AI pada kode HTML & CSS.
- **Ikon SVG lokal:** simpan file ikon di `assets/icons/`, lalu tampilkan dengan elemen `<img>` di HTML. Gunakan `alt=""` dan `aria-hidden="true"` untuk ikon dekoratif. Jangan memakai CDN, CSS `mask`, emoji, karakter Unicode sebagai ikon, framework ikon, atau JavaScript.
- **Microcopy ringkas:** gunakan label navigasi `Beranda`, `Katalog`, `Daftar Jasa`, `Detail`, dan `Order`. CTA kartu cukup `Lihat Jasa`; tambahkan `aria-label` yang spesifik bila beberapa link memakai teks visual yang sama.
- **Hover hanya warna:** hover boleh mengubah `color`, `background-color`, atau `border-color`. Jangan memakai `transform`, `translate`, `scale`, perubahan posisi, atau animasi shadow. Durasi transisi warna sekitar 150–250 ms.
- **Spacing proporsional:** beri jarak ikon dan teks sekitar `0.5rem`–`0.625rem`. Hindari teks saling menempel, ruang kosong besar tanpa fungsi, dan aksen garis yang tidak menjelaskan struktur.
- **Aksesibilitas tetap wajib:** sediakan `:focus-visible`, kontras teks yang jelas, `prefers-reduced-motion`, serta pertahankan label, `alt`, dan elemen semantik dari Minggu 2.
- **Satu sumber gaya:** jangan mengubah selector global atau blok halaman anggota lain tanpa koordinasi. Tambahkan aturan hanya pada blok halaman sendiri dan blok responsive terkait.
- **Screenshot bersifat opsional & manual (Tahap Akhir):** Pengambilan screenshot **bersifat opsional** selama proses pengerjaan dan tidak harus langsung dibuat di awal. Jangan meminta AI mengambil screenshot karena hasilnya sering tidak optimal. Screenshot dapat diambil secara manual oleh anggota di tahap akhir menggunakan browser DevTools setelah tampilan web dipastikan rapi dan fix. Jika mengambil ulang, simpan ke nama file yang ditentukan dan timpa file lama tanpa embel-embel versi (`v2`, `final`, dll).

### Screenshot (Opsional / Tahap Akhir)

> **Catatan:** Screenshot bersifat opsional selama proses pengembangan koding. Fokus utama adalah kesempurnaan kode HTML & CSS. Anggota dapat mengambil screenshot secara manual langsung dari browser DevTools (Responsive Device Mode) setelah tampilan halaman sudah benar-benar bagus.

- Desktop `1366 × 768`: `screenshots/katalog-desktop.png`.
- Mobile `390 × 844`: `screenshots/katalog-mobile.png`.
- Screenshot mobile harus memperlihatkan filter/kartu bertumpuk dan tabel tetap dapat dibaca tanpa merusak lebar halaman.

### Kriteria Selesai

- Tidak memakai framework, JavaScript, `<style>`, inline style, maupun CSS Variables (`var()` / `:root`).
- Hanya menggunakan `style.css` bersama; jangan mengganti nama file.
- Menggunakan kembali class shared yang sudah ada secara efisien tanpa duplikasi class/selector yang tidak perlu.
- Tabel tetap memiliki `<caption>` dan `scope`, setiap label tetap terhubung ke input, semua `alt` tetap deskriptif, dan hanya ada satu `<h1>`.
- Tidak ada overflow horizontal pada halaman; overflow horizontal hanya boleh berada di wrapper tabel.
- File screenshot (opsional selama tahap koding, dapat dilengkapi belakangan setelah tampilan selesai dan rapi).
