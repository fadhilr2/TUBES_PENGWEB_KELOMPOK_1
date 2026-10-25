import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function DetailJasaPage() {
  useEffect(() => {
    document.title = 'Rizky Aditya - Edit Video | SewaSkill';
  }, []);

  return (
    <main className="py-5">
      <div className="container">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Beranda</Link></li>
            <li className="breadcrumb-item"><Link to="/katalog">Katalog Jasa</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Rizky Aditya - Edit Video</li>
          </ol>
        </nav>

        <article id="profil-talent">
          <div className="row gy-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start gap-4 flex-wrap">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
                      alt="Foto profil Rizky Aditya, editor video profesional"
                      className="avatar-lg flex-shrink-0"
                      width="130"
                      height="130"
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        <span className="badge bg-success">✓ Tersedia - Siap menerima order</span>
                        <span className="badge bg-warning text-dark">⭐ 4.9 / 5.0 (120 ulasan)</span>
                      </div>
                      <h1 className="h3 fw-bold mb-1">Rizky Aditya</h1>
                      <p className="text-muted mb-0">Spesialis Edit Video Pendek Media Sosial</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="row g-3">
                    {[
                      { icon: '💼', label: 'Bidang Keahlian', val: 'Edit Video Pendek (Reels / TikTok / YouTube Shorts)' },
                      { icon: '📍', label: 'Lokasi', val: 'Bandung, Jawa Barat' },
                      { icon: '🕐', label: 'Bergabung Sejak', val: 'Januari 2024' },
                      { icon: '📦', label: 'Total Order Selesai', val: '320 order' },
                      { icon: '⭐', label: 'Rating', val: '4.9 / 5.0 (berdasarkan 120 ulasan)' },
                      { icon: '✅', label: 'Status', val: 'Tersedia - Siap menerima order' },
                    ].map((item) => (
                      <div key={item.label} className="col-sm-6">
                        <div className="d-flex gap-2 align-items-start">
                          <span>{item.icon}</span>
                          <div>
                            <div className="text-muted small">{item.label}</div>
                            <div className="fw-semibold small">{item.val}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h2 className="h5 fw-semibold mb-3">Tentang Saya</h2>
                  <p className="text-muted mb-0">
                    Halo! Saya Rizky, seorang video editor berpengalaman 3 tahun yang berspesialisasi dalam konten media sosial berdurasi pendek.
                    Saya telah membantu lebih dari 50 kreator konten dan brand lokal meningkatkan engagement mereka melalui video yang engaging dan profesional.
                    Tools yang saya kuasai: Adobe Premiere Pro, CapCut Pro, dan DaVinci Resolve.
                  </p>
                </div>
              </div>

              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h3 className="h6 fw-semibold mb-3">Keahlian &amp; Software</h3>
                  <div className="mb-3">
                    {['Adobe Premiere Pro', 'CapCut Pro', 'DaVinci Resolve', 'Color Grading', 'Dynamic Subtitles', 'Sound Design'].map((s) => (
                      <span key={s} className="skill-pill">{s}</span>
                    ))}
                  </div>

                  <h3 className="h6 fw-semibold mb-3">Keunggulan Layanan</h3>
                  <ul className="list-unstyled mb-0">
                    {[
                      'Pengerjaan tepat waktu dengan standar ekspor resolusi tinggi',
                      'Rasio aspek disesuaikan khusus untuk Reels, TikTok, dan Shorts (9:16)',
                      'Konsultasi konsep dan alur video sebelum proses editing dimulai',
                    ].map((feat) => (
                      <li key={feat} className="d-flex gap-2 mb-2">
                        <span className="text-success fw-bold">✓</span>
                        <span className="text-muted small">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <aside className="card border-0 shadow-sm sticky-top" style={{ top: '80px' }}>
                <div className="card-body p-4">
                  <h2 className="h5 fw-semibold mb-3">Pesan Jasa Ini</h2>
                  <div className="bg-light rounded p-3 mb-3">
                    <p className="text-muted small mb-1">Harga Mulai</p>
                    <p className="fw-bold fs-4 text-primary mb-0">Rp 50.000</p>
                  </div>
                  <p className="small text-muted mb-4">
                    🕐 <strong>Waktu Pengerjaan:</strong> 2-3 hari kerja
                  </p>
                  <div className="d-grid gap-2">
                    <Link className="btn btn-primary" to="/order">
                      Pesan Sekarang
                    </Link>
                    <Link className="btn btn-outline-secondary" to="/katalog">
                      Kembali ke Katalog
                    </Link>
                  </div>
                  <p className="text-muted small mt-3 mb-0 text-center">
                    🔒 Garansi revisi dan perlindungan pembayaran transaksi aman.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </article>

        <section id="portofolio" className="mt-5">
          <h2 className="h5 fw-semibold mb-1">Sampel Karya &amp; Portofolio</h2>
          <p className="text-muted small mb-4">Berikut adalah contoh karya yang pernah saya buat untuk klien:</p>

          <div className="row g-4">
            {[
              { src: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80', caption: 'Edit Video Reels - Brand Fashion Lokal "StyleIn" (Januari 2025)' },
              { src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', caption: 'Edit Video TikTok - Akun Kuliner @makanankece (Februari 2025)' },
              { src: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', caption: 'Video Promosi Produk - Skincare Brand "GlowUp" (Maret 2025)' },
              { src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', caption: 'Thumbnail YouTube - Konten Teknologi "Review Laptop Baru" (April 2025)' },
            ].map((item) => (
              <div key={item.caption} className="col-sm-6 col-lg-3">
                <figure className="mb-0">
                  <img
                    src={item.src}
                    alt={item.caption}
                    className="portfolio-img rounded shadow-sm w-100"
                    loading="lazy"
                  />
                  <figcaption className="text-muted small mt-2">{item.caption}</figcaption>
                </figure>
              </div>
            ))}
          </div>
        </section>

        <section id="paket-layanan" className="mt-5">
          <h2 className="h5 fw-semibold mb-1">Paket Layanan &amp; Harga</h2>
          <p className="text-muted small mb-4">Perbandingan lengkap cakupan layanan untuk memilih paket yang paling tepat.</p>

          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <caption className="visually-hidden">Perbandingan paket layanan edit video oleh Rizky Aditya</caption>
              <thead className="table-primary">
                <tr>
                  <th scope="col">Fitur</th>
                  <th scope="col">Paket Basic</th>
                  <th scope="col" className="table-warning">
                    Paket Standard <span className="badge bg-warning text-dark ms-1">Populer</span>
                  </th>
                  <th scope="col">Paket Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Harga', 'Rp 50.000', 'Rp 100.000', 'Rp 200.000'],
                  ['Durasi Video', 'Maks. 30 detik', 'Maks. 60 detik', 'Maks. 3 menit'],
                  ['Jumlah Revisi', '1x revisi', '3x revisi', 'Revisi tidak terbatas'],
                  ['Subtitel / Caption', 'Tidak', 'Ya', 'Ya'],
                  ['Tambah Musik', 'Tidak', 'Ya', 'Ya (custom)'],
                  ['Waktu Pengerjaan', '3 hari', '2 hari', '1 hari (prioritas)'],
                  ['Format Output', 'MP4 720p', 'MP4 1080p', 'MP4 4K + RAW file'],
                ].map(([feat, basic, std, prem]) => (
                  <tr key={feat}>
                    <th scope="row" className="fw-semibold">{feat}</th>
                    <td>{basic}</td>
                    <td className="table-warning fw-semibold">{std}</td>
                    <td>{prem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="ulasan-klien" className="mt-5">
          <h2 className="h5 fw-semibold mb-1">Ulasan Klien (120 Ulasan)</h2>
          <p className="text-muted small mb-4">Kepuasan dan pengalaman langsung dari para klien yang telah bekerja sama.</p>

          <div className="row g-4">
            {[
              { rating: '5/5', paket: 'Paket Standard', quote: '"Rizky sangat profesional dan hasilnya melebihi ekspektasi saya! Video Reels-nya langsung viral dengan 50K tayangan dalam 24 jam. Pasti akan repeat order!"', cite: 'Dinda R., pemilik brand @styleinclo', meta: 'Februari 2025' },
              { rating: '5/5', paket: 'Paket Basic', quote: '"Cepat, responsif, dan hasilnya kece banget. Revisi dilayani dengan sabar tanpa protes. Rekomen banget buat yang butuh edit video cepat!"', cite: 'Andi K., kreator konten kuliner', meta: 'Maret 2025' },
              { rating: '4/5', paket: 'Paket Standard', quote: '"Hasil editannya smooth dan on-trend. Suka banget sama transisi yang dia pakai. Harga terjangkau untuk kualitas sebagus ini."', cite: 'Lestari M., kreator lifestyle', meta: 'April 2025' },
            ].map((r) => (
              <div key={r.cite} className="col-md-4">
                <div className="card border-0 shadow-sm h-100 p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge bg-warning text-dark">⭐ {r.rating}</span>
                    <span className="badge bg-light text-dark border">{r.paket}</span>
                  </div>
                  <blockquote className="mb-2">
                    <p className="fst-italic text-muted small">{r.quote}</p>
                  </blockquote>
                  <cite className="fw-semibold small d-block">- {r.cite}</cite>
                  <p className="text-muted small mb-0 mt-1">{r.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="cta-order" className="mt-5">
          <div className="bg-primary text-white rounded-4 p-5 text-center">
            <h2 className="fw-bold mb-2">Tertarik dengan Jasa Ini?</h2>
            <p className="text-white-50 mb-4">Segera pesan sebelum slot penuh! Rizky saat ini hanya menerima maksimal 5 order aktif.</p>
            <Link className="btn btn-light btn-lg fw-semibold px-4" to="/order">
              Pesan Sekarang - Mulai Rp 50.000
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
