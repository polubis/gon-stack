import {
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type ComponentProps,
} from 'react';
import { createPortal } from 'react-dom';
import { registerFab, useStage } from './nav-sequence';

const LAYER_ID = 'fab-layer';
const MOVE_MS = 160;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const DOWN = 'translateY(var(--bottom-nav-h, 0px))';

const noSubscription = () => () => {};

const navHeight = (): number =>
  parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(
      '--bottom-nav-h',
    ),
  ) || 0;

/**
 * Layer over the page, right above the nav, that holds the floating add
 * button (see `FabRail`). Outside the scroll area, so the button is neither
 * clipped nor faded by it when it moves down into the nav's space.
 */
export const FabLayer = () => (
  <div
    id={LAYER_ID}
    className="pointer-events-none absolute inset-x-0 bottom-(--bottom-nav-h) z-(--z-raised) h-0"
  />
);

/**
 * Zero-height rail of a floating add button, a step of the overlay sequence
 * (see nav-sequence). It renders into the `FabLayer`; the nav keeps its space
 * (it only slides away), so the layout never moves. Once the nav is gone the
 * rail glides the button down over the nav height and holds it there, and
 * back when the overlay closes (Web Animations, transform only), continuing
 * from where it is if reversed midway. No motion under `motion-reduce`: the
 * button just snaps.
 */
export const FabRail = (props: ComponentProps<'div'>) => {
  const ref = useRef<HTMLDivElement>(null);
  const layer = useSyncExternalStore(
    noSubscription,
    () => document.getElementById(LAYER_ID),
    () => null,
  );
  const stage = useStage();
  const down = stage === 'fabDown' || stage === 'ready';
  useEffect(() => registerFab(layer && ref.current), [layer]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || (stage !== 'fabDown' && stage !== 'fabUp')) return;
    const height = navHeight();
    const [running] = el.getAnimations();
    const from = running
      ? new DOMMatrixReadOnly(getComputedStyle(el).transform).m42
      : down
        ? 0
        : height;
    el.getAnimations().forEach((animation) => animation.cancel());
    if (!height || matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    el.animate(
      [
        { transform: `translateY(${from}px)` },
        { transform: `translateY(${down ? height : 0}px)` },
      ],
      { duration: MOVE_MS, easing: EASE },
    );
  }, [stage, down, layer]);

  return (
    layer &&
    createPortal(
      <div
        {...props}
        ref={ref}
        style={{ ...props.style, transform: down ? DOWN : 'none' }}
      />,
      layer,
    )
  );
};
