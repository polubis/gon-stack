import { useState } from 'react';
import { appConfig } from '../configuration/constraints';

type NavLink = { label: string; href: string; external?: true };

const navLinks: NavLink[] = [
  { label: 'FAQ', href: `#${appConfig.faqSection.id}` },
  {
    label: 'Kontakt',
    href: appConfig.contactSection.linkedInLink,
    external: true,
  },
  { label: 'Materiały', href: `#${appConfig.materialsSection.id}` },
  { label: 'O mnie', href: `#${appConfig.aboutSection.id}` },
  { label: 'Opinie', href: `#${appConfig.opinionsSection.id}` },
  { label: 'Plany', href: `#${appConfig.plansSection.id}` },
  { label: 'Specjalizacje', href: `#${appConfig.specializationsSection.id}` },
];

const LayoutNavigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className="h-16 mbl:h-18 tbt:h-20 ltp:pt-6 ltp:pb-4 sticky z-[var(--z-layout-navigation)] top-0 backdrop-blur-[24px] bg-[#000100]/10 border-b-2 border-black"
        aria-label="Główna nawigacja"
      >
        <nav className="fluid flex items-center h-full">
          <a title="Strona główna" href="/">
            <img src="/logo.svg" className="size-12" role="img" alt="Logo" />
          </a>

          <ul className="gap-6 ltp:gap-7 ml-auto ltp:flex hidden">
            {navLinks.map(({ label, href, external }) => (
              <li key={label}>
                <a
                  className="text-regular hover:text-white transition-colors font-400 duration-300 ease-in-out"
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <a
            className="primary-button text-center px-6 py-2.5 ml-10 ltp:inline hidden"
            href={`#${appConfig.contactSection.id}`}
          >
            Umów konsultację
          </a>

          <button
            className="ml-auto ltp:hidden cursor-pointer bg-transparent border-0 p-0 text-current"
            aria-label="Otwórz menu"
            onClick={() => setMobileOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        </nav>
      </header>

      {mobileOpen && (
        <nav
          className="fixed grid grid-rows-[auto_1fr] inset-0 z-[var(--z-layout-mobile-navigation)] backdrop-blur-[24px] bg-[#000100]/10 ltp:hidden animate-in fade-in-0 duration-200"
          aria-label="Nawigacja mobilna"
        >
          <div className="h-16 mbl:h-18 tbt:h-20 flex items-center justify-end px-4 mbl:px-6 tbt:px-10">
            <button
              className="cursor-pointer bg-transparent border-0 p-0 text-current"
              aria-label="Zamknij menu"
              title="Zamknij menu"
              onClick={() => setMobileOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col items-center justify-center">
            <ul className="space-y-4">
              {navLinks.map(({ label, href, external }, i) => (
                <li
                  key={label}
                  className={`text-center animate-jump-top-bottom opacity-0 delay-${(i + 1) * 100}`}
                >
                  <a
                    className="hover:text-white font-500 text-h4"
                    href={href}
                    {...(external
                      ? { target: '_blank', rel: 'noreferrer' }
                      : {})}
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              className="primary-button text-center px-6 py-2.5 mt-10 animate-jump-top-bottom opacity-0 delay-800"
              href={`#${appConfig.contactSection.id}`}
              onClick={() => setMobileOpen(false)}
            >
              Umów konsultację
            </a>
          </div>
        </nav>
      )}
    </>
  );
};

export { LayoutNavigation };
