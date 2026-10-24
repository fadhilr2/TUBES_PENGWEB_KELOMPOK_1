import { NavLink, Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand" to="/" aria-label="SewaSkill, kembali ke beranda">
          <img
            src="https://placehold.co/80x80/4F46E5/FFFFFF?text=SS"
            alt="Logo SewaSkill — Platform Jasa Freelance Mikro"
            width="80"
            height="80"
          />
          <span>SewaSkill</span>
        </Link>

        <nav className="primary-nav" aria-label="Navigasi Utama">
          <ul>
            <li>
              <NavLink to="/" end>
                Beranda
              </NavLink>
            </li>
            <li>
              <NavLink to="/katalog">
                Katalog
              </NavLink>
            </li>
            <li>
              <NavLink to="/tambah-jasa">
                Daftar Jasa
              </NavLink>
            </li>
            <li>
              <NavLink to="/detail-jasa" aria-label="Contoh detail jasa">
                Detail
              </NavLink>
            </li>
            <li>
              <NavLink to="/order" aria-label="Contoh order">
                Order
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
