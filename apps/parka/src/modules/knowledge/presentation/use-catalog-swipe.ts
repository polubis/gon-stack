import { useRef, type RefObject, type TouchEvent } from 'react';

/** Least travel (CSS pixels) that counts as a swipe, not a tap or scroll. */
const MIN_DISTANCE = 64;

/** How much more horizontal than vertical a swipe must be. */
const MIN_RATIO = 1.5;

const SLIDE_IN = '18%';
const MOTION_MS = 220;

/** A swipe that starts in a control or a sideways scroller belongs to it. */
const ownsGesture = (target: EventTarget, root: HTMLElement): boolean => {
  for (let el = target as HTMLElement | null; el; el = el.parentElement) {
    if (el.matches?.('input, textarea, select, [role="slider"]')) return true;
    if (el === root) return false;
    if (el.scrollWidth > el.clientWidth) {
      const overflow = getComputedStyle(el).overflowX;
      if (overflow === 'auto' || overflow === 'scroll') return true;
    }
  }
  return false;
};

/**
 * Touch handlers that step the catalog: swipe left for the next one, right
 * for the previous one. The new content slides in from the side it is reached
 * from. Touch devices only (coarse pointer); motion is off with
 * `prefers-reduced-motion`. The arrows stay the keyboard alternative.
 */
export const useCatalogSwipe = (onStep: (by: 1 | -1) => void) => {
  const start = useRef<{ x: number; y: number } | null>(null);
  const content = useRef<HTMLElement | null>(null);

  const slideIn = (forward: boolean) => {
    const el = content.current;
    const calm = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (!el || calm || typeof el.animate !== 'function') return;
    el.animate(
      [
        {
          transform: `translateX(${forward ? '' : '-'}${SLIDE_IN})`,
          opacity: 0,
        },
        { transform: 'translateX(0)', opacity: 1 },
      ],
      { duration: MOTION_MS, easing: 'ease-out' },
    );
  };

  return {
    /** Slides the content in from the side it is reached from. */
    slide: slideIn,
    /** Goes on the data area: it slides while the picker stays put. */
    contentRef: content as RefObject<HTMLDivElement | null>,
    gesture: {
      onTouchStart: (e: TouchEvent<HTMLElement>) => {
        const touch = e.touches[0];
        const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? true;
        start.current =
          e.touches.length === 1 &&
          touch &&
          coarse &&
          !ownsGesture(e.target, e.currentTarget)
            ? { x: touch.clientX, y: touch.clientY }
            : null;
      },
      onTouchEnd: (e: TouchEvent<HTMLElement>) => {
        const from = start.current;
        const touch = e.changedTouches[0];
        start.current = null;
        if (!from || !touch) return;
        const dx = touch.clientX - from.x;
        const dy = touch.clientY - from.y;
        if (
          Math.abs(dx) >= MIN_DISTANCE &&
          Math.abs(dx) >= MIN_RATIO * Math.abs(dy)
        ) {
          slideIn(dx < 0);
          onStep(dx < 0 ? 1 : -1);
        }
      },
      onTouchCancel: () => {
        start.current = null;
      },
    },
  };
};
