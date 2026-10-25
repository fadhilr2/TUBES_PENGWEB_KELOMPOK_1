# SewaSkill - Platform Freelance Jasa Digital

> Tugas Besar I (UTS) - Perancangan dan Pemrograman Web  
> Kelompok 1

---

## Deskripsi Proyek

SewaSkill adalah platform web untuk mencari dan memesan jasa freelance digital skala mikro, seperti edit video, desain grafis, bimbingan koding, dan penulisan konten.

Proyek ini dikembangkan menggunakan React 19 dan Bootstrap 5 dengan arsitektur Single Page Application (SPA), serta memanfaatkan Fetch API untuk mengambil data dari mock JSON lokal.

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
- **Data Source:** Fetch API (Mock JSON)
- **Linter:** ESLint 10

---

## Halaman dan Fitur

1. **Beranda (`/`)**
   - Banner pengenalan platform
   - Kategori jasa populer
   - Seksi keunggulan layanan
   - Ulasan pengguna

2. **Katalog Jasa (`/katalog`)**
   - Pencarian talent berdasarkan nama dan keahlian
   - Filter kategori dan batas harga maksimum
   - Pengurutan berdasarkan rating dan harga
   - Pilihan tampilan kartu (grid) atau tabel

3. **Detail Jasa (`/detail-jasa`)**
   - Profil talent, status ketersediaan, dan rating
   - Pilihan paket jasa (Basic, Standard, Premium)
   - Portofolio karya dan FAQ pemesanan

4. **Tambah Jasa (`/tambah-jasa`)**
   - Formulir pendaftaran jasa baru
   - Validasi input form di sisi klien

5. **Pemesanan (`/order`)**
   - Ringkasan pesanan dan kalkulasi biaya
   - Formulir data pemesan dan metode pembayaran
   - Notifikasi konfirmasi pemesanan

---

## Cara Menjalankan Proyek

### 1. Prasyarat

- Node.js (versi 18 ke atas)
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
TUBES_PENGWEB_KELOMPOK_1/
├── public/
│   ├── assets/icons/             # Icon SVG
│   ├── data/                     # Data mock JSON
│   ├── favicon.svg               # Favicon
│   └── icons.svg                 # Sprite SVG
├── src/
│   ├── components/               # Komponen antarmuka (Header, Footer, ScrollToTop)
│   ├── pages/                    # Halaman aplikasi (Home, Katalog, Detail, Tambah, Order)
│   ├── App.jsx                   # Konfigurasi routing
│   ├── main.jsx                  # Entry point aplikasi
│   └── index.css                 # Custom CSS
├── index.html                    # Dokumen HTML utama
├── package.json                  # Konfigurasi dependensi dan script npm
├── vite.config.js                # Konfigurasi bundler Vite
└── README.md                     # Dokumentasi proyek
```
