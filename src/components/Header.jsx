import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useDemo } from '../state/DemoContext';

function getMenuLinks(user) {
  const links = [];

  if (user && user.role === 'admin') {
    links.push(['/admin', 'Ringkasan']);
    links.push(['/admin/pesanan', 'Tinjau pesanan']);
    links.push(['/admin/akun', 'Kelola akun']);
    links.push(['/admin/jasa', 'Moderasi jasa']);
    links.push(['/admin/log', 'Log aktivitas']);
    return links;
  }

  links.push(['/', 'Beranda']);
  links.push(['/katalog', 'Katalog jasa']);

  if (user) {
    links.push(['/favorit', 'Favorit']);
    links.push(['/riwayat', 'Riwayat pesanan']);
    links.push(['/jasa-saya', 'Jasa saya']);
  } else {
    links.push(['/login', 'Masuk']);
    links.push(['/register', 'Buat akun']);
  }

  if (user && user.role === 'penyedia') {
    links.push(['/dashboard-penyedia', 'Dashboard penyedia']);
  }

  if (user) {
    links.push(['/profil', 'Profil saya']);
  }

  return links;
}

function getAvailabilityText(user, isAdmin) {
  if (isAdmin) {
    return 'Ruang kelola SewaSkill';
  }
  if (user) {
    const firstName = user.name.split(' ')[0];
    return 'Halo, ' + firstName + '. Siap berkarya?';
  }
  return 'Skill lokal. Kemungkinan tak terbatas.';
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const { user, logout } = useDemo();
  const { pathname } = useLocation();

  const isAdmin = Boolean(user) && user.role === 'admin';
  const links = getMenuLinks(user);

  let headerClass = 'app-header ';
  if (pathname === '/') {
    headerClass = 'app-header header-home';
  }

  let homeLink = '/';
  if (isAdmin) {
    homeLink = '/admin';
  }

  useEffect(function listenForCloseEvents() {
    function handlePointerDown(event) {
      const headerElement = headerRef.current;
      if (headerElement && !headerElement.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        const headerElement = headerRef.current;
        if (headerElement) {
          const toggle = headerElement.querySelector('.menu-toggle');
          if (toggle) {
            toggle.focus();
          }
        }
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return function removeListeners() {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function closeMenu() {
    setOpen(false);
  }

  function toggleMenu() {
    setOpen(!open);
  }

  async function handleLogout() {
    setOpen(false);
    await logout();
  }

  function isExactLink(path) {
    return path === '/' || path === '/admin';
  }

  const menuItems = links.map(function renderLink(item) {
    const path = item[0];
    const label = item[1];
    return (
      <NavLink key={path} to={path} end={isExactLink(path)} onClick={closeMenu}>
        {label}
        <span aria-hidden="true">↗</span>
      </NavLink>
    );
  });

  return (
    <header ref={headerRef} className={headerClass}>
      <div className="site-header container">
        <Link
          className="wordmark"
          to={homeLink}
          onClick={closeMenu}
          aria-label="SewaSkill, kembali ke awal"
        >
          <img src="/favicon.svg" width="34" height="34" alt="" />
          sewaskill<span className="brand-dot">.</span>
        </Link>
        <span className="availability">
          <span />
          {getAvailabilityText(user, isAdmin)}
        </span>
        <div className="header-actions">
          {!isAdmin && (
            <Link className="header-catalog" to="/katalog">
              Jelajahi jasa ↗
            </Link>
          )}
          <button
            type="button"
            className="menu-toggle"
            onClick={toggleMenu}
            aria-controls="main-menu"
            aria-expanded={open}
          >
            <span>Menu</span>
            <span className="menu-icon" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
        <nav id="main-menu" className="main-menu" hidden={!open} aria-label="Navigasi utama">
          {menuItems}
          {user && (
            <button type="button" className="menu-logout" onClick={handleLogout}>
              Keluar ↗
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
