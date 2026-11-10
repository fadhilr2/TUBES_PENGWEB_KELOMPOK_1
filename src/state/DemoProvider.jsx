import { useEffect, useState } from 'react';
import { DemoContext } from './context';
import { createDemoEngine, DEMO_STORAGE_KEY } from './demoEngine';

function saveToLocalStorage(state) {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn('Penyimpanan lokal tidak tersedia. Data demo hanya bertahan di tab ini.');
  }
}

function readSavedState() {
  const saved = localStorage.getItem(DEMO_STORAGE_KEY);
  if (!saved) {
    return null;
  }
  const migrated = saved.replaceAll('/konsep/assets/', '/assets/images/');
  return JSON.parse(migrated);
}

function clearSavedState() {
  try {
    localStorage.removeItem(DEMO_STORAGE_KEY);
  } catch {
    console.warn('Penyimpanan lokal tidak tersedia. Memakai data demo di memori.');
  }
}

export function DemoProvider({ children }) {
  const [engine] = useState(() => createDemoEngine());
  const [snapshot, setSnapshot] = useState(() => engine.getSnapshot());

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const unsubscribe = engine.subscribe(() => {
      const current = engine.getSnapshot();
      setSnapshot(current);
      if (current.ready) {
        saveToLocalStorage(current.state);
      }
    });

    async function loadDemoData() {
      try {
        const response = await fetch('/data/demo.json', { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Data demo gagal dimuat (' + response.status + ').');
        }
        const seed = await response.json();
        if (!active) {
          return;
        }
        try {
          const savedState = readSavedState();
          if (savedState) {
            engine.initialize(savedState);
            return;
          }
        } catch {
          clearSavedState();
        }
        engine.initialize(seed);
      } catch (error) {
        if (active && error.name !== 'AbortError') {
          engine.fail(error);
        }
      }
    }

    loadDemoData();

    return () => {
      active = false;
      controller.abort();
      unsubscribe();
    };
  }, [engine]);

  let user = null;
  const users = snapshot.state.users;
  for (let index = 0; index < users.length; index++) {
    const candidate = users[index];
    if (candidate.id === snapshot.state.currentUserId && candidate.status === 'aktif') {
      user = candidate;
      break;
    }
  }

  const value = {
    ...engine,
    state: snapshot.state,
    ready: snapshot.ready,
    error: snapshot.error,
    user: user,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
