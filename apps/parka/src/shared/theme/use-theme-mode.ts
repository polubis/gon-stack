import { useEffect, useState } from 'react';
import { readMode, refreshAuto, writeMode, type ThemeMode } from './theme';

const AUTO_CHECK_MS = 60_000;

/** Theme mode state, kept in sync with the document and storage. */
export const useThemeMode = (): [ThemeMode, (mode: ThemeMode) => void] => {
  const [mode, setMode] = useState(readMode);

  useEffect(() => {
    if (mode !== 'auto') return;

    const id = window.setInterval(refreshAuto, AUTO_CHECK_MS);
    return () => window.clearInterval(id);
  }, [mode]);

  return [
    mode,
    (next) => {
      writeMode(next);
      setMode(next);
    },
  ];
};
