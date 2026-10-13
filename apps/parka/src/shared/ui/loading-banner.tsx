import type { CSSProperties } from 'react';

type Props = {
  active: boolean;
  label?: string;
};

const KEYFRAMES = `
@keyframes loading-bar {
  from { transform: translateX(-100%); }
  to { transform: translateX(250%); }
}
@media (prefers-reduced-motion: reduce) {
  [data-loading-bar] { animation: none !important; width: 100% !important; transform: none !important; }
}`;

const BAR: CSSProperties = {
  width: '40%',
  animation: 'loading-bar 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite',
};

/**
 * Indeterminate reload indicator (a bar sweeping until `active` ends) that keeps current data visible.
 * Animation is local (inline style + scoped keyframes). Overlays the top edge of
 * the nearest `relative` ancestor, so it takes no layout space and toggling it
 * never shifts the page.
 */
export const LoadingBanner = ({
  active,
  label = 'Ładowanie danych',
}: Props) => (
  <div
    role="status"
    aria-live="polite"
    className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden"
  >
    {active ? (
      <>
        <span className="sr-only">{label}</span>
        <div className="h-full w-full bg-brand-soft">
          <style>{KEYFRAMES}</style>
          <div
            data-loading-bar
            style={BAR}
            className="h-full rounded-full bg-linear-to-r from-transparent via-brand to-brand-dark"
          />
        </div>
      </>
    ) : null}
  </div>
);
