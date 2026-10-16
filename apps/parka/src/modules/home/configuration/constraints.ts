import { ChartColumn, Repeat, ScanLine } from 'lucide-react';

export const FEATURE_NAME = 'Home';

export const ERROR_CODES = {
  render: 'HOME_RENDER',
} as const;

/** What the app does, one line each; the full tour waits inside the app. */
export const HIGHLIGHTS = [
  { icon: ScanLine, label: 'Skanuj paragony' },
  { icon: ChartColumn, label: 'Pilnuj limitów' },
  { icon: Repeat, label: 'Śledź płatności cykliczne' },
] as const;
