import { useEffect, useState } from 'react';
import { context } from '@repo/react-kit/context';
import { setOverlayOpen } from './nav-sequence';

/**
 * Every open Radix overlay (dialog, popover, select list, menu) renders its
 * panel with one of these roles and `data-state="open"`, so counting them
 * covers each primitive and call site at once, stacked ones included.
 * Panels anchored to something inside the nav opt out with `data-keeps-nav`:
 * hiding the nav would pull their anchor away.
 */
const OPEN_OVERLAY =
  ':is([role="dialog"],[role="alertdialog"],[role="listbox"],[role="menu"])[data-state="open"]:not([data-keeps-nav])';

const countOpen = (): number => document.querySelectorAll(OPEN_OVERLAY).length;

export const [Provider, useContext] = context('OverlayNav', () => {
  const [open, setOpen] = useState(0);

  useEffect(() => {
    const sync = () => setOpen(countOpen());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-state', 'role', 'data-keeps-nav'],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setOverlayOpen(open > 0);
    return () => setOverlayOpen(false);
  }, [open]);

  return { open };
});
