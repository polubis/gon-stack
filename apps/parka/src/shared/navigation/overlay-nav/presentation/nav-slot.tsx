import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@repo/react-kit/cn';
import { registerNav, useStage } from './nav-sequence';

type Props = {
  placement: 'side' | 'bottom';
  children: ReactNode;
};

/**
 * Holds the app nav. The bottom nav (mobile only) fades and slides away while
 * an overlay is open, as the first step of the overlay sequence (see
 * nav-sequence); hidden it is inert (no focus, no reading). Only opacity and
 * translate animate (compositor); its space collapses or returns as one
 * discrete step, between the slide and the add button's move. Its height is
 * published as `--bottom-nav-h` for the add button. The frosted
 * blur is dropped while hidden: a blurred backdrop re-rasterizes every frame.
 * Motion is off under `motion-reduce`. The side nav (desktop) is never touched.
 */
export const NavSlot = ({ placement, children }: Props) => {
  const stage = useStage();
  const ref = useRef<HTMLDivElement>(null);
  const hidden = stage !== 'rest';

  useEffect(() => {
    const node = ref.current;
    if (placement !== 'bottom' || !node) return;
    const root = document.documentElement.style;
    const observer = new ResizeObserver(() =>
      root.setProperty('--bottom-nav-h', `${node.offsetHeight}px`),
    );
    observer.observe(node);
    const unregister = registerNav(node);
    return () => {
      observer.disconnect();
      unregister();
    };
  }, [placement]);

  if (placement === 'side')
    return (
      <div className="z-(--z-raised) hidden h-full w-64 shrink-0 lg:block xl:w-72">
        {children}
      </div>
    );

  return (
    <div
      ref={ref}
      inert={hidden}
      aria-hidden={hidden || undefined}
      data-overlay-hidden={hidden}
      className={cn(
        'z-(--z-raised) flow-root shrink-0 ease-out [transition-duration:120ms] [transition-property:opacity,translate] motion-reduce:transition-none lg:hidden',
        hidden &&
          'translate-y-full opacity-0 will-change-[translate,opacity] [&_nav]:backdrop-filter-none',
      )}
    >
      {children}
    </div>
  );
};
