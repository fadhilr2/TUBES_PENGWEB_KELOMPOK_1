import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  useEffect(() => {
    document.title = 'SewaSkill — Temukan Talent Terbaik untuk Proyekmu';
  }, []);

  return (
    <main>
      <section id="hero" className="hero" aria-labelledby="judul-utama">
        <div className="container hero__layout">
          <div className="hero__content">
            <p className="eyebrow">Jasa digital tepercaya dalam satu tempat</p>
            <h1 id="judul-utama">Temukan Ahlinya, Selesaikan Proyekmu</h1>
            <p className="hero__lead">
              SewaSkill mempertemukanmu dengan talent digital untuk berbagai kebutuhan,
              mulai dari desain hingga pemrograman. Temukan jasa yang sesuai dengan
              kebutuhan dan anggaran proyekmu dengan lebih mudah.
            </p>
            <div className="hero__actions">
              <Link className="button button--primary" to="/katalog">
                <img className="button__icon" src="/assets/icons/search.svg" alt="" aria-hidden="true" />
                <span>Cari Talent</span>
              </Link>
              <Link className="button button--secondary" to="/tambah-jasa">
                <img className="button__icon" src="/assets/icons/briefcase.svg" alt="" aria-hidden="true" />
                <span>Daftar Jasa</span>
              </Link>
            </div>
          </div>
          <div className="hero__media">
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&amp;fit=crop&amp;w=1200&amp;q=80"
              alt="Sekelompok talent digital berdiskusi dan bekerja bersama menggunakan laptop"
              width="1200"
              height="800"
            />
            <div className="hero__proof">
              <span className="hero__proof-number">500+</span>
              <span>Talent siap membantu</span>
            </div>
          </div>
        </div>
      </section>

      <section id="kategori-populer" className="section" aria-labelledby="judul-kategori">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Pilihan terpopuler</p>
            <h2 id="judul-kategori">Kategori Jasa Populer</h2>
            <p>Pilih kategori yang paling sesuai untuk membantu menyelesaikan proyekmu.</p>
          </div>

          <div className="category-grid">
            <article className="category-card">
              <img
                src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&amp;fit=crop&amp;w=600&amp;q=80"
                alt="Editor video menyusun potongan rekaman pada layar komputer"
                width="600"
                height="400"
              />
              <div className="category-card__content">
                <h3>Edit Video</h3>
                <p>Jadikan rekamanmu lebih menarik untuk konten media sosial, promosi, maupun dokumentasi.</p>
                <Link to="/katalog" aria-label="Lihat jasa Edit Video">
                  <span>Lihat Jasa</span>
                  <img className="category-card__link-icon" src="/assets/icons/arrow-right.svg" alt="" aria-hidden="true" />
                </Link>
              </div>
            </article>

            <article className="category-card">
              <img
                src="https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&amp;fit=crop&amp;w=600&amp;q=80"
                alt="Desainer grafis membuat ilustrasi berwarna pada meja kerja"
                width="600"
                height="400"
              />
              <div className="category-card__content">
                <h3>Desain Thumbnail</h3>
                <p>Dapatkan thumbnail kreatif yang membantu kontenmu tampil lebih menonjol dan profesional.</p>
                <Link to="/katalog" aria-label="Lihat jasa Desain Thumbnail">
                  <span>Lihat Jasa</span>
                  <img className="category-card__link-icon" src="/assets/icons/arrow-right.svg" alt="" aria-hidden="true" />
                </Link>
              </div>
            </article>

            <article className="category-card">
              <img
                src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&amp;fit=crop&amp;w=600&amp;q=80"
                alt="Programmer menulis kode aplikasi pada laptop"
                width="600"
                height="400"
              />
              <div className="category-card__content">
                <h3>Tutor Koding</h3>
                <p>Pelajari dasar pemrograman atau tingkatkan kemampuan koding bersama tutor pilihanmu.</p>
                <Link to="/katalog" aria-label="Lihat jasa Tutor Koding">
                  <span>Lihat Jasa</span>
                  <img className="category-card__link-icon" src="/assets/icons/arrow-right.svg" alt="" aria-hidden="true" />
                </Link>
              </div>
            </article>

            <article className="category-card">
              <img
                src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&amp;fit=crop&amp;w=600&amp;q=80"
                alt="Penulis menyusun ide konten dalam buku catatan di meja kerja"
                width="600"
                height="400"
              />
              <div className="category-card__content">
                <h3>Penulisan Konten</h3>
                <p>Bangun komunikasi yang lebih kuat melalui artikel, caption, dan naskah yang sesuai kebutuhanmu.</p>
                <Link to="/katalog" aria-label="Lihat jasa Penulisan Konten">
                  <span>Lihat Jasa</span>
                  <img className="category-card__link-icon" src="/assets/icons/arrow-right.svg" alt="" aria-hidden="true" />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="keunggulan" className="section section--dark" aria-labelledby="judul-keunggulan">
        <div className="container advantages">
          <div className="section-heading section-heading--light">
            <p className="eyebrow">Lebih tenang saat memesan</p>
            <h2 id="judul-keunggulan">Mengapa SewaSkill?</h2>
            <p>Platform yang dirancang untuk membuat proses mencari dan memesan jasa terasa sederhana.</p>
          </div>
          <ul className="advantage-list">
            <li>
              <img className="advantage-list__icon" src="/assets/icons/users.svg" alt="" aria-hidden="true" />
              <span>Lebih dari 500 talent siap membantu berbagai kebutuhan digital</span>
            </li>
            <li>
              <img className="advantage-list__icon" src="/assets/icons/star.svg" alt="" aria-hidden="true" />
              <span>Rating dan ulasan ditampilkan secara transparan</span>
            </li>
            <li>
              <img className="advantage-list__icon" src="/assets/icons/wallet.svg" alt="" aria-hidden="true" />
              <span>Pilihan harga terjangkau, mulai dari Rp25.000</span>
            </li>
            <li>
              <img className="advantage-list__icon" src="/assets/icons/mouse-pointer-click.svg" alt="" aria-hidden="true" />
              <span>Proses pemesanan jasa mudah dan cepat</span>
            </li>
          </ul>
        </div>
      </section>

      <section id="testimoni" className="section" aria-labelledby="judul-testimoni">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Cerita pengguna</p>
            <h2 id="judul-testimoni">Apa Kata Mereka?</h2>
          </div>

          <div className="testimonial-grid">
            <blockquote>
              <p>“Saya bisa menemukan editor video yang memahami gaya konten usaha saya. Komunikasinya jelas dan hasilnya sesuai kebutuhan.”</p>
              <footer><cite>Rina, pemilik usaha kuliner</cite></footer>
            </blockquote>

            <blockquote>
              <p>“Tutor kodingnya sabar menjelaskan dari dasar. Materi yang sebelumnya terasa sulit akhirnya jadi lebih mudah dipahami.”</p>
              <footer><cite>Dimas, mahasiswa</cite></footer>
            </blockquote>
          </div>
        </div>
      </section>
    </main>
  );
}
