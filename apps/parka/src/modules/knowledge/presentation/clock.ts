import { useEffect, useState } from 'react';
import { localDay } from '@/shared/date/date';

const TICK_MS = 30_000;

/** Local today (`YYYY-MM-DD`), refreshed twice a minute. */
export const useToday = (): string => {
  const [day, setDay] = useState(() => localDay(new Date()));
  useEffect(() => {
    const timer = setInterval(() => setDay(localDay(new Date())), TICK_MS);
    return () => clearInterval(timer);
  }, []);
  return day;
};
