import { LogoWordmark } from './text';

type LogoProps = {
  href?: string;
  className?: string;
};

export const Logo = ({ href = '/', className }: LogoProps) => (
  <a
    href={href}
    className={`inline-flex items-center gap-2 text-ink no-underline ${className ?? ''}`}
  >
    <span className="w-7 h-7 rounded-sm bg-primary text-on-primary inline-flex items-center justify-center font-display font-bold text-base">
      A
    </span>
    <LogoWordmark>Afisz</LogoWordmark>
  </a>
);
