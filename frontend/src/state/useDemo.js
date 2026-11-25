import { useContext } from 'react';
import { DemoContext } from './context';

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('DemoProvider belum terpasang.');
  }
  return context;
}
