import { useEffect, useLayoutEffect, useRef, type ComponentProps } from 'react';
import { registerFab, useStage } from './nav-sequence';

const MOVE_MS = 160;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const navHeight = (): number =>
  parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(
      '--bottom-nav-h',
    ),
  ) || 0;

/**
 * Zero-height sticky rail of a floating add button, a step of the overlay
 * sequence (see nav-sequence). The nav's space collapses or returns in one
 * step and the layout moves the button by the nav height; the rail cancels
 * that shift at once and glides the button over the distance (Web Animations,
 * transform only), continuing from where it is if the move is reversed midway.
 * No motion under `motion-reduce`.
 */
export const FabRail = (props: ComponentProps<'div'>) => {
  const ref = useRef<HTMLDivElement>(null);
  const stage = useStage();
  useEffect(() => registerFab(ref.current), []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || (stage !== 'fabDown' && stage !== 'fabUp')) return;
    const shift = (stage === 'fabDown' ? -1 : 1) * navHeight();
    const offset = new DOMMatrixReadOnly(getComputedStyle(el).transform).m42;
    el.getAnimations().forEach((animation) => animation.cancel());
    if (!shift || matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    el.animate(
      [{ transform: `translateY(${offset + shift}px)` }, { transform: 'none' }],
      { duration: MOVE_MS, easing: EASE },
    );
  }, [stage]);

  return <div {...props} ref={ref} />;
};
