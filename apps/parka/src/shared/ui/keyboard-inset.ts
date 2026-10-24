const VAR = '--kb-inset';

/**
 * Publishes the on-screen keyboard height as `--kb-inset` on `<html>` so
 * bottom-anchored modals lift above it and shrink to the space left.
 * Resolves to 0 when the browser already resizes the layout viewport.
 * Returns a cleanup.
 */
export const trackKeyboardInset = (): (() => void) => {
  const viewport = window.visualViewport;
  if (!viewport) return () => {};
  const root = document.documentElement;
  const update = () => {
    const inset = Math.max(
      0,
      window.innerHeight - viewport.height - viewport.offsetTop,
    );
    root.style.setProperty(VAR, `${Math.round(inset)}px`);
  };
  update();
  viewport.addEventListener('resize', update);
  viewport.addEventListener('scroll', update);
  window.addEventListener('resize', update);
  return () => {
    viewport.removeEventListener('resize', update);
    viewport.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
    root.style.removeProperty(VAR);
  };
};
