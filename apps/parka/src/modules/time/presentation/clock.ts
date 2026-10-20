import { useEffect, useState } from 'react';
import { localDay } from '@/shared/date/date';

const TICK_MS = 30_000;

export type Now = {
  /** Today, `YYYY-MM-DD`. */
  day: string;
  /** Current time, `HH:MM`. */
  time: string;
};

const read = (): Now => {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return { day: localDay(date), time };
};

/** Local today and time, refreshed twice a minute. */
export const useClock = (): Now => {
  const [now, setNow] = useState(read);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = read();
      setNow((prev) =>
        prev.day === next.day && prev.time === next.time ? prev : next,
      );
    }, TICK_MS);
    return () => clearInterval(timer);
  }, []);

  return now;
};
