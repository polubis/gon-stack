import { TriangleAlert } from 'lucide-react';

type Props = {
  reset: () => void;
};

export const LoadErrorFallback = ({ reset }: Props) => (
  <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-6 text-center">
    <span className="grid h-12 w-12 place-items-center rounded-full bg-rose-100 text-rose-700">
      <TriangleAlert className="h-6 w-6" aria-hidden="true" />
    </span>
    <p className="text-sm font-medium text-ink-soft">
      Wystąpił błąd podczas ładowania danych.
    </p>
    <button
      type="button"
      onClick={reset}
      className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
    >
      Spróbuj ponownie
    </button>
  </div>
);
