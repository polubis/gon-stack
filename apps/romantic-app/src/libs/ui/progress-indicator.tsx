import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type ProgressIndicatorProps = ComponentProps<'div'> & {
  variant?: 'primary' | 'secondary';
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const ProgressIndicator = ({
  variant = 'primary',
  value = 0,
  max = 100,
  size = 'md',
  showLabel = true,
  className,
  ...props
}: ProgressIndicatorProps) => {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const svgSize = size === 'sm' ? 48 : size === 'lg' ? 96 : 64;
  const strokeWidth = size === 'sm' ? 6 : size === 'lg' ? 8 : 7;

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        'relative inline-flex items-center justify-center',
        className,
      )}
      {...props}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--progress-indicator-track)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={
            variant === 'primary'
              ? 'var(--progress-indicator-primary)'
              : 'var(--progress-indicator-secondary)'
          }
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transformOrigin: 'center',
            transform: 'rotate(-90deg)',
            transition: 'stroke-dashoffset 0.3s ease-out',
          }}
        />
      </svg>
      {showLabel && (
        <span
          className={cn(
            'absolute text-center font-semibold text-(--progress-indicator-text)',
            size === 'sm' && 'text-[0.5rem]',
            size === 'md' && 'text-xs',
            size === 'lg' && 'text-sm',
          )}
          aria-hidden="true"
        >
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
};
