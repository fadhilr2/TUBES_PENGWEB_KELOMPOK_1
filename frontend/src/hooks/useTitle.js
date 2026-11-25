import { useEffect } from 'react';

export function useTitle(title) {
  useEffect(
    function updateTitle() {
      document.title = title + ' - SewaSkill';
    },
    [title],
  );
}
