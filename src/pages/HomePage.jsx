import { Link } from 'react-router-dom';
import { useTitle } from '../hooks/useTitle';
import WorkGallery from '../components/WorkGallery';
import MemberHome from '../components/MemberHome';
import { skillHighlights } from '../siteContent';

function canHover() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function openService(event) {
  if (event.pointerType === 'mouse' && canHover()) {
    event.currentTarget.open = true;
  }
}

function closeService(event) {
  if (event.pointerType === 'mouse' && canHover()) {
    event.currentTarget.open = false;
  }
}

function clickService(event) {
  if (event.detail > 0 && canHover()) {
    event.preventDefault();
    event.currentTarget.parentElement.open = true;
  }
}

function Hero() {
  return (
    <div className="hero-shell">
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="tiny-star" aria-hidden="true">
              ✳
            </span>{' '}
            RUANG TEMU IDE &amp; KEAHLIAN
          </p>
          <h1 id="hero-title">
            Ide besarmu.
            <br />
            Skill terbaik.
            <br />
            <em>Jadi nyata.</em>
          </h1>
          <Link className="button button-white" to="/katalog">
            Temukan skill-mu{' '}
            <span className="button-arrow" aria-hidden="true">
              ↗
            </span>
          </Link>
        </div>
        <div className="hero-note">
          <span className="small-index">KOLABORASI DIMULAI DI SINI</span>
          <p>
            Dari tugas kecil sampai mimpi besar. Ketemu orang yang tepat untuk mewujudkan ide kamu.
          </p>
          <a className="hero-note-link" href="#layanan">
            Lihat pilihan skill <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="hero-highlights">
          <div>
            <strong>Skill pilihan.</strong>
            <span>SESUAI KEBUTUHANMU</span>
          </div>
          <div>
            <strong>Ide berjalan.</strong>
            <span>MULAI DARI SATU BRIEF</span>
          </div>
        </div>
        <div className="hero-bottom">
          <span>BUKAN SEKADAR JASA. SEBUAH KOLABORASI.</span>
          <a href="#tentang">
            Scroll untuk kenalan <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>
    </div>
  );
}

function PeoplePreview() {
  return (
    <div className="people-preview">
      <div className="people-stack" aria-hidden="true">
        <img
          src="/assets/images/portrait-clem.webp"
          alt=""
          width="112"
          height="112"
          loading="lazy"
        />
        <img
          src="/assets/images/portrait-michael.webp"
          alt=""
          width="112"
          height="112"
          loading="lazy"
        />
        <img
          src="/assets/images/portrait-abdul.webp"
          alt=""
          width="112"
          height="112"
          loading="lazy"
        />
      </div>
      <p>
        Ide bertemu orang kreatif.
        <br />
        <small>Foto ilustrasi · Wikimedia Commons</small>
      </p>
    </div>
  );
}

function SkillBadges() {
  const cards = [];
  for (const item of skillHighlights) {
    cards.push(
      <div className="col" key={item.title}>
        <a className="skill-card" href="#layanan">
          <img src={item.icon} alt="" width="160" height="160" loading="lazy" />
          <strong>{item.title}</strong>
          <small>{item.description}</small>
          <span className="skill-card-link" aria-hidden="true">
            Lihat layanan ↗
          </span>
        </a>
      </div>,
    );
  }

  return (
    <div className="skill-badges" aria-label="Keahlian tersedia">
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">{cards}</div>
    </div>
  );
}

function IntroSection() {
  return (
    <section className="intro paper" id="tentang" aria-labelledby="intro-title">
      <div className="container">
        <div className="benefit-strip">
          <span>
            <span aria-hidden="true">✳</span> Talent dengan beragam keahlian
          </span>
          <span>
            <span aria-hidden="true">✳</span> Paket sesuai kebutuhan
          </span>
          <span>
            <span aria-hidden="true">✳</span> Harga jelas sejak awal
          </span>
        </div>
        <div className="intro-grid">
          <div className="row gx-lg-5 gy-4">
            <div className="col-md-4">
              <div className="section-label">
                <span className="line-marker"></span> ORANG YANG TEPAT.
                <br />
                <span className="label-indent">SKILL YANG KAMU CARI.</span>
                <PeoplePreview />
              </div>
            </div>
            <div className="col-md-8">
              <div>
                <h2 id="intro-title">
                  Kamu punya ide.
                  <br />
                  Kami bantu temukan <em>ahlinya.</em>
                </h2>
                <p className="intro-description">
                  SewaSkill mempertemukan kamu dengan talent digital untuk desain, website, video,
                  dan konten. Pilih keahliannya, ceritakan kebutuhanmu, lalu mulai berkarya bersama.
                </p>
                <a className="text-link" href="#cara-kerja">
                  Kenalan lebih dekat <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <SkillBadges />
      </div>
    </section>
  );
}

