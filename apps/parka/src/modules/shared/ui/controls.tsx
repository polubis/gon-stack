import { cn } from '@repo/react-kit/cn';

type SegmentedProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
};

export const Segmented = <T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedProps<T>) => (
  <div
    role="tablist"
    aria-label={label}
    className="flex gap-1 rounded-xl bg-brand-soft p-1"
  >
    {options.map((opt) => {
      const selected = opt.value === value;
      return (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={selected}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            selected
              ? 'bg-white text-brand-dark shadow-sm'
              : 'text-ink-soft hover:text-ink',
          )}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export const Toggle = ({ checked, onChange, label }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
      checked ? 'bg-brand' : 'bg-black/15',
    )}
  >
    <span
      className={cn(
        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0.5',
      )}
    />
  </button>
);

type ProgressProps = {
  pct: number;
  label: string;
  tone?: 'brand' | 'warn' | 'danger';
};

export const ProgressBar = ({ pct, label, tone = 'brand' }: ProgressProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const bar =
    tone === 'danger'
      ? 'bg-rose-600'
      : tone === 'warn'
        ? 'bg-orange-500'
        : 'bg-brand';
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-black/10"
    >
      <div
        className={cn('h-full rounded-full', bar)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};

export const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  href,
  className,
  ...rest
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
  onClick?: () => void;
  href?: string;
  className?: string;
} & Record<string, unknown>) => {
  const base =
    'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors';
  const styles =
    variant === 'primary'
      ? 'bg-brand text-white hover:bg-brand-dark'
      : variant === 'danger'
        ? 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
        : 'bg-white text-brand-dark border border-black/10 hover:bg-brand-softer';
  if (href) {
    return (
      <a href={href} className={cn(base, styles, className)} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(base, styles, className)}
      {...rest}
    >
      {children}
    </button>
  );
};

export const Field = ({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-ink-soft">
      {label}
    </span>
    {children}
    {hint ? (
      <span className="mt-1 block text-xs text-ink-soft">{hint}</span>
    ) : null}
  </label>
);

export const inputClass =
  'w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand';
