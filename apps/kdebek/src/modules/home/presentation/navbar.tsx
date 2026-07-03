import {
  CalendarPlus,
  ChevronDown,
  FileText,
  Home,
  Mail,
  Menu,
  Tag,
  Target,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Strona główna', icon: Home, active: true },
  { label: 'O mnie', icon: User, active: false },
  { label: 'Oferta', icon: Target, active: false, chevron: true },
  { label: 'Cennik', icon: Tag, active: false },
  { label: 'Blog', icon: FileText, active: false },
  { label: 'Kontakt', icon: Mail, active: false },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4 @max-h-[800px]:pt-2 sm:@max-h-[800px]:pt-2.5">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 @max-h-[800px]:py-2">
          <a href="/" className="flex min-w-0 items-center gap-2">
            <svg viewBox="0 0 40 32" className="h-7 w-9 shrink-0">
              <path
                d="M15 4L4 16l11 12"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 6a10 10 0 010 20"
                fill="none"
                stroke="#2E9BF5"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </svg>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl italic text-slate-800 sm:text-2xl">
                Kacper Dębek
              </span>
              <span className="mt-0.5 text-[10px] font-semibold tracking-[0.2em] text-slate-400">
                BIURO MASAŻ
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 xl:flex">
            {navItems.map(({ label, icon: Icon, active, chevron }) => (
              <a
                key={label}
                href="#"
                className={`relative flex items-center gap-1.5 py-2 text-sm font-medium @max-h-[800px]:py-1.5 ${
                  active
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {label}
                {chevron && <ChevronDown className="h-3.5 w-3.5" />}
                {active && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-blue-600" />
                )}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="hidden items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:flex"
            >
              <CalendarPlus className="h-4.5 w-4.5" />
              Zarezerwuj wizytę
            </button>
            <button
              type="button"
              aria-label="Zarezerwuj wizytę"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 sm:hidden"
            >
              <CalendarPlus className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              className="hidden items-center gap-1 rounded-full border border-slate-200 py-1.5 pl-1.5 pr-2.5 text-slate-500 hover:bg-slate-50 sm:flex"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                <User className="h-4 w-4" />
              </span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label={isMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 xl:hidden"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="flex flex-col gap-1 border-t border-line px-4 py-3 xl:hidden">
            {navItems.map(({ label, icon: Icon, active, chevron }) => (
              <a
                key={label}
                href="#"
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium ${
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {label}
                {chevron && <ChevronDown className="h-3.5 w-3.5" />}
              </a>
            ))}
            <button
              type="button"
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:hidden"
            >
              <CalendarPlus className="h-4.5 w-4.5" />
              Zarezerwuj wizytę
            </button>
            <button
              type="button"
              className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:hidden"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                <User className="h-4 w-4" />
              </span>
              Moje konto
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export { Navbar };
