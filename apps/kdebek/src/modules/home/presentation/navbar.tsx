import {
  CalendarPlus,
  FileText,
  Mail,
  Menu,
  Tag,
  Target,
  User,
  X,
} from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import { cn } from '@repo/react-kit/cn';

import { BOOKING_URL } from './links';
import { LogoMark } from './logo-mark';

const navItems = [
  { label: 'O mnie', icon: User, href: 'o-mnie' },
  { label: 'Oferta', icon: Target, href: 'oferta' },
  { label: 'Cennik', icon: Tag, href: 'cennik' },
  { label: 'Blog', icon: FileText, href: 'blog' },
  { label: 'Kontakt', icon: Mail, href: 'kontakt' },
];

const scrollToSection = (
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
) => {
  event.preventDefault();

  const element = document.getElementById(href);
  if (!element) return;

  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuEntered, setIsMenuEntered] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const frame = requestAnimationFrame(() => {
      setIsMenuEntered(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [isMenuOpen]);

  const openMenu = () => {
    setIsMenuEntered(false);
    setIsMenuOpen(true);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    scrollToSection(event, href);
    closeMenu();
  };

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4 @max-h-[800px]:pt-2 sm:@max-h-[800px]:pt-2.5">
      <div className="relative mx-auto max-w-7xl rounded-3xl bg-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div
          className={cn(
            'relative z-10 flex items-center justify-between gap-4 bg-white px-4 py-3 sm:px-6 @max-h-[800px]:py-2',
            isMenuOpen ? 'rounded-t-3xl' : 'rounded-3xl',
          )}
        >
          <a href="/" className="flex min-w-0 items-center gap-1 sm:gap-2">
            <LogoMark className="h-7 w-9 shrink-0" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl italic text-secondary sm:text-2xl">
                <span className="sm:hidden">KDębek</span>
                <span className="hidden sm:inline">Kacper Dębek</span>
              </span>
              <span className="mt-0.5 hidden text-2xs font-semibold tracking-[0.2em] text-ink-light sm:block">
                BIURO MASAŻ
              </span>
            </span>
          </a>

          <nav
            data-e2e="home:nav-desktop"
            className="hidden items-center gap-7 xl:flex"
          >
            {navItems.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={`#${href}`}
                onClick={(event) => handleNavClick(event, href)}
                className="relative flex items-center gap-1.5 py-2 text-sm font-medium text-ink-light @max-h-[800px]:py-1.5"
              >
                <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                {label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm sm:flex"
            >
              <CalendarPlus
                className="h-4.5 w-4.5 shrink-0"
                aria-hidden="true"
              />
              Zarezerwuj wizytę
            </a>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Zarezerwuj wizytę"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm sm:hidden"
            >
              <CalendarPlus
                className="h-4.5 w-4.5 shrink-0"
                aria-hidden="true"
              />
            </a>
            <button
              type="button"
              data-e2e="home:nav-toggle"
              aria-label={isMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
              aria-expanded={isMenuOpen}
              onClick={() => (isMenuOpen ? closeMenu() : openMenu())}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-light xl:hidden"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 shrink-0" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5 shrink-0" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav
            aria-label="Menu mobilne"
            data-e2e="home:nav-menu-mobile"
            className="absolute left-0 right-0 top-full z-40 overflow-hidden rounded-b-3xl bg-white xl:hidden"
          >
            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-out',
                isMenuEntered ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div
                  className={cn(
                    'flex flex-col gap-1 px-4 pb-3 pt-1 transition-[opacity,transform] duration-300 ease-out',
                    isMenuEntered
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2 opacity-0',
                  )}
                >
                  {navItems.map(({ label, icon: Icon, href }, index) => (
                    <a
                      key={label}
                      href={`#${href}`}
                      onClick={(event) => handleNavClick(event, href)}
                      style={{
                        transitionDelay: isMenuEntered
                          ? `${75 + index * 40}ms`
                          : '0ms',
                      }}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-light transition-[opacity,transform] duration-300 ease-out',
                        isMenuEntered
                          ? 'translate-y-0 opacity-100'
                          : '-translate-y-1 opacity-0',
                      )}
                    >
                      <Icon
                        className="h-4.5 w-4.5 shrink-0"
                        aria-hidden="true"
                      />
                      {label}
                    </a>
                  ))}
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                    style={{
                      transitionDelay: isMenuEntered
                        ? `${75 + navItems.length * 40}ms`
                        : '0ms',
                    }}
                    className={cn(
                      'mt-2 flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-[opacity,transform] duration-300 ease-out sm:hidden',
                      isMenuEntered
                        ? 'translate-y-0 opacity-100'
                        : '-translate-y-1 opacity-0',
                    )}
                  >
                    <CalendarPlus
                      className="h-4.5 w-4.5 shrink-0"
                      aria-hidden="true"
                    />
                    Zarezerwuj wizytę
                  </a>
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
