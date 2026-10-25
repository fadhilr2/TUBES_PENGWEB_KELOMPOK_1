import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-5 mt-5">
      <div className="container">
        <div className="row gy-4">
          <div className="col-md-5">
            <Link className="text-white text-decoration-none fw-bold fs-5 d-flex align-items-center gap-2 mb-2" to="/">
              <img
                src="/favicon.svg"
                alt="Logo SewaSkill"
                width="30"
                height="30"
                className="rounded"
              />
              SewaSkill
            </Link>
            <p className="text-secondary mb-0">Platform Jasa Freelance Mikro untuk Generasi Digital Indonesia.</p>
          </div>

          <div className="col-md-3">
            <h6 className="fw-semibold text-uppercase text-secondary mb-3" style={{ fontSize: '.75rem', letterSpacing: '.05em' }}>Navigasi</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-1"><Link className="text-secondary text-decoration-none" to="/">Beranda</Link></li>
              <li className="mb-1"><Link className="text-secondary text-decoration-none" to="/katalog">Katalog</Link></li>
              <li className="mb-1"><Link className="text-secondary text-decoration-none" to="/tambah-jasa">Daftar Jasa</Link></li>
            </ul>
          </div>

          <div className="col-md-4">
            <h6 className="fw-semibold text-uppercase text-secondary mb-3" style={{ fontSize: '.75rem', letterSpacing: '.05em' }}>Kontak</h6>
            <p className="text-secondary mb-1 small">sewaskill@support.id</p>
            <p className="text-secondary mb-0 small">WhatsApp: 0812-3456-7890</p>
          </div>
        </div>

        <hr className="border-secondary mt-4 mb-3" />
        <p className="text-center text-secondary small mb-0">&copy; 2025 SewaSkill. Hak Cipta Dilindungi.</p>
      </div>
    </footer>
  );
}
