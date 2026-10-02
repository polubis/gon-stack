import { useEffect, useState } from 'react';

/** `true` once `ms` have passed since mount. */
export const useMinDelay = (ms: number) => {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setElapsed(true), ms);
    return () => clearTimeout(id);
  }, [ms]);

  return elapsed;
};
