import { useContext } from 'react';
import { DemoContext } from '../state/context';

export default function Button({ disabled, children, ...props }) {
  const context = useContext(DemoContext);
  return (
    <button {...props} disabled={disabled || context?.busy} aria-busy={context?.busy || undefined}>
      {children}
    </button>
  );
}
