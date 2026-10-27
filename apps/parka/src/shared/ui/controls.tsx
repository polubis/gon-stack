import {
  createContext,
  useContext,
  useId,
  type ComponentProps,
  type ReactNode,
} from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import type { E2eId } from '@/__e2e__/selectors';
import { usePopoverOpen } from './use-popover-open';

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
              ? 'bg-card text-brand-dark shadow-sm'
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
  disabled?: boolean;
};

export const Toggle = ({
  checked,
  onChange,
  label,
  disabled = false,
}: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50',
      checked ? 'bg-brand' : 'bg-track-strong',
    )}
  >
    <span
      className={cn(
        'inline-block h-5 w-5 transform rounded-full bg-card shadow transition-transform',
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
      ? 'bg-danger-strong'
      : tone === 'warn'
        ? 'bg-warn'
        : 'bg-brand';
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-track"
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
  'data-e2e': dataE2e,
  ...rest
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  href?: string;
  className?: string;
  // Named explicitly (not left to the `Record<string, unknown>` catch-all
  // below) so every `<Button data-e2e="...">` call site is checked against
  // the real `E2eId` union instead of accepting any string.
  'data-e2e'?: E2eId;
} & Record<string, unknown>) => {
  const base =
    'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';
  const styles =
    variant === 'primary'
      ? 'bg-brand text-on-brand hover:bg-brand-dark'
      : variant === 'danger'
        ? 'bg-card text-danger border border-danger-line hover:bg-danger-faint'
        : 'bg-card text-brand-dark border border-line-strong hover:bg-brand-softer';
  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={cn(base, styles, className)}
        data-e2e={dataE2e}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(base, styles, className)}
      data-e2e={dataE2e}
      {...rest}
    >
      {children}
    </button>
  );
};

const FieldContext = createContext<{ id: string; label: string } | null>(null);

/** Id + visible label of the surrounding `Field`, if any. */
export const useField = () => useContext(FieldContext);

export const Field = ({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) => {
  const id = useId();
  return (
    <FieldContext.Provider value={{ id, label }}>
      <div className="block">
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-ink-soft"
        >
          {label}
        </label>
        {children}
        {hint ? (
          <span className="mt-1 block text-xs text-ink-soft">{hint}</span>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
};

export const inputClass =
  'w-full rounded-xl border border-line-strong bg-card px-3 py-2.5 text-sm outline-none focus:border-brand';

/** Plain `<input>` wired to the surrounding `Field` label. */
export const Input = ({ className, id, ...props }: ComponentProps<'input'>) => {
  const field = useField();
  return (
    <input
      {...props}
      id={id ?? field?.id}
      className={cn(inputClass, className)}
    />
  );
};

export type SelectOption = { value: string; label: ReactNode };

/** Radix select wired to the surrounding `Field` label. Empty value shows `placeholder`. */
export const Select = ({
  options,
  value,
  onValueChange,
  placeholder,
  required,
  disabled,
  className,
  id,
  ...props
}: Omit<ComponentProps<typeof SelectPrimitive.Trigger>, 'value'> & {
  required?: boolean;
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}) => {
  const field = useField();
  const { open, setOpen } = usePopoverOpen(
    props['data-e2e'] ?? id ?? field?.id ?? 'field',
  );
  return (
    <SelectPrimitive.Root
      open={open}
      onOpenChange={setOpen}
      value={value}
      onValueChange={onValueChange}
      required={required}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        {...props}
        id={id ?? field?.id}
        className={cn(
          inputClass,
          'flex items-center justify-between gap-2 text-left disabled:opacity-60 data-[placeholder]:text-ink-soft',
          className,
        )}
      >
        <span className="min-w-0 truncate">
          <SelectPrimitive.Value placeholder={placeholder}>
            {/* Own keyed node: page translation wraps text in <font>, which breaks React's in-place text swap. */}
            <span key={value}>
              {options.find((option) => option.value === value)?.label}
            </span>
          </SelectPrimitive.Value>
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-ink-soft"
            aria-hidden="true"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          collisionPadding={16}
          className="z-(--z-popover) min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl border border-line-strong bg-card text-ink shadow-popover"
        >
          <SelectPrimitive.Viewport className="max-h-72 p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex cursor-pointer items-center rounded-lg py-2 pr-8 pl-3 text-sm outline-none select-none data-[highlighted]:bg-brand-softer data-[state=checked]:font-semibold data-[state=checked]:text-brand-dark"
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2 inline-flex">
                  <Check className="h-4 w-4" aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};
