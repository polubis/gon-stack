import {
  createContext,
  useContext,
  useId,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import type { E2eId } from '@/__e2e__/selectors';
import { usePopoverOpen } from './use-popover-open';

type SegmentedProps<T extends string> = {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /**
   * Base id of the panel the tabs switch. Gives every tab `aria-controls`;
   * the panel carries `segmentedIds(panel, value)` (`role="tabpanel"`).
   */
  panel?: string;
};

/** Ids tying a tab to its panel (`aria-controls` / `aria-labelledby`). */
export const segmentedIds = (panel: string, value: string) => ({
  tab: `${panel}-tab-${value}`,
  panel: `${panel}-panel`,
});

export const Segmented = <T extends string>({
  options,
  value,
  onChange,
  label,
  panel,
}: SegmentedProps<T>) => {
  const move = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const at = options.findIndex((opt) => opt.value === value);
    const target =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? options.length - 1
          : (at + (event.key === 'ArrowRight' ? 1 : -1) + options.length) %
            options.length;
    event.preventDefault();
    onChange(options[target]!.value);
    event.currentTarget
      .querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [target]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={move}
      className="flex gap-1 rounded-full bg-hover p-1"
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            id={panel ? segmentedIds(panel, opt.value).tab : undefined}
            aria-selected={selected}
            aria-controls={
              panel ? segmentedIds(panel, opt.value).panel : undefined
            }
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 motion-reduce:transition-none',
              selected
                ? 'bg-brand text-on-brand shadow-cta'
                : 'text-ink-soft hover:text-ink',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

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
      'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none',
      checked ? 'bg-brand' : 'bg-track-strong',
    )}
  >
    <span
      className={cn(
        'inline-block h-5.5 w-5.5 transform rounded-full shadow transition-transform duration-200 ease-enter motion-reduce:transition-none',
        checked ? 'translate-x-5.75 bg-on-brand' : 'translate-x-0.75 bg-card',
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
    'pressable inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface';
  const styles =
    variant === 'primary'
      ? 'cta shadow-cta hover:bg-brand-dark'
      : variant === 'danger'
        ? 'bg-card text-danger border border-danger-line hover:bg-danger-faint'
        : 'bg-card text-ink border border-line-strong hover:bg-brand-softer';
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
  'w-full rounded-xl border border-line-strong bg-card px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand focus:ring-4 focus:ring-brand/10 motion-reduce:transition-none';

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
          className="z-(--z-popover) min-w-(--radix-select-trigger-width) overflow-hidden rounded-2xl border border-line bg-card text-ink shadow-popover"
        >
          <SelectPrimitive.Viewport className="max-h-72 p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex cursor-pointer items-center rounded-xl py-2.5 pr-8 pl-3 text-sm outline-none select-none data-[highlighted]:bg-brand-soft data-[state=checked]:font-semibold data-[state=checked]:text-brand-dark"
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
