import { Moon, Sparkles } from 'lucide-react';
import { copy } from './copy';

type Props = {
  layout?: 'stacked' | 'inline';
  className?: string;
};

export const Logo = ({ layout = 'stacked', className = '' }: Props) => (
  <div
    data-e2e="home:logo"
    className={`flex flex-col items-center ${className}`}
  >
    <div className="relative flex items-center justify-center">
      <Sparkles
        className="absolute -left-4 top-0 h-3 w-3 text-white/90"
        aria-hidden="true"
      />
      <Sparkles
        className="absolute -right-3 top-4 h-2.5 w-2.5 text-white/80"
        aria-hidden="true"
      />
      <Moon
        className="h-14 w-14 rotate-[-100deg] fill-orange-500 text-orange-500 sm:h-16 sm:w-16"
        aria-hidden="true"
      />
    </div>

    {layout === 'stacked' ? (
      <span className="mt-5 text-center text-sm font-bold leading-tight tracking-[0.18em] text-white">
        {copy.brand.line1}
        <br />
        {copy.brand.line2}
      </span>
    ) : (
      <span className="mt-5 text-sm font-bold tracking-[0.22em] text-white">
        {copy.brand.inline}
      </span>
    )}
  </div>
);
