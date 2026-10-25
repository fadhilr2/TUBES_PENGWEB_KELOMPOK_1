# SewaSkill — Platform Freelance Mikro Jasa Digital

> **Tugas Besar I (UTS) — Perancangan dan Pemrograman Web**  
> **Kelompok 1** | Frontend Development Web Application

---

## Deskripsi Proyek
**SewaSkill** adalah aplikasi web berbasis *Single Page Application* (SPA) yang mempertemukan pencari jasa dengan talent digital independen (freelancer) untuk berbagai kebutuhan mikro, seperti *editing video*, *desain thumbnail/logo*, *tutor pemrograman*, hingga *penulisan konten kreatif*.

Aplikasi ini dibangun menggunakan arsitektur komponen React modern, penataan tata letak responsif menggunakan Bootstrap 5, serta integrasi pemanggilan data dinamis (*Mock API*) menggunakan Fetch API.

---

## Tim Pengembang (Kelompok 1)

| No | Nama Anggota | NIM | Peran / Kontribusi Halaman |
|:--:|:---|:---:|:---|
| 1 | **Fadhil R.** (`fadhilr2`) | *(Isi NIM)* | Setup Project, Routing, Migrasi Bootstrap |
| 2 | **Devara P.** (`theepar`) | *(Isi NIM)* | Halaman Beranda, Refactoring & Clean Architecture |
| 3 | **Adita R.** (`aditarhm`) | *(Isi NIM)* | Halaman Katalog Jasa & Filter |
| 4 | **Elenia / Jeni** (`ejeniamutiara`) | *(Isi NIM)* | Halaman Tambah Jasa & Form |
| 5 | **Hermit** (`JustAHermit`) | *(Isi NIM)* | Halaman Detail Jasa & Order |

---

## Tech Stack & Teknologi

