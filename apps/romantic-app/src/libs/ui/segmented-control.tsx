import {
  createContext,
  useContext,
  useState,
  type ComponentProps,
} from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Context
 * ============================================================================= */

type SegmentedContextValue = {
  value: string;
  onChange: (value: string) => void;
  name: string;
};

const SegmentedContext = createContext<SegmentedContextValue | null>(null);

const useSegmentedContext = () => {
  const ctx = useContext(SegmentedContext);
  if (!ctx)
    throw new Error(
      'SegmentedControl.Item must be used within SegmentedControl.Root',
    );
  return ctx;
};

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type SegmentedControlRootProps = Omit<
  ComponentProps<'div'>,
  'onChange'
> & {
  variant?: 'primary' | 'secondary';
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
};

export type SegmentedControlItemProps = ComponentProps<'label'> & {
  value: string;
  disabled?: boolean;
};

/* =============================================================================
 * Root
 * ============================================================================= */

export const SegmentedControlRoot = ({
  variant: _variant,
  value,
  defaultValue = '',
  onChange,
  name = 'segmented',
  className,
  children,
  ...props
}: SegmentedControlRootProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  return (
    <SegmentedContext.Provider
      value={{ value: currentValue, onChange: handleChange, name }}
    >
      <div
        role="radiogroup"
        className={cn(
          'inline-flex items-center gap-1',
          'rounded-xl p-1',
          'border border-(--segmented-border) bg-(--segmented-bg)',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </SegmentedContext.Provider>
  );
};

/* =============================================================================
 * Item
 * ============================================================================= */

export const SegmentedControlItem = ({
  value,
  disabled,
  className,
  children,
  ...props
}: SegmentedControlItemProps) => {
  const ctx = useSegmentedContext();
  const isActive = ctx.value === value;

  return (
    <label
      className={cn(
        'relative cursor-pointer select-none',
        disabled && 'pointer-events-none',
        className,
      )}
      {...props}
    >
      <input
        type="radio"
        name={ctx.name}
        value={value}
        checked={isActive}
        disabled={disabled}
        onChange={() => ctx.onChange(value)}
        className="sr-only"
      />
      <span
        className={cn(
          'flex items-center justify-center',
          'px-4 py-1.5',
          'rounded-lg',
          'text-sm font-medium',
          'transition-all duration-160 ease-in-out',
          'outline-none',
          isActive
            ? [
                'border border-(--segmented-item-border-active)',
                'bg-(--segmented-item-bg-active)',
                'text-(--segmented-item-text-active)',
              ]
            : [
                'border border-transparent',
                'text-(--segmented-item-text)',
                'hover:bg-(--segmented-item-bg-hover)',
              ],
          disabled && 'text-(--segmented-item-disabled)',
        )}
      >
        {children}
      </span>
    </label>
  );
};

/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const SegmentedControl = {
  Root: SegmentedControlRoot,
  Item: SegmentedControlItem,
};
