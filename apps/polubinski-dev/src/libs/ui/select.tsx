import { type ComponentProps } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type SelectRootProps = ComponentProps<typeof SelectPrimitive.Root> & {
  className?: string;
};
export type SelectGroupProps = ComponentProps<typeof SelectPrimitive.Group>;
export type SelectValueProps = ComponentProps<typeof SelectPrimitive.Value>;
export type SelectTriggerProps = ComponentProps<typeof SelectPrimitive.Trigger>;
export type SelectContentProps = ComponentProps<typeof SelectPrimitive.Content>;
export type SelectLabelProps = ComponentProps<typeof SelectPrimitive.Label>;
export type SelectItemProps = ComponentProps<typeof SelectPrimitive.Item>;
export type SelectSeparatorProps = ComponentProps<
  typeof SelectPrimitive.Separator
>;
export type SelectScrollUpButtonProps = ComponentProps<
  typeof SelectPrimitive.ScrollUpButton
>;
export type SelectScrollDownButtonProps = ComponentProps<
  typeof SelectPrimitive.ScrollDownButton
>;

/* =============================================================================
 * Root
 * ============================================================================= */

export const SelectRoot = ({ ...props }: SelectRootProps) => {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
};

/* =============================================================================
 * Group
 * ============================================================================= */

export const SelectGroup = ({ ...props }: SelectGroupProps) => {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
};

/* =============================================================================
 * Value
 * ============================================================================= */

export const SelectValue = ({ ...props }: SelectValueProps) => {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className="text-regular font-400"
      {...props}
    />
  );
};

/* =============================================================================
 * ScrollUpButton
 * ============================================================================= */

export const SelectScrollUpButton = ({
  className,
  ...props
}: SelectScrollUpButtonProps) => {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
  );
};

/* =============================================================================
 * ScrollDownButton
 * ============================================================================= */

export const SelectScrollDownButton = ({
  className,
  ...props
}: SelectScrollDownButtonProps) => {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  );
};

/* =============================================================================
 * Trigger
 * ============================================================================= */

export const SelectTrigger = ({
  className,
  children,
  ...props
}: SelectTriggerProps) => {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        'flex w-full h-10 items-center cursor-pointer justify-between rounded-md bg-background px-4 py-2 text-regular font-400 shadow-sm',
        'border border-[#1A1A1A]',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="ml-2 h-5 w-5" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
};

/* =============================================================================
 * Content
 * ============================================================================= */

export const SelectContent = ({
  className,
  children,
  position = 'popper',
  ...props
}: SelectContentProps) => {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          'relative z-50 max-h-60 min-w-[8rem] overflow-hidden rounded-md border border-[#1A1A1A] bg-background shadow-md',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
};

/* =============================================================================
 * Label
 * ============================================================================= */

export const SelectLabel = ({ className, ...props }: SelectLabelProps) => {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn('px-2 py-1.5 text-regular font-400', className)}
      {...props}
    />
  );
};

/* =============================================================================
 * Item
 * ============================================================================= */

export const SelectItem = ({
  className,
  children,
  ...props
}: SelectItemProps) => {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex cursor-pointer w-full select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-regular font-400',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
};

/* =============================================================================
 * Separator
 * ============================================================================= */

export const SelectSeparator = ({
  className,
  ...props
}: SelectSeparatorProps) => {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('-mx-1 my-1 h-px bg-gray-700', className)}
      {...props}
    />
  );
};

/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const Select = {
  Root: SelectRoot,
  Group: SelectGroup,
  Value: SelectValue,
  Trigger: SelectTrigger,
  Content: SelectContent,
  Label: SelectLabel,
  Item: SelectItem,
  Separator: SelectSeparator,
  ScrollUpButton: SelectScrollUpButton,
  ScrollDownButton: SelectScrollDownButton,
};