function ServiceItem({ number, title, keywords, description, linkText }) {
  return (
    <details className="service" onPointerEnter={openService} onPointerLeave={closeService}>
      <summary onClick={clickService}>
        <span className="service-number">{number}</span>
        <h3>{title}</h3>
        <span className="service-keywords">{keywords}</span>
        <span className="service-toggle" aria-hidden="true"></span>
      </summary>
      <div className="service-content">
        <p>{description}</p>
        <Link className="text-link" to="/katalog">
          {linkText} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </details>
  );
}

function ServicesSection() {
  return (
    <section className="services" id="layanan" aria-labelledby="services-title">
      <div className="container">
        <div className="section-top">
          <div>
            <p className="eyebrow">BANYAK KEBUTUHAN. SATU TEMPAT.</p>
            <h2 id="services-title">
              Apa pun idenya,
              <br />
              ada <em>skill-nya.</em>
            </h2>
          </div>
          <p className="services-description">
            Biar kamu fokus ke gambaran besarnya.
            <br />
            Temukan bantuan untuk detailnya.
          </p>
        </div>
        <div className="service-list">
          <ServiceItem
            number="01"
            title="Desain &amp; Branding"
            keywords="Logo · Brand kit · Thumbnail"
            description="Dari kesan pertama sampai identitas yang diingat. Temukan talent untuk logo, brand kit, thumbnail, dan materi visualmu."
            linkText="Temukan desainer"
          />
          <ServiceItem
            number="02"
            title="Web &amp; Koding"
            keywords="Website · Frontend · Tutor"
            description="Punya ide website atau ingin belajar pemrograman? Temukan bantuan untuk membangun halaman web dan memahami kodenya."
            linkText="Temukan talent koding"
          />
          <ServiceItem
            number="03"
            title="Video &amp; Motion"
            keywords="Reels · TikTok · Editing"
            description="Ubah rekaman mentah menjadi cerita yang enak ditonton. Mulai dari video pendek untuk media sosial sampai editing kontenmu."
            linkText="Temukan editor video"
          />
          <ServiceItem
            number="04"
            title="Konten &amp; Tulisan"
            keywords="Artikel · Copywriting · SEO"
            description="Temukan kata yang pas untuk idemu. Kolaborasi dengan penulis untuk artikel, konten media sosial, dan tulisan website."
            linkText="Temukan penulis"
          />
        </div>
        <div className="services-bottom">
          <span>Punya skill yang bisa membantu orang lain?</span>
          <Link to="/tambah-jasa">
            Jadi bagian dari SewaSkill <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProcessStep({ number, title, children }) {
  return (
    <div className="col">
      <article>
        <span className="step-number">{number}</span>
        <h3>{title}</h3>
        <p>{children}</p>
      </article>
    </div>
  );
}

function ProcessSection() {
  return (
    <section className="process paper" id="cara-kerja" aria-labelledby="process-title">
      <div className="container">
        <div className="section-top">
          <div>
            <p className="eyebrow dark-eyebrow">IDE BAGUS NGGAK PERLU NUNGGU LAMA.</p>
            <h2 id="process-title">
              Tiga langkah.
              <br />
              <em>Mulai sesuatu yang besar.</em>
            </h2>
          </div>
          <span className="process-decoration" aria-hidden="true">
            ✳
          </span>
        </div>
        <div className="process-grid">
          <div className="row row-cols-1 row-cols-md-3 gx-md-5 gy-4">
            <ProcessStep number="(01)" title="Temukan yang cocok.">
              Jelajahi katalog. Pilih talent berdasarkan keahlian, paket jasa, dan kebutuhan
              proyekmu.
            </ProcessStep>
            <ProcessStep number="(02)" title="Ceritakan idemu.">
              Baca detail jasa, pilih paket, lalu tulis brief yang jelas saat mengisi formulir
              pemesanan.
            </ProcessStep>
            <ProcessStep number="(03)" title="Wujudkan bersama.">
              Periksa ringkasan pesananmu. Jadikan brief tadi langkah pertama menuju karya
              berikutnya.
            </ProcessStep>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClosingSection() {
  return (
    <section className="closing paper" aria-labelledby="closing-title">
      <div className="container closing-inner">
        <p className="eyebrow dark-eyebrow">SETIAP KARYA HEBAT DIMULAI DARI SATU IDE.</p>
        <h2 id="closing-title">
          Sekarang, giliran
          <br />
          <em>ide kamu.</em>
          <span className="closing-star" aria-hidden="true">
            ✳
          </span>
        </h2>
        <Link className="button button-blue" to="/katalog">
          Yuk, mulai sesuatu{' '}
          <span className="button-arrow" aria-hidden="true">
            ↗
          </span>
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  useTitle('Ide besarmu, skill terbaik');

  return (
    <main id="main">
      <Hero />
      <MemberHome />
      <IntroSection />
      <WorkGallery />
      <ServicesSection />
      <ProcessSection />
      <ClosingSection />
    </main>
  );
}
