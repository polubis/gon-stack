import type { ReactNode } from 'react';
import { cn } from '@repo/react-kit/cn';

type RingProps = {
  pct: number;
  label: string;
  tone?: 'brand' | 'warn' | 'danger';
  /** `hero`: sits on the obsidian card. `card`: sits on a plain card. */
  surface?: 'hero' | 'card';
  className?: string;
  children?: ReactNode;
};

const STROKE = {
  hero: {
    track: 'stroke-hero-track',
    brand: 'stroke-accent',
    warn: 'stroke-hero-warn',
    danger: 'stroke-hero-danger',
  },
  card: {
    track: 'stroke-track',
    brand: 'stroke-brand',
    warn: 'stroke-warn',
    danger: 'stroke-danger-strong',
  },
} as const;

/** Circular progress. Same contract as `ProgressBar`; draws itself once on mount. */
export const Ring = ({
  pct,
  label,
  tone = 'brand',
  surface = 'card',
  className,
  children,
}: RingProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const stroke = STROKE[surface];
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        'relative grid size-24 shrink-0 place-items-center',
        className,
      )}
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="12"
          className={stroke.track}
        />
        {clamped > 0 ? (
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset={100 - clamped}
            className={cn(
              'animate-ring-in motion-reduce:animate-none',
              stroke[tone],
            )}
          />
        ) : null}
      </svg>
      <span className="relative text-lg font-semibold tabular-nums">
        {children ?? `${clamped}%`}
      </span>
    </div>
  );
};
