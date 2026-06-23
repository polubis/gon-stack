import { type ComponentProps } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type AccordionRootProps = ComponentProps<typeof AccordionPrimitive.Root>;
export type AccordionItemProps = ComponentProps<typeof AccordionPrimitive.Item>;
export type AccordionTriggerProps = ComponentProps<
  typeof AccordionPrimitive.Trigger
>;
export type AccordionContentProps = ComponentProps<
  typeof AccordionPrimitive.Content
>;

/* =============================================================================
 * Root
 * ============================================================================= */

export const AccordionRoot = ({ className, ...props }: AccordionRootProps) => {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={className}
      {...props}
    />
  );
};

/* =============================================================================
 * Item
 * ============================================================================= */

export const AccordionItem = ({ className, ...props }: AccordionItemProps) => {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={className}
      {...props}
    />
  );
};

/* =============================================================================
 * Trigger
 * ============================================================================= */

export const AccordionTrigger = ({
  className,
  children,
  ...props
}: AccordionTriggerProps) => {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'focus-visible:border-ring cursor-pointer focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-h5 font-500 transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="pointer-events-none size-6 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
};

/* =============================================================================
 * Content
 * ============================================================================= */

export const AccordionContent = ({
  className,
  children,
  ...props
}: AccordionContentProps) => {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-regular font-300"
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
};

/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
};
