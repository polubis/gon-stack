import { useState, type ComponentProps, type ReactNode } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { createHookContext } from '../power-context';
import { cn } from './cn';

/* =============================================================================
 * Shared Types
 * ============================================================================= */

type SliderValue = number[];

type SliderRootProps = ComponentProps<typeof SliderPrimitive.Root>;
type SliderContextValue = {
  values: SliderValue;
};

/* =============================================================================
 * Context (single root provider)
 * ============================================================================= */

const [SliderProvider, useSliderContext] = createHookContext(
  'Slider',
  (value: SliderContextValue) => value,
);

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type SliderRootCompoundProps = SliderRootProps;

export type SliderTrackProps = ComponentProps<typeof SliderPrimitive.Track>;
export type SliderRangeProps = ComponentProps<typeof SliderPrimitive.Range>;
export type SliderThumbProps = ComponentProps<typeof SliderPrimitive.Thumb> & {
  showValueLabel?: boolean;
  formatValueLabel?: (value: number) => ReactNode;
  valueLabelClassName?: string;
  index: number;
};
export type SliderThumbsProps = Omit<SliderThumbProps, 'index'>;

/* =============================================================================
 * Helpers
 * ============================================================================= */

const getResolvedValues = (
  value: SliderRootProps['value'],
  defaultValue: SliderRootProps['defaultValue'],
  min: number,
): SliderValue => {
  if (Array.isArray(value) && value.length > 0) {
    return value;
  }

  if (Array.isArray(defaultValue) && defaultValue.length > 0) {
    return defaultValue;
  }

  return [min ?? 0];
};

/* =============================================================================
 * Root
 * ============================================================================= */

export const SliderRoot = ({
  className,
  children,
  min = 0,
  max = 100,
  value,
  defaultValue,
  onValueChange,
  ...props
}: SliderRootCompoundProps) => {
  const [internalValue, setInternalValue] = useState<SliderValue>(() =>
    getResolvedValues(value, defaultValue, min),
  );

  const isControlled = Array.isArray(value);
  const values = isControlled ? value : internalValue;

  const handleValueChange = (nextValue: SliderValue) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  return (
    <SliderProvider
      value={{
        values,
      }}
    >
      <SliderPrimitive.Root
        min={min}
        max={max}
        value={isControlled ? value : undefined}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        className={cn(
          'relative flex w-full items-center',
          'touch-none select-none',
          'data-disabled:sepia data-disabled:saturate-50 data-disabled:brightness-90',
          'data-[orientation=vertical]:h-40 data-[orientation=vertical]:w-5 data-[orientation=vertical]:flex-col data-[orientation=vertical]:py-2',
          className,
        )}
        {...props}
      >
        {children}
      </SliderPrimitive.Root>
    </SliderProvider>
  );
};

/* =============================================================================
 * Track
 * ============================================================================= */

export const SliderTrack = ({ className, ...props }: SliderTrackProps) => {
  return (
    <SliderPrimitive.Track
      className={cn(
        'relative h-2 w-full grow overflow-hidden rounded-full',
        'border border-(--slider-track-border) bg-(--slider-track-bg) shadow-inner shadow-(color:--slider-track-shadow)',
        'data-[orientation=vertical]:w-2',
        className,
      )}
      {...props}
    />
  );
};

/* =============================================================================
 * Range
 * ============================================================================= */

export const SliderRange = ({ className, ...props }: SliderRangeProps) => {
  return (
    <SliderPrimitive.Range
      className={cn(
        'absolute h-full rounded-full',
        'bg-linear-to-r from-(--slider-range-from) to-(--slider-range-to) shadow-lg shadow-(color:--slider-range-glow)',
        'data-[orientation=vertical]:w-full',
        className,
      )}
      {...props}
    />
  );
};

/* =============================================================================
 * Thumb
 * ============================================================================= */

export const SliderThumb = ({
  className,
  index,
  showValueLabel = true,
  formatValueLabel = (value) => value,
  valueLabelClassName,
  children,
  ...props
}: SliderThumbProps) => {
  const context = useSliderContext();
  const value = context.values[index];

  return (
    <SliderPrimitive.Thumb
      className={cn(
        'relative block size-5 rounded-full',
        'border border-(--slider-thumb-border) bg-linear-to-br from-(--slider-thumb-from) to-(--slider-thumb-to) shadow-md shadow-(color:--slider-thumb-glow)',
        'transition-[transform,box-shadow] duration-150',
        'data-[state=active]:scale-110 data-[state=active]:shadow-lg data-disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--slider-thumb-focus) focus-visible:ring-offset-0',
        className,
      )}
      {...props}
    >
      {showValueLabel && value !== undefined ? (
        <span
          className={cn(
            'pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2',
            'rounded-full px-2.5 py-1',
            'text-xs uppercase tracking-wider text-(--slider-label-text)',
            'border border-(--slider-label-border) bg-(--slider-label-bg) shadow-md shadow-(color:--slider-label-glow)',
            valueLabelClassName,
          )}
        >
          {formatValueLabel(value)}
        </span>
      ) : null}
      {children}
    </SliderPrimitive.Thumb>
  );
};

/* =============================================================================
 * Thumbs
 * ============================================================================= */

export const SliderThumbs = (props: SliderThumbsProps) => {
  const context = useSliderContext();

  return context.values.map((_, index) => (
    <SliderThumb key={index} {...props} index={index} />
  ));
};

/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const Slider = {
  Root: SliderRoot,
  Track: SliderTrack,
  Range: SliderRange,
  Thumb: SliderThumb,
  Thumbs: SliderThumbs,
};