* **Frontend Library:** [React 19](https://react.dev/) (Komponen fungsional & Hooks: `useState`, `useEffect`)
* **Build Tool & Dev Server:** [Vite 8](https://vitejs.dev/) (Fast HMR & Optimized Bundler)
* **Routing:** [React Router DOM v7](https://reactrouter.com/) (Client-side routing SPA)
* **CSS Framework & Styling:** [Bootstrap 5](https://getbootstrap.com/) (`v5.3.8`) + Custom CSS
* **Data Fetching:** Fetch API native JavaScript (JSON Mock API)
* **Linter & Code Quality:** [ESLint 10](https://eslint.org/) (Strict React Hooks & Refresh rules)

---

## Daftar Halaman & Fitur Aplikasi

Aplikasi terdiri dari minimal **5 halaman utama** yang saling terhubung:

1. **Beranda (`/`)**
   * Hero banner promosi dan pengenalan platform
   * Kategori jasa populer (Video, Desain, Koding, Konten)
   * Nilai keunggulan platform SewaSkill
   * Seksi testimoni pengguna dinamis
   * Aksesibilitas penuh (`aria-labelledby`, semantik HTML5)

2. **Katalog Jasa (`/katalog`)**
   * Pencarian langsung berdasarkan kata kunci nama & keahlian
   * Filter multi-kategori (Semua, Desain, Video, Koding, dll.)
   * Filter harga maksimum interaktif
   * Pengurutan (*Sort by*: Rating tertinggi, Harga terendah, Harga tertinggi)
   * Fitur ganti mode tampilan: **Mode Kartu (Grid)** & **Mode Tabel Responsif**

3. **Detail Profil Jasa (`/detail-jasa`)**
   * Navigasi Breadcrumb
   * Profil lengkap talent, status ketersediaan, rating, dan riwayat order
   * Pilihan paket layanan (*Basic*, *Standard*, *Premium*)
   * Portofolio karya dan ulasan klien terdahulu
   * FAQ interaktif seputar pemesanan

4. **Pendaftaran Jasa Baru (`/tambah-jasa`)**
   * Formulir pendaftaran talent baru
   * Pengelompokan data semantik menggunakan `<fieldset>` & `<legend>`
   * Validasi formulir sisi klien (*client-side form validation*)
   * Feedback status pengiriman pendaftaran

5. **Pemesanan Layanan (`/order`)**
   * Rincian pemesanan dan kalkulasi otomatis harga paket + biaya platform
   * Formulir data diri pemesan dan *briefing* kebutuhan proyek
   * Pilihan metode pembayaran (Transfer Bank & E-Wallet)
   * Notifikasi sukses pemesanan

---

## Panduan Menjalankan Proyek (Setup Instructions)

Ikuti langkah-langkah berikut untuk menjalankan proyek di komputer lokal:

### 1. Prasyarat Sistem
* Pastikan komputer sudah terinstall **[Node.js](https://nodejs.org/)** (disarankan versi 18.x atau 20.x ke atas)
* Git terpasang di sistem

### 2. Clone Repository
```bash
git clone https://github.com/fadhilr2/TUBES_PENGWEB_KELOMPOK_1.git
cd TUBES_PENGWEB_KELOMPOK_1
```

### 3. Pindah ke Branch Pengerjaan (Opsional)
```bash
git checkout deva
```

### 4. Install Dependensi
Unduh seluruh library yang dibutuhkan project (React, Bootstrap, Vite, dll.):
```bash
npm install
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Setelah server menyala, buka browser dan akses URL lokal:
**`http://localhost:5173/`**

### 6. Perintah Tambahan
* **Mengecek Linter & Kualitas Kode:**
  ```bash
  npm run lint
  ```
* **Membangun Bundle Produksi (Build Test):**
  ```bash
  npm run build
  ```
* **Pratinjau Hasil Build Produksi:**
  ```bash
  npm run preview
  ```

---

## Struktur Direktori Proyek

```text
TUBES_PENGWEB_KELOMPOK_1/
├── public/                       # Static assets publik
│   ├── assets/
│   │   └── icons/                # Icon SVG statis
│   ├── data/                     # Mock API JSON (Data dinamis)
│   ├── favicon.svg               # Favicon website
│   └── icons.svg                 # SVG sprite
├── src/                          # Source code aplikasi React
│   ├── components/               # Komponen UI Reusable
│   │   ├── Header.jsx            # Navbar navigasi responsif
│   │   ├── Footer.jsx            # Footer website
│   │   └── ScrollToTop.jsx       # Reset scroll saat pindah halaman
│   ├── pages/                    # Halaman-halaman utama
│   │   ├── HomePage.jsx          # Beranda
│   │   ├── KatalogPage.jsx       # Katalog & Pencarian Jasa
│   │   ├── DetailJasaPage.jsx    # Profil & Detail Paket Jasa
│   │   ├── TambahJasaPage.jsx    # Form Pendaftaran Jasa
│   │   └── OrderPage.jsx         # Form & Konfirmasi Pemesanan
│   ├── App.jsx                   # Konfigurasi Routing (React Router)
│   ├── main.jsx                  # Entry point React DOM & Bootstrap CSS
│   └── index.css                 # Custom CSS pendukung
├── index.html                    # Root HTML document
├── package.json                  # Konfigurasi dependensi & npm scripts
├── vite.config.js                # Konfigurasi Vite bundler
└── README.md                     # Dokumentasi resmi proyek
```

---

## Pemenuhan Rubrik Penilaian Tugas Besar

| No | Kriteria Rubrik | Implementasi pada Proyek |
|:--:|:---|:---|
| 1 | **Minimal 5–7 Halaman Terhubung** | Memiliki 5 halaman utama yang saling terhubung dengan navigasi SPA yang mulus. |
| 2 | **Framework Modern** | Menggunakan React 19 + Vite 8 dengan komponen fungsional modern. |
| 3 | **Styling & Responsiveness** | Menerapkan Bootstrap 5 Grid System (`col-*`, Flexbox, Breakpoints) yang responsif di Mobile, Tablet, dan Desktop. |
| 4 | **Semantic HTML & Accessibility** | Memakai tag `<header>`, `<main>`, `<section>`, `<article>`, `<fieldset>`, `<legend>`, serta atribut W3C `aria-labelledby`, `aria-expanded`, dan `aria-label`. |
| 5 | **Form Validation** | Terdapat validasi input sisi klien pada form pendaftaran jasa dan pemesanan. |
| 6 | **Data Source & API Fetching** | Penyajian data dinamis dari file JSON mock API melalui Fetch API dengan penanganan loading & error state. |
| 7 | **Code Quality & Git** | Commit deskriptif, pemisahan branch, serta zero console error / ESLint warning. |

---

*Dibuat untuk evaluasi Tugas Besar I (UTS) Praktik Perancangan dan Pemrograman Web.*
