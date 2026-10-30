import { useRef, type RefObject, type TouchEvent } from 'react';
import {
  canGoNext,
  clampPeriod,
  shiftPeriod,
  type Period,
} from '@/shared/period/period';

/** Least travel (CSS pixels) that counts as a swipe, not a tap or scroll. */
const MIN_DISTANCE = 64;

/** How much more horizontal than vertical a swipe must be. */
const MIN_RATIO = 1.5;

/** Share of the finger travel the content follows; less where nothing lies. */
const FOLLOW = 0.6;
const RUBBER = 0.2;

/** Share of the width the new content slides in over. */
const SLIDE_IN = '18%';

const MOTION_MS = 220;

const CONTROLS = 'input, textarea, select, [role="slider"]';

const reduced = (): boolean =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** Swipe is a touch gesture: off where the main pointer is a mouse. */
const touchPrimary = (): boolean =>
  window.matchMedia?.('(pointer: coarse)').matches ?? true;

/** A swipe that starts in a sideways scroller or a control belongs to it. */
const ownsGesture = (target: EventTarget, root: HTMLElement): boolean => {
  for (let el = target as HTMLElement | null; el; el = el.parentElement) {
    if (el.matches?.(CONTROLS)) return true;
    if (el === root) return false;
    if (el.scrollWidth > el.clientWidth) {
      const overflow = getComputedStyle(el).overflowX;
      if (overflow === 'auto' || overflow === 'scroll') return true;
    }
  }
  return false;
};

/**
 * Touch handlers that step the period: swipe left for the next one, right for
 * the previous one. The content follows the finger (with resistance where
 * there is nothing further), snaps back on a short swipe and, on a long one,
 * the new period slides in from the side of the gesture. Only the element
 * under `contentRef` (the data) moves; the handlers go on the wider area.
 * `go` is the same step for the buttons and pickers. The step buttons stay the keyboard
 * alternative; the gesture works only on touch devices (coarse pointer);
 * motion is off with `prefers-reduced-motion`.
 */
export const usePeriodSwipe = ({
  period,
  today,
  onChange,
  allowFuture = false,
}: {
  period: Period;
  today: string;
  onChange: (period: Period) => void;
  allowFuture?: boolean;
}) => {
  const start = useRef<{ x: number; y: number } | null>(null);
  const content = useRef<HTMLElement | null>(null);

  const place = (dx: number, free: boolean) => {
    const el = content.current;
    if (!el || reduced()) return;
    const shift = dx * (free ? FOLLOW : RUBBER);
    el.style.transition = 'none';
    el.style.transform = `translateX(${shift}px)`;
    el.style.opacity = String(1 - Math.min(0.4, Math.abs(shift) / 400));
  };

  const release = () => {
    const el = content.current;
    if (!el) return;
    el.style.transition = reduced()
      ? ''
      : `transform ${MOTION_MS}ms ease-out, opacity ${MOTION_MS}ms ease-out`;
    el.style.transform = '';
    el.style.opacity = '';
  };

  /** New content enters from the side it is reached from. */
  const slideIn = (forward: boolean) => {
    const el = content.current;
    if (!el) return;
    el.style.transition = '';
    el.style.transform = '';
    el.style.opacity = '';
    if (reduced() || typeof el.animate !== 'function') return;
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

  const go = (next: Period) => {
    slideIn(next.from >= period.from);
    onChange(next);
  };

  const hasNext = allowFuture || canGoNext(period, today);

  return {
    go,
    /** Goes on the data area only: the filters stay put while it moves. */
    contentRef: content as RefObject<HTMLDivElement | null>,
    gesture: {
      onTouchStart: (e: TouchEvent<HTMLElement>) => {
        const touch = e.touches[0];
        const inside = e.currentTarget.contains(e.target as Node);
        start.current =
          e.touches.length === 1 &&
          touch &&
          inside &&
          touchPrimary() &&
          period.kind !== 'custom' &&
          !ownsGesture(e.target, e.currentTarget)
            ? { x: touch.clientX, y: touch.clientY }
            : null;
      },
      onTouchMove: (e: TouchEvent<HTMLElement>) => {
        const from = start.current;
        const touch = e.touches[0];
        if (!from || !touch) return;
        const dx = touch.clientX - from.x;
        const dy = touch.clientY - from.y;
        if (Math.abs(dx) < MIN_RATIO * Math.abs(dy)) return;
        place(dx, dx > 0 || hasNext);
      },
      onTouchEnd: (e: TouchEvent<HTMLElement>) => {
        const from = start.current;
        const touch = e.changedTouches[0];
        start.current = null;
        if (!from || !touch) return;

        const dx = touch.clientX - from.x;
        const dy = touch.clientY - from.y;
        const swiped =
          Math.abs(dx) >= MIN_DISTANCE &&
          Math.abs(dx) >= MIN_RATIO * Math.abs(dy);
        if (!swiped || (dx < 0 && !hasNext)) {
          release();
          return;
        }
        const next = shiftPeriod(period, dx > 0 ? -1 : 1);
        go(dx > 0 || allowFuture ? next : clampPeriod(next, today));
      },
      onTouchCancel: () => {
        start.current = null;
        release();
      },
    },
  };
};
