import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@repo/react-kit/cn';
import { registerNav, useStage } from './nav-sequence';

type Props = {
  placement: 'side' | 'bottom';
  children: ReactNode;
};

/**
 * Holds the app nav. The bottom nav (mobile only) floats over the page bottom and fades and slides away while
 * an overlay is open, as the first step of the overlay sequence (see
 * nav-sequence); hidden it is inert (no focus, no reading). Only opacity and
 * translate animate (compositor), on the frosted `nav` itself so its blur
 * fades and slides with it (an opacity on an ancestor would cut the blur at
 * once). The wrapper only flips `visibility` after the slide, which drops the
 * blur layer for good. Its height is published as
 * `--bottom-nav-h` for the add button.
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
        'z-(--z-raised) absolute inset-x-0 bottom-0 flow-root ease-out [transition-duration:120ms] [transition-property:visibility] motion-reduce:transition-none lg:hidden [&_nav]:ease-out [&_nav]:[transition-duration:120ms] [&_nav]:[transition-property:opacity,translate] motion-reduce:[&_nav]:transition-none',
        hidden &&
          'invisible [&_nav]:translate-y-full [&_nav]:opacity-0 [&_nav]:will-change-[translate,opacity]',
      )}
    >
      {children}
    </div>
  );
};

/**
 * Page scroll area (mobile: full column height). The bottom nav floats over
 * its lower edge, so the page keeps showing behind the open add menu while
 * the nav is away; its bottom padding is the nav height, so content still
 * ends right above the nav.
 */
export const NavScroll = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto max-lg:pb-(--bottom-nav-h,0px)">
    {children}
  </div>
);
