import { useEffect, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { DemoContext } from './context';
import { store } from './store';

export function DemoProvider({ children }) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const { pathname, search } = useLocation();
  useEffect(() => {
    store.load(pathname, search);
  }, [pathname, search]);
  const value = {
    ...store,
    ...snapshot,
    ready: snapshot.ready && snapshot.routeKey === pathname + search,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
