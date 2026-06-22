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

type TabsContextValue = {
  activeValue: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const ctx = useContext(TabsContext);
  if (!ctx)
    throw new Error('Tabs compound components must be used within <Tabs>');
  return ctx;
};

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type TabsProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export type TabsListProps = ComponentProps<'div'>;

export type TabsTriggerProps = ComponentProps<'button'> & {
  value: string;
};

export type TabsContentProps = ComponentProps<'div'> & {
  value: string;
};

/* =============================================================================
 * Tabs (Root)
 * ============================================================================= */

export const Tabs = ({
  value,
  defaultValue = '',
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeValue = value !== undefined ? value : internalValue;

  const handleChange = (next: string) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ activeValue, onValueChange: handleChange }}>
      <div className={cn('flex flex-col', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

/* =============================================================================
 * TabsList
 * ============================================================================= */

export const TabsList = ({ className, children, ...props }: TabsListProps) => {
  return (
    <div
      role="tablist"
      className={cn(
        'flex flex-row items-center gap-1',
        'overflow-x-auto',
        'rounded-xl p-1',
        'border border-(--tabs-list-border) bg-(--tabs-list-bg)',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/* =============================================================================
 * TabsTrigger
 * ============================================================================= */

export const TabsTrigger = ({
  value,
  className,
  children,
  ...props
}: TabsTriggerProps) => {
  const { activeValue, onValueChange } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      onClick={() => onValueChange(value)}
      className={cn(
        'flex-1 px-4 py-2',
        'rounded-lg',
        'text-sm font-medium',
        'transition-all duration-160 ease-in-out',
        'outline-none',
        'focus-visible:ring-2 focus-visible:ring-(--tabs-trigger-focus)',
        'disabled:cursor-not-allowed disabled:text-(--tabs-trigger-disabled-text)',
        isActive
          ? [
              'border border-(--tabs-trigger-border-active)',
              'bg-(--tabs-trigger-bg-active)',
              'text-(--tabs-trigger-text-active)',
            ]
          : [
              'border border-transparent',
              'text-(--tabs-trigger-text)',
              'enabled:hover:bg-(--tabs-trigger-bg-hover)',
            ],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

/* =============================================================================
 * TabsContent
 * ============================================================================= */

export const TabsContent = ({
  value,
  className,
  children,
  ...props
}: TabsContentProps) => {
  const { activeValue } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!isActive}
      className={cn(
        'mt-3',
        'text-(--tabs-content-text)',
        !isActive && 'hidden',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
