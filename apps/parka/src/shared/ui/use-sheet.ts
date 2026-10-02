import { useRef, useState } from 'react';

/** Which sheet is open on a card; closing returns focus to its opener. */
export const useSheet = <Kind extends string>() => {
  const [sheet, setSheet] = useState<Kind | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  return {
    sheet,
    open: (kind: Kind) => {
      opener.current = document.activeElement as HTMLElement | null;
      setSheet(kind);
    },
    close: () => {
      setSheet(null);
      opener.current?.focus();
    },
  };
};
