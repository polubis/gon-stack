import { useState, useEffect } from 'react';
import { cn } from '@/libs/ui/cn';
import { SECTIONS } from './schema';

// ── Types ──────────────────────────────────────────────────────────────────────

type Props = {
  sectionDone: Record<string, boolean>;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const scrollToSection =
  (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: 'smooth' });
  };

// ── Component ──────────────────────────────────────────────────────────────────

export const FormSidebar = ({ sectionDone }: Props) => {
  const [activeSection, setActiveSection] = useState('basic');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: '-15% 0px -60% 0px' },
    );
    for (const { id } of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="hidden lg:block self-stretch">
      <div className="sticky top-24">
        <p className="mono-label mb-6">Formularz</p>
        <nav>
          {SECTIONS.map(({ id, label, optional }, i) => {
            const done = sectionDone[id];
            const active = activeSection === id;
            const isLast = i === SECTIONS.length - 1;
            return (
              <div key={id} className="flex gap-3.5">
                <div className="flex flex-col items-center shrink-0">
                  <a
                    href={`#${id}`}
                    onClick={scrollToSection(id)}
                    className={cn(
                      'w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center text-[10px] font-medium transition-all no-underline',
                      active
                        ? 'bg-coral border-coral text-white'
                        : done
                          ? 'bg-ink border-ink text-on-primary'
                          : 'bg-canvas border-hairline text-muted',
                    )}
                  >
                    {done && !active ? '✓' : i + 1}
                  </a>
                  {!isLast && (
                    <div
                      className={cn(
                        'w-px flex-1 my-1 min-h-8',
                        done ? 'bg-ink/20' : 'bg-hairline',
                      )}
                    />
                  )}
                </div>
                <div className={cn('pb-7', isLast && 'pb-0')}>
                  <a
                    href={`#${id}`}
                    onClick={scrollToSection(id)}
                    className={cn(
                      'text-sm transition-colors no-underline block leading-none pt-0.75',
                      active
                        ? 'text-ink font-medium'
                        : 'text-muted hover:text-ink',
                    )}
                  >
                    {label}
                  </a>
                  {optional && (
                    <span className="text-xs text-muted block mt-0.5">
                      opcjonalne
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
