import { useMemo, useSyncExternalStore } from 'react';
import { DemoContext } from './context';
import { store } from './store';

export function DemoProvider({ children }) {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);

  const value = useMemo(
    function () {
      const user =
        state.users.find((u) => u.id === state.currentUserId && u.status === 'aktif') || null;
      return { ...store, state, user, ready: true, error: null };
    },
    [state],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
