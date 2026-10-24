import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './KatalogPage.css';

const TALENTS = [
  {
    id: 1,
    name: 'Rizky Aditya',
    skill: 'Edit Video Pendek (Reels/TikTok)',
    category: 'video',
    price: 50000,
    priceFormatted: 'Rp 50.000',
    rating: 4.9,
    reviews: 120,
    orders: '320 order',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    tableAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    link: '/detail-jasa'
  },
  {
    id: 2,
    name: 'Sari Dewi',
    skill: 'Desain Thumbnail YouTube',
    category: 'desain',
    price: 35000,
    priceFormatted: 'Rp 35.000',
    rating: 4.8,
    reviews: 88,
    orders: '210 order',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    tableAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    link: '/detail-jasa'
  },
  {
    id: 3,
    name: 'Budi Santoso',
    skill: 'Tutor Koding (Python & Web)',
    category: 'koding',
    price: 75000,
    priceFormatted: 'Rp 75.000',
    rating: 4.7,
    reviews: 65,
    orders: '150 order',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    tableAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    link: '/detail-jasa'
  },
  {
    id: 4,
    name: 'Maya Putri',
    skill: 'Penulisan Konten & Artikel SEO',
    category: 'konten',
    price: 40000,
    priceFormatted: 'Rp 40.000',
    rating: 4.6,
    reviews: 54,
    orders: '130 order',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
    tableAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80',
    link: '/detail-jasa'
  },
  {
    id: 5,
    name: 'Andi Wijaya',
    skill: 'Editing Foto Produk / E-commerce',
    category: 'foto',
    price: 45000,
    priceFormatted: 'Rp 45.000',
    rating: 4.8,
    reviews: 76,
    orders: '180 order',
    avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80',
    tableAvatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80',
    link: '/detail-jasa'
  },
  {
    id: 6,
    name: 'Lestari',
    skill: 'Desain Brand Kit & Logo',
    category: 'desain',
    price: 90000,
    priceFormatted: 'Rp 90.000',
    rating: 4.9,
    reviews: 93,
    orders: '240 order',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    tableAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    link: '/detail-jasa'
  }
];

export default function KatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    document.title = 'Katalog Jasa & Talent SewaSkill';
  }, []);

  const handleReset = () => {
    setSearchTerm('');
    setCategory('');
    setMaxPrice('');
    setSortBy('rating');
  };

  const filteredTalents = TALENTS.filter((talent) => {
    const matchesSearch =
      talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.skill.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === '' || talent.category === category;
    const matchesPrice = maxPrice === '' || talent.price <= Number(maxPrice);
    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'harga-asc') return a.price - b.price;
    if (sortBy === 'harga-desc') return b.price - a.price;
    return 0;
  });

  return (
    <main>
      <div className="page-catalog__hero">
        <div className="container">
          <p className="eyebrow">Ratusan talent terverifikasi</p>
          <h1>Katalog Jasa &amp; Talent SewaSkill</h1>
          <p className="page-catalog__lead">
            Temukan talent profesional sesuai kebutuhan proyekmu dari ratusan penyedia jasa terverifikasi.
          </p>
          <Link className="button button--primary" to="/tambah-jasa">
            Daftarkan Jasamu
          </Link>
        </div>
      </div>

      <div className="container">
        <section id="filter-pencarian" className="page-catalog__filter-panel" aria-labelledby="judul-filter">
          <h2 id="judul-filter">Filter &amp; Pencarian</h2>
          <form
            className="filter-grid"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="page-catalog__form-group">
              <label htmlFor="cari-talent">Cari Talent atau Jasa:</label>
              <input
                type="search"
                id="cari-talent"
                name="q"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Contoh: edit video, desain logo..."
              />
            </div>

            <div className="page-catalog__form-group">
              <label htmlFor="filter-kategori">Kategori Skill:</label>
              <select
                id="filter-kategori"
                name="kategori"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">-- Semua Kategori --</option>
                <option value="video">Edit Video</option>
                <option value="desain">Desain Grafis / Thumbnail</option>
                <option value="koding">Tutor / Joki Koding</option>
                <option value="konten">Penulisan Konten</option>
                <option value="foto">Editing Foto</option>
              </select>
            </div>

            <div className="page-catalog__form-group">
              <label htmlFor="filter-harga">Maksimal Harga (Rp):</label>
              <input
                type="number"
                id="filter-harga"
                name="harga_max"
                min="0"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Contoh: 100000"
              />
            </div>

            <div className="page-catalog__form-group">
              <label htmlFor="urut-berdasarkan">Urutkan:</label>
              <select
                id="urut-berdasarkan"
                name="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">Rating Tertinggi</option>
                <option value="harga-asc">Harga Terendah</option>
                <option value="harga-desc">Harga Tertinggi</option>
              </select>
            </div>

            <div className="page-catalog__form-actions">
              <button className="button button--primary" type="submit">
                Cari
              </button>
              <button className="button button--secondary" type="button" onClick={handleReset}>
                Reset
              </button>
            </div>
          </form>
        </section>

        <section id="tabel-talent" aria-labelledby="judul-tabel">
          <div className="section-heading">
            <h2 id="judul-tabel">Daftar Talent Tersedia</h2>
            <p>Ringkasan seluruh penyedia jasa aktif beserta bidang keahlian dan statistik performa mereka.</p>
          </div>
          <div className="table-wrapper">
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
                {filteredTalents.map((talent) => (
                  <tr key={talent.id}>
                    <td>
                      <img
                        className="page-catalog__table-avatar"
                        src={talent.tableAvatar}
                        alt={`Foto profil ${talent.name}, ${talent.skill}`}
                        width="60"
                        height="60"
                      />
                    </td>
                    <td>{talent.name}</td>
                    <td>{talent.skill}</td>
                    <td>
                      <span className="price">{talent.priceFormatted}</span>
                    </td>
                    <td>
                      <span className="rating">
                        {talent.rating} / 5.0 <small>({talent.reviews} ulasan)</small>
                      </span>
                    </td>
                    <td>{talent.orders}</td>
                    <td>
                      <Link to={talent.link} aria-label={`Lihat detail jasa ${talent.name}`}>
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="kartu-talent" aria-labelledby="judul-kartu">
          <div className="section-heading">
            <h2 id="judul-kartu">Jelajahi Talent</h2>
            <p>Temukan talent pilihan terbaik berdasarkan bidang dan kebutuhan proyekmu.</p>
          </div>

          <div className="talent-grid">
            {filteredTalents.map((talent) => (
              <article key={talent.id} className="page-catalog__card">
                <img src={talent.avatar} alt={`Foto profil ${talent.name}`} />
                <div className="talent-meta">
                  <h3>{talent.name}</h3>
                  <p>
                    <strong>Bidang:</strong> {talent.skill}
                  </p>
                  <p className="price">Mulai dari {talent.priceFormatted}</p>
                  <p className="rating">Rating: {talent.rating}/5.0</p>
                  <Link
                    className="button button--primary"
                    to={talent.link}
                    aria-label={`Lihat jasa ${talent.name}`}
                  >
                    Lihat Jasa
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
