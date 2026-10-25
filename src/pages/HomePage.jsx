import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'SewaSkill - Temukan Talent Terbaik untuk Proyekmu';

    let isMounted = true;
    fetch('/data/testimonials.json')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat ulasan pengguna');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setTestimonials(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main>
      <section
        className="text-white py-5 position-relative"
        style={{
          backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url("https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container py-5 text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <p className="text-white-50 fw-semibold text-uppercase small mb-2" style={{ letterSpacing: '.08em' }}>
                Jasa digital tepercaya dalam satu tempat
              </p>
              <h1 className="display-4 fw-bold mb-3">
                Temukan Ahlinya, Selesaikan Proyekmu
              </h1>
              <p className="lead text-white-50 mb-4 mx-auto" style={{ maxWidth: '650px' }}>
                SewaSkill mempertemukanmu dengan talent digital untuk berbagai kebutuhan,
                mulai dari desain hingga pemrograman.
              </p>
              <div className="d-flex justify-content-center flex-wrap gap-3">
                <Link className="btn btn-primary btn-lg px-4" to="/katalog">
                  Cari Talent
                </Link>
                <Link className="btn btn-outline-light btn-lg px-4" to="/tambah-jasa">
                  Daftar Jasa
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <p className="text-primary fw-semibold text-uppercase small" style={{ letterSpacing: '.08em' }}>Pilihan terpopuler</p>
            <h2 className="fw-bold">Kategori Jasa Populer</h2>
            <p className="text-muted">Pilih kategori yang paling sesuai untuk proyekmu.</p>
          </div>

          <div className="row g-4">
            {[
              {
                img: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
                alt: 'Editor video',
                title: 'Edit Video',
                desc: 'Jadikan rekamanmu lebih menarik untuk konten media sosial, promosi, maupun dokumentasi.',
              },
              {
                img: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
                alt: 'Desainer grafis',
                title: 'Desain Thumbnail',
                desc: 'Dapatkan thumbnail kreatif yang membantu kontenmu tampil lebih menonjol dan profesional.',
              },
              {
                img: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80',
                alt: 'Programmer',
                title: 'Tutor Koding',
                desc: 'Pelajari dasar pemrograman atau tingkatkan skill koding bersama tutor pilihanmu.',
              },
              {
                img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
                alt: 'Penulis konten',
                title: 'Penulisan Konten',
                desc: 'Bangun komunikasi yang lebih kuat melalui artikel, caption, dan naskah profesional.',
              },
            ].map((cat) => (
              <div key={cat.title} className="col-sm-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm">
                  <img
                    src={cat.img}
                    alt={cat.alt}
                    className="card-img-top object-fit-cover"
                    style={{ height: '220px' }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h3 className="card-title h5 fw-semibold">{cat.title}</h3>
                    <p className="card-text text-muted small flex-grow-1">{cat.desc}</p>
                    <Link to="/katalog" className="btn btn-outline-primary btn-sm mt-2" aria-label={`Lihat jasa ${cat.title}`}>
                      Lihat Jasa
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="text-center mb-5">
            <p className="text-white-50 fw-semibold text-uppercase small" style={{ letterSpacing: '.08em' }}>Lebih tenang saat memesan</p>
            <h2 className="fw-bold">Mengapa SewaSkill?</h2>
            <p className="text-white-50">Platform yang dirancang agar proses mencari jasa terasa sederhana.</p>
          </div>

          <div className="row g-4 justify-content-center">
            {[
              { stat: '500+', label: 'Talent Aktif', desc: 'Siap membantu berbagai proyek digital' },
              { stat: '4.9/5', label: 'Rating Kepuasan', desc: 'Ulasan transparan dari klien terverifikasi' },
              { stat: 'Rp25rb', label: 'Harga Mulai', desc: 'Pilihan biaya terjangkau dan ramah kantong' },
              { stat: '100%', label: 'Garansi Aman', desc: 'Pembayaran terlindungi hingga pekerjaan selesai' },
            ].map((item) => (
              <div key={item.label} className="col-sm-6 col-lg-3">
                <div className="bg-white bg-opacity-10 border border-white border-opacity-25 rounded p-4 text-center h-100">
                  <div className="display-6 fw-bold mb-1">{item.stat}</div>
                  <h3 className="h6 fw-semibold text-white mb-2">{item.label}</h3>
                  <p className="small text-white-50 mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <p className="text-primary fw-semibold text-uppercase small" style={{ letterSpacing: '.08em' }}>Cerita pengguna</p>
            <h2 className="fw-bold">Apa Kata Mereka?</h2>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Memuat ulasan...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-warning text-center mx-auto" style={{ maxWidth: '500px' }}>
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="row g-4 justify-content-center">
              {testimonials.map((item) => (
                <div key={item.id} className="col-md-6">
                  <blockquote className="card border-0 shadow-sm p-4 h-100">
                    <p className="card-text fst-italic">
                      "{item.quote}"
                    </p>
                    <footer className="blockquote-footer mt-2">
                      <cite>{item.author}</cite>
                    </footer>
                  </blockquote>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
