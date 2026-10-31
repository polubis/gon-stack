import { RefreshCw, X } from 'lucide-react';
import { useAppUpdate } from './use-app-update';

/**
 * Floating notice (overlays, so it never shifts the layout) offering a reload
 * when a newer version of the app has been deployed.
 */
export const AppUpdateBanner = () => {
  const { outdated, dismiss } = useAppUpdate();
  if (!outdated) return null;

  return (
    <div
      role="status"
      data-e2e="app-update:banner"
      className="fixed top-4 left-1/2 z-(--z-popover) flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 animate-item-in items-center gap-3 rounded-2xl border border-line-strong bg-card p-3 shadow-popover motion-reduce:animate-none sm:p-4"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
        <RefreshCw className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">
          Dostępna nowa wersja Parki
        </p>
        <p className="text-sm text-ink-soft">
          Odśwież stronę, aby korzystać z najnowszej wersji.
        </p>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        data-e2e="app-update:refresh"
        className="shrink-0 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-on-brand hover:bg-brand-dark"
      >
        Odśwież
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Zamknij informację o nowej wersji"
        data-e2e="app-update:dismiss"
        className="shrink-0 rounded-full p-1 text-ink-soft hover:text-ink"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};
