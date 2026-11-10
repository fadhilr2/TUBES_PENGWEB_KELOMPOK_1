import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(
    function scrollOnNavigate() {
      if (hash) {
        const target = document.getElementById(hash.slice(1));
        if (target) {
          target.scrollIntoView();
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    },
    [pathname, hash],
  );

  return null;
}
