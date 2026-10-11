import { useState } from 'react';
import { readRemembered, writeRemembered } from '../integration/storage';

type Options = {
  /** Unique field name, e.g. `expense.paymentMethod`. */
  key: string;
  /** `false` (e.g. editing) skips recalling; remembering still works. */
  enabled?: boolean;
  /**
   * Allowed values: the remembered one is resolved against them ignoring case
   * and surrounding spaces, and recalled as the list's own spelling.
   * No match = not recalled.
   */
  options?: string[];
  /** Rejects a stale value (trimmed); it is then not recalled. */
  accept?: (value: string) => boolean;
};

const normalize = (value: string): string => value.trim().toLowerCase();

/** Opt a form field into memory: `recalled` once on mount, `remember` on save. */
export const useRememberedField = ({
  key,
  enabled = true,
  options,
  accept = () => true,
}: Options): { recalled: string | null; remember: (value: string) => void } => {
  const [recalled] = useState(() => {
    if (!enabled) return null;
    const stored = readRemembered(key);
    if (!stored) return null;
    const value = options
      ? options.find((option) => normalize(option) === normalize(stored))
      : stored;
    return value && accept(value) ? value : null;
  });

  return { recalled, remember: (value) => writeRemembered(key, value) };
};
