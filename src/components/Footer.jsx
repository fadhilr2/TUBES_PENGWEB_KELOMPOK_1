import { Link } from 'react-router-dom';
import { useDemo } from '../state/DemoContext';

export default function Footer() {
  const { user } = useDemo();
  const isAdmin = user !== null && user !== undefined && user.role === 'admin';

  let homeLink = '/';
  let bottomLink = '/katalog';
  let bottomLabel = 'Temukan skill-mu';
  if (isAdmin) {
    homeLink = '/admin';
    bottomLink = '/admin/log';
    bottomLabel = 'Log aktivitas';
  }

  function handleBackToTop() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let behavior = 'smooth';
    if (reduceMotion) {
      behavior = 'instant';
    }
    window.scrollTo({ top: 0, behavior: behavior });
  }

  return (
    <footer className="footer app-footer">
      <div className="container">
        <div className="footer-top">
          <Link className="wordmark" to={homeLink}>
            <img src="/favicon.svg" width="32" height="32" alt="" />
            sewaskill<span className="brand-dot">.</span>
          </Link>
          <p>
            Skill bertemu ide.
            <br />
            Karya jadi cerita.
          </p>
          <button type="button" className="back-top" onClick={handleBackToTop}>
            Kembali ke atas <span aria-hidden="true">↑</span>
          </button>
        </div>
        <div className="footer-bottom">
          <span>© 2026 SewaSkill · Kelompok 1</span>
          <span>Demo lokal · Data dan pembayaran simulasi</span>
          <Link to={bottomLink}>{bottomLabel} ↗</Link>
        </div>
      </div>
    </footer>
  );
}
