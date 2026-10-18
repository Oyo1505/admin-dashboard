import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * false during SSR and hydration, true afterwards.
 * Hydration-safe replacement for the `mounted` + useEffect(setState) pattern.
 */
export const useHydrated = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
