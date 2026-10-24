import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function DetailJasaPage() {
  useEffect(() => {
    document.body.className = 'page-service-detail';
    document.title = 'Rizky Aditya — Edit Video | SewaSkill';
    return () => {
      document.body.className = '';
    };
  }, []);

  return (
    <main>
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link to="/">Beranda</Link>
            </li>
            <li className="breadcrumb__item">
              <Link to="/katalog">Katalog Jasa</Link>
            </li>
            <li className="breadcrumb__item" aria-current="page">
              Rizky Aditya — Edit Video
            </li>
          </ol>
        </nav>

        <article id="profil-talent" className="profile-hero">
          <div className="profile-main">
            <div className="profile-header-card">
              <div className="profile-avatar-wrap">
                <img
                  className="profile-avatar"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&amp;fit=crop&amp;w=400&amp;q=80"
                  alt="Foto profil Rizky Aditya, editor video profesional spesialis Reels dan TikTok dengan pengalaman 3 tahun"
                  width="180"
                  height="180"
                />
              </div>

              <div className="profile-header-info">
                <div className="profile-status-wrap">
                  <span className="badge badge--success">
                    <img className="badge__icon" src="/assets/icons/check.svg" alt="" aria-hidden="true" />
                    <span>Tersedia — Siap menerima order</span>
                  </span>
                  <span className="rating">
                    <img className="rating__icon" src="/assets/icons/star.svg" alt="" aria-hidden="true" />
                    <span>4.9 / 5.0 (120 ulasan)</span>
                  </span>
                </div>
                <h1>Rizky Aditya</h1>
                <p className="profile-role">Spesialis Edit Video Pendek Media Sosial</p>
              </div>
            </div>

            <div className="profile-meta">
              <div className="profile-meta__item">
                <img className="profile-meta__icon" src="/assets/icons/briefcase.svg" alt="" aria-hidden="true" />
                <p>
                  <strong>Bidang Keahlian:</strong> Edit Video Pendek (Reels / TikTok / YouTube Shorts)
                </p>
              </div>
              <div className="profile-meta__item">
                <img className="profile-meta__icon" src="/assets/icons/map-pin.svg" alt="" aria-hidden="true" />
                <p>
                  <strong>Lokasi:</strong> Bandung, Jawa Barat
                </p>
              </div>
              <div className="profile-meta__item">
                <img className="profile-meta__icon" src="/assets/icons/clock.svg" alt="" aria-hidden="true" />
                <p>
                  <strong>Bergabung Sejak:</strong> Januari 2024
                </p>
              </div>
              <div className="profile-meta__item">
                <img className="profile-meta__icon" src="/assets/icons/users.svg" alt="" aria-hidden="true" />
                <p>
                  <strong>Total Order Selesai:</strong> 320 order
                </p>
              </div>
              <div className="profile-meta__item">
                <img className="profile-meta__icon" src="/assets/icons/star.svg" alt="" aria-hidden="true" />
                <p>
                  <strong>Rating:</strong> 4.9 / 5.0 (berdasarkan 120 ulasan)
                </p>
              </div>
              <div className="profile-meta__item">
                <img className="profile-meta__icon" src="/assets/icons/check.svg" alt="" aria-hidden="true" />
                <p>
                  <strong>Status:</strong> Tersedia — Siap menerima order
                </p>
              </div>
            </div>

            <div className="profile-bio">
              <h2>Tentang Saya</h2>
              <p>
                Halo! Saya Rizky, seorang video editor berpengalaman 3 tahun yang berspesialisasi dalam konten media sosial berdurasi pendek.
                Saya telah membantu lebih dari 50 kreator konten dan brand lokal meningkatkan engagement mereka melalui video yang engaging dan profesional.
                Tools yang saya kuasai: Adobe Premiere Pro, CapCut Pro, dan DaVinci Resolve.
              </p>
            </div>

            <div className="profile-skills">
              <h3>Keahlian &amp; Software</h3>
              <ul className="skills-list">
                <li><span className="skill-tag">Adobe Premiere Pro</span></li>
                <li><span className="skill-tag">CapCut Pro</span></li>
                <li><span className="skill-tag">DaVinci Resolve</span></li>
                <li><span className="skill-tag">Color Grading</span></li>
                <li><span className="skill-tag">Dynamic Subtitles</span></li>
                <li><span className="skill-tag">Sound Design</span></li>
              </ul>

              <h3>Keunggulan Layanan</h3>
              <ul className="features-list">
                <li>
                  <img className="features-list__icon" src="/assets/icons/check.svg" alt="" aria-hidden="true" />
                  <span>Pengerjaan tepat waktu dengan standar ekspor resolusi tinggi</span>
                </li>
                <li>
                  <img className="features-list__icon" src="/assets/icons/check.svg" alt="" aria-hidden="true" />
                  <span>Rasio aspek disesuaikan khusus untuk platform Reels, TikTok, dan Shorts (9:16)</span>
                </li>
                <li>
                  <img className="features-list__icon" src="/assets/icons/check.svg" alt="" aria-hidden="true" />
                  <span>Konsultasi konsep dan alur video sebelum proses editing dimulai</span>
                </li>
              </ul>
            </div>
          </div>

          <aside className="profile-summary profile-card">
            <h2>Pesan Jasa Ini</h2>
            <div className="profile-card__price-box">
              <p className="profile-card__label">Harga Mulai</p>
              <p className="profile-card__amount">
                <strong>Mulai dari:</strong> Rp 50.000
              </p>
            </div>
            <div className="profile-card__delivery">
              <img className="profile-card__icon" src="/assets/icons/clock.svg" alt="" aria-hidden="true" />
              <p>
                <strong>Waktu Pengerjaan:</strong> 2–3 hari kerja
              </p>
            </div>
            <div className="profile-card__actions cta-actions">
              <Link className="button button--primary" to="/order">
                <img className="button__icon" src="/assets/icons/arrow-right-white.svg" alt="" aria-hidden="true" />
                <span>Pesan Sekarang</span>
              </Link>
              <Link className="button button--secondary" to="/katalog">
                <span>Kembali ke Katalog</span>
              </Link>
            </div>
            <div className="profile-card__guarantee">
              <p>Garansi revisi dan perlindungan pembayaran transaksi aman.</p>
            </div>
          </aside>
        </article>

        <section id="portofolio" className="section section--portfolio">
          <div className="section-heading">
            <h2>Sampel Karya &amp; Portofolio</h2>
            <p>Berikut adalah contoh karya yang pernah saya buat untuk klien:</p>
          </div>

          <div className="portfolio-grid">
            <figure className="portfolio-item">
              <img
                src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&amp;fit=crop&amp;w=800&amp;q=80"
                alt="Sampel edit video Reels Instagram untuk brand fashion lokal dengan transisi dinamis dan teks animasi berwarna putih"
                width="300"
                height="200"
                loading="lazy"
              />
              <figcaption>Edit Video Reels — Brand Fashion Lokal &quot;StyleIn&quot; (Januari 2025)</figcaption>
            </figure>

            <figure className="portfolio-item">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&amp;fit=crop&amp;w=800&amp;q=80"
                alt="Sampel edit video TikTok untuk akun kuliner dengan efek slow motion dan musik trending"
                width="300"
                height="200"
                loading="lazy"
              />
              <figcaption>Edit Video TikTok — Akun Kuliner @makanankece (Februari 2025)</figcaption>
            </figure>

            <figure className="portfolio-item">
              <img
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&amp;fit=crop&amp;w=800&amp;q=80"
                alt="Sampel video promosi produk skincare berdurasi 30 detik dengan warna pastel dan teks produk"
                width="300"
                height="200"
                loading="lazy"
              />
              <figcaption>Video Promosi Produk — Skincare Brand &quot;GlowUp&quot; (Maret 2025)</figcaption>
            </figure>

            <figure className="portfolio-item">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&amp;fit=crop&amp;w=800&amp;q=80"
                alt="Sampel thumbnail YouTube bertema teknologi dengan warna biru dan grafis laptop yang modern"
                width="300"
                height="200"
                loading="lazy"
              />
              <figcaption>Thumbnail YouTube — Konten Teknologi &quot;Review Laptop Baru&quot; (April 2025)</figcaption>
            </figure>
          </div>
        </section>

        <section id="paket-layanan" className="section section--packages">
          <div className="section-heading">
            <h2>Paket Layanan &amp; Harga</h2>
            <p>Perbandingan lengkap cakupan layanan untuk memilih paket yang paling tepat bagi kebutuhan kontenmu.</p>
          </div>

          <div className="table-wrapper">
            <table>
              <caption>Perbandingan paket layanan edit video oleh Rizky Aditya</caption>
              <thead>
                <tr>
                  <th scope="col">Fitur</th>
                  <th scope="col">Paket Basic</th>
                  <th scope="col" className="is-recommended">
                    Paket Standard <span className="badge badge--recommended">Populer</span>
                  </th>
                  <th scope="col">Paket Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Harga</th>
                  <td>Rp 50.000</td>
                  <td className="is-recommended">Rp 100.000</td>
                  <td>Rp 200.000</td>
                </tr>
                <tr>
                  <th scope="row">Durasi Video</th>
                  <td>Maks. 30 detik</td>
                  <td className="is-recommended">Maks. 60 detik</td>
                  <td>Maks. 3 menit</td>
                </tr>
                <tr>
                  <th scope="row">Jumlah Revisi</th>
                  <td>1x revisi</td>
                  <td className="is-recommended">3x revisi</td>
                  <td>Revisi tidak terbatas</td>
                </tr>
                <tr>
                  <th scope="row">Subtitel / Caption</th>
                  <td>Tidak</td>
                  <td className="is-recommended">Ya</td>
                  <td>Ya</td>
                </tr>
                <tr>
                  <th scope="row">Tambah Musik</th>
                  <td>Tidak</td>
                  <td className="is-recommended">Ya</td>
                  <td>Ya (custom)</td>
                </tr>
                <tr>
                  <th scope="row">Waktu Pengerjaan</th>
                  <td>3 hari</td>
                  <td className="is-recommended">2 hari</td>
                  <td>1 hari (prioritas)</td>
                </tr>
                <tr>
                  <th scope="row">Format Output</th>
                  <td>MP4 720p</td>
                  <td className="is-recommended">MP4 1080p</td>
                  <td>MP4 4K + RAW file</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="ulasan-klien" className="section section--reviews">
          <div className="section-heading">
            <h2>Ulasan Klien (120 Ulasan)</h2>
            <p>Kepuasan dan pengalaman langsung dari para klien yang telah bekerja sama dengan Rizky Aditya.</p>
          </div>

          <div className="reviews-grid">
            <article className="review-card">
              <div className="review-card__header">
                <span className="rating">
                  <img className="rating__icon" src="/assets/icons/star.svg" alt="" aria-hidden="true" />
                  <span>5/5</span>
                </span>
                <span className="badge badge--soft">Paket Standard</span>
              </div>
              <blockquote>
                <p>&quot;Rizky sangat profesional dan hasilnya melebihi ekspektasi saya! Video Reels-nya langsung viral dengan 50K tayangan dalam 24 jam. Pasti akan repeat order!&quot;</p>
              </blockquote>
              <cite>— Dinda R., pemilik brand @styleinclo</cite>
              <p className="review-card__meta">Rating: 5/5 | Dipesan: Paket Standard | Februari 2025</p>
            </article>

            <article className="review-card">
              <div className="review-card__header">
                <span className="rating">
                  <img className="rating__icon" src="/assets/icons/star.svg" alt="" aria-hidden="true" />
                  <span>5/5</span>
                </span>
                <span className="badge badge--soft">Paket Basic</span>
              </div>
              <blockquote>
                <p>&quot;Cepat, responsif, dan hasilnya kece banget. Revisi dilayani dengan sabar tanpa protes. Rekomen banget buat yang butuh edit video cepat!&quot;</p>
              </blockquote>
              <cite>— Andi K., kreator konten kuliner</cite>
              <p className="review-card__meta">Rating: 5/5 | Dipesan: Paket Basic | Maret 2025</p>
            </article>

            <article className="review-card">
              <div className="review-card__header">
                <span className="rating">
                  <img className="rating__icon" src="/assets/icons/star.svg" alt="" aria-hidden="true" />
                  <span>4/5</span>
                </span>
                <span className="badge badge--soft">Paket Standard</span>
              </div>
              <blockquote>
                <p>&quot;Hasil editannya smooth dan on-trend. Suka banget sama transisi yang dia pakai. Harga terjangkau untuk kualitas sebagus ini.&quot;</p>
              </blockquote>
              <cite>— Lestari M., kreator lifestyle</cite>
              <p className="review-card__meta">Rating: 4/5 | Dipesan: Paket Standard | April 2025</p>
            </article>
          </div>
        </section>

        <section id="cta-order" className="section section--cta">
          <div className="cta-box">
            <h2>Tertarik dengan Jasa Ini?</h2>
            <p>Segera pesan sebelum slot penuh! Rizky saat ini hanya menerima maksimal 5 order aktif secara bersamaan.</p>
            <div className="cta-actions">
              <Link className="button button--primary" to="/order">
                <img className="button__icon" src="/assets/icons/arrow-right-white.svg" alt="" aria-hidden="true" />
                <span>Pesan Sekarang — Mulai Rp 50.000</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
