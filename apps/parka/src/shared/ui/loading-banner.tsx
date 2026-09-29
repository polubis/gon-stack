type Props = {
  active: boolean;
  label?: string;
};

/**
 * Reload indicator that keeps current data visible. Overlays the top edge of
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
        <div className="h-full w-full animate-pulse bg-brand motion-reduce:animate-none" />
      </>
    ) : null}
  </div>
);
