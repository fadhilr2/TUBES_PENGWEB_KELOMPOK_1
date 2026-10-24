import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <Link className="brand brand--footer" to="/">
            <span>SewaSkill</span>
          </Link>
          <p>Platform Jasa Freelance Mikro untuk Generasi Digital Indonesia</p>
        </div>
        <nav aria-label="Navigasi Footer">
          <ul>
            <li>
              <Link to="/">Beranda</Link>
            </li>
            <li>
              <Link to="/katalog">Katalog</Link>
            </li>
            <li>
              <Link to="/tambah-jasa">Daftar Jasa</Link>
            </li>
          </ul>
        </nav>
        <p className="site-footer__copyright">&copy; 2025 SewaSkill. Hak Cipta Dilindungi.</p>
      </div>
    </footer>
  );
}
