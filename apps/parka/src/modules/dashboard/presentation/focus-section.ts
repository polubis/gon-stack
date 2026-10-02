import type { MouseEvent } from 'react';

/** In-page `#id` link: scroll to the section and move focus into it. */
export const focusSection = (event: MouseEvent<HTMLAnchorElement>): void => {
  const id = event.currentTarget.hash.slice(1);
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ block: 'start' });
  target.focus({ preventScroll: true });
};
