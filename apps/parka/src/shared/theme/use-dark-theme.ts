import { useState } from 'react';
import { readDark, writeDark } from './theme';

/** Dark theme switch state, kept in sync with the document and storage. */
export const useDarkTheme = (): [boolean, (dark: boolean) => void] => {
  const [dark, setDark] = useState(readDark);

  return [
    dark,
    (next) => {
      writeDark(next);
      setDark(next);
    },
  ];
};
