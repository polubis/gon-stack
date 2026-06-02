import type { CSSProperties } from 'react';
import { cn } from '@/libs/ui/cn';
import { POSTER_PALETTES } from './mock-data';
import type { Event } from './mock-data';

type PosterSize = 'sm' | 'md' | 'lg';

type PosterProps = {
  event: Event;
  size?: PosterSize;
  className?: string;
};

const TITLE_SIZE: Record<PosterSize, string> = {
  lg: 'text-[56px]',
  md: 'text-[32px]',
  sm: 'text-[22px]',
};
const META_SIZE: Record<PosterSize, string> = {
  lg: 'text-[12px]',
  md: 'text-[11px]',
  sm: 'text-[11px]',
};
const INSET: Record<PosterSize, string> = {
  lg: 'left-7 right-7 bottom-7',
  md: 'left-[18px] right-[18px] bottom-[18px]',
  sm: 'left-3.5 right-3.5 bottom-3.5',
};

export const Poster = ({ event, size = 'md', className }: PosterProps) => {
  const p = POSTER_PALETTES[event.palette % POSTER_PALETTES.length];

  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden rounded-[inherit] bg-(--poster-bg) text-(--poster-fg)',
        className,
      )}
      style={
        {
          '--poster-bg': p.bg,
          '--poster-fg': p.fg,
          '--poster-accent': p.accent,
          '--poster-grid': `${p.fg}10`,
          '--poster-accent-glow': `${p.accent}66`,
          '--poster-fg-glow': `${p.fg}20`,
        } as CSSProperties
      }
    >
      {/* grid texture */}
      <div className="absolute inset-0 opacity-60 pointer-events-none bg-size-[32px_32px] bg-[linear-gradient(var(--poster-grid)_1px,transparent_1px),linear-gradient(90deg,var(--poster-grid)_1px,transparent_1px)]" />
      {/* radial glow */}
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(120%_80%_at_80%_110%,var(--poster-accent-glow),transparent_60%),radial-gradient(80%_60%_at_10%_-10%,var(--poster-fg-glow),transparent_60%)]" />
      {/* title block */}
      <div className={cn('absolute flex flex-col gap-2.5', INSET[size])}>
        <div
          className={cn(
            'font-display font-semibold leading-[0.92] tracking-[-0.03em] whitespace-pre-line uppercase',
            TITLE_SIZE[size],
          )}
        >
          {event.posterTitle}
        </div>
        <div
          className={cn(
            'font-mono tracking-[0.14em] opacity-[0.85]',
            META_SIZE[size],
          )}
        >
          {event.posterMeta}
        </div>
      </div>
      {/* accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-(--poster-accent)" />
    </div>
  );
};
