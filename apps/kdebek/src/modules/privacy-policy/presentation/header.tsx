import { ArrowLeft } from 'lucide-react';

export const Header = () => (
  <header className="px-3 pt-3 sm:px-4 sm:pt-4">
    <div className="mx-auto flex max-w-7xl items-center rounded-3xl bg-white px-4 py-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:px-6">
      <a
        href="/"
        className="flex items-center gap-2 text-sm font-medium text-ink-light"
      >
        <ArrowLeft className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
        Wróć
      </a>
    </div>
  </header>
);
