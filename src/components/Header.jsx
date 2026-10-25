import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNav = () => setIsOpen(prev => !prev);
  const closeNav = () => setIsOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
      <div className="container">
        <Link 
          className="navbar-brand fw-bold text-primary d-flex align-items-center gap-2" 
          to="/" 
          onClick={closeNav}
          aria-label="SewaSkill, kembali ke beranda"
        >
          <img
            src="https://placehold.co/36x36/0d6efd/FFFFFF?text=SS"
            alt="Logo SewaSkill"
            width="36"
            height="36"
            className="rounded"
          />
          SewaSkill
        </Link>

        <button
          className={`navbar-toggler ${isOpen ? '' : 'collapsed'}`}
          type="button"
          onClick={toggleNav}
          aria-controls="main-nav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="main-nav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-1 gap-lg-2">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => 'nav-link px-3' + (isActive ? ' active fw-semibold' : '')}
                to="/"
                end
                onClick={closeNav}
              >
                Beranda
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => 'nav-link px-3' + (isActive ? ' active fw-semibold' : '')}
                to="/katalog"
                onClick={closeNav}
              >
                Katalog
              </NavLink>
            </li>
            <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
              <NavLink
                className={({ isActive }) => 'btn btn-primary btn-sm px-3 py-2 fw-medium' + (isActive ? ' active' : '')}
                to="/tambah-jasa"
                onClick={closeNav}
              >
                Daftar Jasa
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
