import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
      <div className="bg-primary text-white py-5">
        <div className="container py-3">
          <p className="text-white-50 fw-semibold text-uppercase small" style={{ letterSpacing: '.08em' }}>
            Ratusan talent terverifikasi
          </p>
          <h1 className="fw-bold display-6 mb-2">Katalog Jasa &amp; Talent SewaSkill</h1>
          <p className="text-white-50 mb-4">
            Temukan talent profesional sesuai kebutuhan proyekmu dari ratusan penyedia jasa terverifikasi.
          </p>
          <Link className="btn btn-light fw-semibold" to="/tambah-jasa">
            + Daftarkan Jasamu
          </Link>
        </div>
      </div>

      <div className="container py-5">
        <section id="filter-pencarian" className="card border-0 shadow-sm mb-5" aria-labelledby="judul-filter">
          <div className="card-body p-4">
            <h2 id="judul-filter" className="h5 fw-semibold mb-4">Filter &amp; Pencarian</h2>
            <form
              className="row g-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="col-md-4">
                <label htmlFor="cari-talent" className="form-label fw-semibold">Cari Talent atau Jasa</label>
                <input
                  type="search"
                  id="cari-talent"
                  name="q"
                  className="form-control"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Contoh: edit video, desain logo..."
                />
              </div>

              <div className="col-md-3">
                <label htmlFor="filter-kategori" className="form-label fw-semibold">Kategori Skill</label>
                <select
                  id="filter-kategori"
                  name="kategori"
                  className="form-select"
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

              <div className="col-md-3">
                <label htmlFor="filter-harga" className="form-label fw-semibold">Maks. Harga (Rp)</label>
                <input
                  type="number"
                  id="filter-harga"
                  name="harga_max"
                  className="form-control"
                  min="0"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Contoh: 100000"
                />
              </div>

              <div className="col-md-2">
                <label htmlFor="urut-berdasarkan" className="form-label fw-semibold">Urutkan</label>
                <select
                  id="urut-berdasarkan"
                  name="sort"
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="rating">Rating Tertinggi</option>
                  <option value="harga-asc">Harga Terendah</option>
                  <option value="harga-desc">Harga Tertinggi</option>
                </select>
              </div>

              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary" type="submit">Cari</button>
                <button className="btn btn-outline-secondary" type="button" onClick={handleReset}>Reset</button>
              </div>
            </form>
          </div>
        </section>

        <section id="tabel-talent" className="mb-5" aria-labelledby="judul-tabel">
          <h2 id="judul-tabel" className="h5 fw-semibold mb-1">Daftar Talent Tersedia</h2>
          <p className="text-muted small mb-3">
            Menampilkan <strong>{filteredTalents.length}</strong> dari {TALENTS.length} talent terdaftar.
          </p>
          <div className="table-responsive">
            <table className="table table-hover align-middle border">
              <caption className="visually-hidden">Daftar talent dan penyedia jasa yang terdaftar di platform SewaSkill</caption>
              <thead className="table-light">
                <tr>
                  <th scope="col">Foto</th>
                  <th scope="col">Nama Talent</th>
                  <th scope="col">Bidang Skill</th>
                  <th scope="col">Harga Mulai</th>
                  <th scope="col">Rating</th>
                  <th scope="col">Order</th>
                  <th scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTalents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">Tidak ada talent yang cocok dengan filter.</td>
                  </tr>
                ) : (
                  filteredTalents.map((talent) => (
                    <tr key={talent.id}>
                      <td>
                        <img
                          src={talent.tableAvatar}
                          alt={`Foto profil ${talent.name}`}
                          className="avatar-sm"
                          width="48"
                          height="48"
                        />
                      </td>
                      <td className="fw-semibold">{talent.name}</td>
                      <td>{talent.skill}</td>
                      <td><span className="text-primary fw-semibold">{talent.priceFormatted}</span></td>
                      <td>
                        <span className="badge bg-warning text-dark">⭐ {talent.rating}</span>
                        <small className="text-muted ms-1">({talent.reviews})</small>
                      </td>
                      <td>{talent.orders}</td>
                      <td>
                        <Link to={talent.link} className="btn btn-sm btn-outline-primary" aria-label={`Lihat detail jasa ${talent.name}`}>
                          Lihat Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section id="kartu-talent" aria-labelledby="judul-kartu">
          <h2 id="judul-kartu" className="h5 fw-semibold mb-1">Jelajahi Talent</h2>
          <p className="text-muted small mb-4">Temukan talent pilihan terbaik berdasarkan bidang dan kebutuhan proyekmu.</p>

          <div className="row g-4">
            {filteredTalents.map((talent) => (
              <div key={talent.id} className="col-sm-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <img src={talent.avatar} alt={`Foto profil ${talent.name}`} className="card-img-top img-cover" />
                  <div className="card-body d-flex flex-column">
                    <h3 className="card-title h6 fw-bold mb-1">{talent.name}</h3>
                    <p className="text-muted small mb-1">{talent.skill}</p>
                    <p className="fw-semibold text-primary small mb-1">Mulai dari {talent.priceFormatted}</p>
                    <p className="text-muted small mb-3">
                      <span className="badge bg-warning text-dark me-1">⭐ {talent.rating}</span>
                      {talent.orders}
                    </p>
                    <Link
                      className="btn btn-primary btn-sm mt-auto"
                      to={talent.link}
                      aria-label={`Lihat jasa ${talent.name}`}
                    >
                      Lihat Jasa
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
