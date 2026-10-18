import { useEffect, useState } from 'react';

/**
 * Returns `value` once it has stopped changing for `delay` ms.
 * Avoids firing a request on every keystroke.
 */
export const useDebouncedValue = <T>(value: T, delay = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
