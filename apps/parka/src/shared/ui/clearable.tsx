import { useRef, type ComponentProps, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { Input, useField } from './controls';

const TEXT_TYPES = ['text', 'email', 'password', 'search', 'tel', 'url'];

/** Empties the input through the native setter so React `onChange` runs, then focuses it. */
const clear = (el: HTMLInputElement) => {
  Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set?.call(el, '');
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.focus();
};

/**
 * Text-like `<input>` with an "x" button that empties it and refocuses it.
 * Other input types (number, date, ...) render without the button.
 */
export const ClearableInput = ({
  className,
  leading,
  'aria-label': ariaLabel,
  ...props
}: ComponentProps<'input'> & {
  /** Absolutely positioned adornment rendered inside the field (e.g. an icon). */
  leading?: ReactNode;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const field = useField();
  const filled =
    TEXT_TYPES.includes(props.type ?? 'text') &&
    !props.disabled &&
    !props.readOnly &&
    String(props.value ?? '') !== '';

  return (
    <div className="relative">
      {leading}
      <Input
        {...props}
        ref={ref}
        aria-label={ariaLabel}
        className={cn(
          'pr-10 [&::-webkit-search-cancel-button]:hidden',
          className,
        )}
      />
      {filled ? (
        <button
          type="button"
          aria-label={`Wyczyść: ${ariaLabel ?? field?.label ?? props.placeholder ?? 'pole'}`}
          onClick={() => ref.current && clear(ref.current)}
          className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-soft hover:bg-brand-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
};
