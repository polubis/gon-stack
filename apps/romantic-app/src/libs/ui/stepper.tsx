import {
  useState,
  useCallback,
  type ComponentProps,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
import { Minus, Plus } from 'lucide-react';

import { createHookContext } from '@repo/react-kit/context';
import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Shared Types
 * ============================================================================= */

type StepperContextValue = {
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  atMin: boolean;
  atMax: boolean;
  increment: () => void;
  decrement: () => void;
  update: (next: number) => void;
};

/* =============================================================================
 * Context
 * ============================================================================= */

const [StepperProvider, useStepperContext] = createHookContext(
  'Stepper',
  (value: StepperContextValue) => value,
);

/* =============================================================================
 * Helpers
 * ============================================================================= */

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const getResolvedValue = (
  value: number | undefined,
  defaultValue: number | undefined,
  min: number,
): number => {
  if (value !== undefined) return value;
  if (defaultValue !== undefined) return defaultValue;
  return min;
};

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type StepperRootProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

export type StepperButtonProps = ComponentProps<'button'> & {
  action: 'increment' | 'decrement';
};

export type StepperInputProps = Omit<ComponentProps<'input'>, 'value'> & {
  formatDisplay?: (value: number) => ReactNode;
};

/* =============================================================================
 * Root
 * ============================================================================= */

export const StepperRoot = ({
  value: controlledValue,
  defaultValue,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  disabled = false,
  className,
  children,
  ...props
}: StepperRootProps) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    clamp(getResolvedValue(controlledValue, defaultValue, min), min, max),
  );

  const current = isControlled ? controlledValue : internalValue;
  const atMin = current <= min;
  const atMax = current >= max;

  const update = useCallback(
    (next: number) => {
      const clamped = clamp(next, min, max);
      if (!isControlled) {
        setInternalValue(clamped);
      }
      onChange?.(clamped);
    },
    [isControlled, min, max, onChange],
  );

  const increment = useCallback(
    () => update(current + step),
    [update, current, step],
  );
  const decrement = useCallback(
    () => update(current - step),
    [update, current, step],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowRight':
          event.preventDefault();
          increment();
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
          event.preventDefault();
          decrement();
          break;
        case 'Home':
          event.preventDefault();
          update(min);
          break;
        case 'End':
          event.preventDefault();
          update(max);
          break;
      }
    },
    [disabled, increment, decrement, update, min, max],
  );

  return (
    <StepperProvider
      value={{
        value: current,
        min,
        max,
        step,
        disabled,
        atMin,
        atMax,
        increment,
        decrement,
        update,
      }}
    >
      <div
        className={cn('inline-flex items-center gap-3', className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    </StepperProvider>
  );
};

/* =============================================================================
 * Button
 * ============================================================================= */

export const StepperButton = ({
  action,
  className,
  children,
  ...props
}: StepperButtonProps) => {
  const ctx = useStepperContext();

  const isDisabled =
    ctx.disabled || (action === 'decrement' ? ctx.atMin : ctx.atMax);
  const handler = action === 'decrement' ? ctx.decrement : ctx.increment;
  const label = action === 'decrement' ? 'Decrease value' : 'Increase value';
  const defaultIcon =
    action === 'decrement' ? (
      <Minus className="size-4" aria-hidden="true" />
    ) : (
      <Plus className="size-4" aria-hidden="true" />
    );

  return (
    <button
      type="button"
      onClick={handler}
      disabled={isDisabled}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center',
        'size-10 rounded-(--btn-radius)',
        'transition-all duration-160 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--btn-focus) focus-visible:ring-offset-0',
        'disabled:cursor-not-allowed',
        'border border-(--stepper-btn-border) bg-(--stepper-btn-bg) text-(--stepper-btn-text)',
        'enabled:hover:bg-(--stepper-btn-bg-hover)',
        'disabled:border-(--stepper-btn-disabled-border) disabled:bg-(--stepper-btn-disabled-bg) disabled:text-(--stepper-btn-disabled-text)',
        className,
      )}
      {...props}
    >
      {children ?? defaultIcon}
    </button>
  );
};

/* =============================================================================
 * Input
 * ============================================================================= */

export const StepperInput = ({
  formatDisplay,
  className,
  ...props
}: StepperInputProps) => {
  const ctx = useStepperContext();

  return (
    <div className="relative">
      <input
        readOnly
        tabIndex={ctx.disabled ? -1 : 0}
        value={ctx.value}
        aria-valuemin={ctx.min}
        aria-valuemax={ctx.max}
        aria-valuenow={ctx.value}
        aria-disabled={ctx.disabled || undefined}
        role="spinbutton"
        className={cn(
          'w-16 rounded-(--input-radius) px-3 py-2 text-center text-sm font-semibold',
          'border border-(--input-border) bg-(--input-bg)',
          'transition-all duration-160 ease-in-out',
          'focus-visible:outline-none focus-visible:border-(--input-focus-border) focus-visible:shadow-(--input-focus-shadow)',
          formatDisplay ? 'text-transparent' : 'text-(--input-text)',
          ctx.disabled && [
            'border-(--input-disabled-border) bg-(--input-disabled-bg) cursor-not-allowed',
            !formatDisplay && 'text-(--input-disabled-text)',
          ],
          className,
        )}
        {...props}
      />
      {formatDisplay ? (
        <span
          className={cn(
            'pointer-events-none absolute inset-0 flex items-center justify-center',
            'text-sm font-semibold',
            ctx.disabled
              ? 'text-(--input-disabled-text)'
              : 'text-(--input-text)',
          )}
          aria-hidden="true"
        >
          {formatDisplay(ctx.value)}
        </span>
      ) : null}
    </div>
  );
};

/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const Stepper = {
  Root: StepperRoot,
  Button: StepperButton,
  Input: StepperInput,
};
