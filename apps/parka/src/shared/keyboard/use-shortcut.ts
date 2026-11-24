import { useEffect, useEffectEvent } from 'react';

const EDITABLE =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
const OVERLAY =
  '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]';

const blocked = (event: KeyboardEvent): boolean => {
  if (event.defaultPrevented || event.repeat || event.isComposing) return true;
  if (event.ctrlKey || event.metaKey || event.altKey) return true;
  const target = event.target;
  if (target instanceof Element && target.closest(EDITABLE)) return true;
  return document.querySelector(OVERLAY) !== null;
};

/**
 * Desktop single-key shortcut. Silent while typing in a field or when any
 * dialog, menu or popup is open.
 */
export const useShortcut = (key: string, run: () => void): void => {
  const onRun = useEffectEvent(run);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key || blocked(event)) return;
      event.preventDefault();
      onRun();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key]);
};
