import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@repo/react-kit/cn';
import { useContext } from './context';

const SLIDE_MS = 150;

type Props = {
  placement: 'side' | 'bottom';
  children: ReactNode;
};

/**
 * Holds the app nav. The bottom nav (mobile only) slides away while an
 * overlay is open, so the overlay gets the whole screen; hidden it is inert
 * (no focus, no reading). Only opacity and translate animate (compositor);
 * the rows collapse as one discrete step after the slide, so content reflows
 * once instead of every frame. The frosted blur is dropped while hidden: a
 * blurred backdrop re-rasterizes every frame of the slide. Motion is off under `motion-reduce`. The side nav
 * (desktop) is never touched.
 */
export const NavSlot = ({ placement, children }: Props) => {
  const { hidden } = useContext();
  const content = useRef<HTMLDivElement>(null);

  // Publishes the nav height so floating buttons can glide over it (NavFollow).
  useEffect(() => {
    const node = content.current;
    if (placement !== 'bottom' || !node) return;
    const root = document.documentElement.style;
    const observer = new ResizeObserver(() =>
      root.setProperty('--bottom-nav-h', `${node.offsetHeight}px`),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [placement]);

  // The rows collapse once the slide is done, never during it.
  const [slid, setSlid] = useState(false);
  useEffect(() => {
    if (!hidden) return;
    const timer = setTimeout(() => setSlid(true), SLIDE_MS);
    return () => {
      clearTimeout(timer);
      setSlid(false);
    };
  }, [hidden]);
  const collapsed = hidden && slid;

  // Same commit as the layout shift, so NavFollow rails start gliding on the
  // very frame the content moves. Untouched until the first collapse.
  useLayoutEffect(() => {
    if (placement !== 'bottom') return;
    const root = document.documentElement;
    if (collapsed) root.dataset.navCollapsed = 'true';
    else if (root.dataset.navCollapsed) root.dataset.navCollapsed = 'false';
  }, [placement, collapsed]);

  if (placement === 'side')
    return (
      <div className="z-(--z-raised) hidden h-full w-64 shrink-0 lg:block xl:w-72">
        {children}
      </div>
    );

  return (
    <div
      inert={hidden}
      aria-hidden={hidden || undefined}
      data-overlay-hidden={hidden}
      className={cn(
        'z-(--z-raised) grid shrink-0 overflow-hidden ease-out [transition-property:grid-template-rows,opacity,translate] [transition-duration:0s,150ms,150ms] motion-reduce:transition-none lg:hidden',
        collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
        hidden &&
          'translate-y-full opacity-0 will-change-[translate,opacity] [&_nav]:backdrop-filter-none',
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div ref={content}>{children}</div>
      </div>
    </div>
  );
};
