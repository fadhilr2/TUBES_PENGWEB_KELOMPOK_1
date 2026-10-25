import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  useEffect(() => {
    document.title = 'SewaSkill — Temukan Talent Terbaik untuk Proyekmu';
  }, []);

  return (
    <main>
      <section id="hero" className="text-white py-5  bg-primary" aria-labelledby="judul-utama">
        <div className="container py-4">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <p className="text-white-50 fw-semibold text-uppercase small mb-2" style={{ letterSpacing: '.08em' }}>
                Jasa digital tepercaya dalam satu tempat
              </p>
              <h1 id="judul-utama" className="display-5 fw-bold mb-3">
                Temukan Ahlinya, Selesaikan Proyekmu
              </h1>
              <p className="lead text-white-50 mb-4">
                SewaSkill mempertemukanmu dengan talent digital untuk berbagai kebutuhan,
                mulai dari desain hingga pemrograman.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link className="btn btn-light btn-lg fw-semibold" to="/katalog">
                  Cari Talent
                </Link>
                <Link className="btn btn-outline-light btn-lg" to="/tambah-jasa">
                  Daftar Jasa
                </Link>
              </div>
            </div>
            <div className="col-lg-6 position-relative text-center">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80"
                alt="Tim talent digital berdiskusi bersama"
                className="img-fluid rounded-4 shadow-lg"
                width="800"
                height="533"
              />
              <div className="position-absolute bottom-0 start-50 translate-middle-x mb-n3">
                <span className="badge bg-white text-dark shadow px-3 py-2 fs-6">
                  <strong>500+</strong> Talent siap membantu
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="kategori-populer" className="py-5 bg-light" aria-labelledby="judul-kategori">
        <div className="container">
          <div className="text-center mb-5">
            <p className="text-primary fw-semibold text-uppercase small" style={{ letterSpacing: '.08em' }}>Pilihan terpopuler</p>
            <h2 id="judul-kategori" className="fw-bold">Kategori Jasa Populer</h2>
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
                      Lihat Jasa →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="keunggulan" className="py-5 bg-primary text-white" aria-labelledby="judul-keunggulan">
        <div className="container">
          <div className="text-center mb-5">
            <p className="text-white-50 fw-semibold text-uppercase small" style={{ letterSpacing: '.08em' }}>Lebih tenang saat memesan</p>
            <h2 id="judul-keunggulan" className="fw-bold">Mengapa SewaSkill?</h2>
            <p className="text-white-50">Platform yang dirancang agar proses mencari jasa terasa sederhana.</p>
          </div>

          <div className="row g-4 justify-content-center">
            {[
              { icon: '👥', text: 'Lebih dari 500 talent siap membantu berbagai kebutuhan digital' },
              { icon: '⭐', text: 'Rating dan ulasan ditampilkan secara transparan' },
              { icon: '💸', text: 'Pilihan harga terjangkau, mulai dari Rp25.000' },
              { icon: '⚡', text: 'Proses pemesanan jasa mudah dan cepat' },
            ].map((item) => (
              <div key={item.text} className="col-sm-6 col-lg-3">
                <div className="text-center p-3">
                  <div className="fs-1 mb-2">{item.icon}</div>
                  <p className="mb-0 text-white-75">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimoni" className="py-5" aria-labelledby="judul-testimoni">
        <div className="container">
          <div className="text-center mb-5">
            <p className="text-primary fw-semibold text-uppercase small" style={{ letterSpacing: '.08em' }}>Cerita pengguna</p>
            <h2 id="judul-testimoni" className="fw-bold">Apa Kata Mereka?</h2>
          </div>

          <div className="row g-4 justify-content-center">
            <div className="col-md-6">
              <blockquote className="card border-0 shadow-sm p-4 h-100">
                <p className="card-text fst-italic">
                  "Saya bisa menemukan editor video yang memahami gaya konten usaha saya. Komunikasinya jelas dan hasilnya sesuai kebutuhan."
                </p>
                <footer className="blockquote-footer mt-2">
                  <cite>Rina, pemilik usaha kuliner</cite>
                </footer>
              </blockquote>
            </div>
            <div className="col-md-6">
              <blockquote className="card border-0 shadow-sm p-4 h-100">
                <p className="card-text fst-italic">
                  "Tutor kodingnya sabar menjelaskan dari dasar. Materi yang sebelumnya terasa sulit akhirnya jadi lebih mudah dipahami."
                </p>
                <footer className="blockquote-footer mt-2">
                  <cite>Dimas, mahasiswa</cite>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container text-center py-3">
          <h2 className="fw-bold mb-3">Siap Menemukan Talent Terbaikmu?</h2>
          <p className="text-muted mb-4">Bergabung bersama ribuan pengguna SewaSkill hari ini.</p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link className="btn btn-primary btn-lg px-4" to="/katalog">Jelajahi Katalog</Link>
            <Link className="btn btn-outline-primary btn-lg px-4" to="/tambah-jasa">Daftarkan Jasamu</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
