import { useRef, type ComponentProps, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { DictationButton } from '@/shared/dictation/dictation-button';
import { Input, useField } from './controls';
import { setNativeValue } from './native-value';

const TEXT_TYPES = ['text', 'email', 'password', 'search', 'tel', 'url'];

const DICTATION_TYPES = ['text', 'search'];

/** Empties the input through the native setter so React `onChange` runs, then focuses it. */
const clear = (el: HTMLInputElement) => {
  setNativeValue(el, '');
  el.focus();
};

/**
 * Text-like `<input>` with an "x" button that empties it and refocuses it,
 * and (text/search) a mic button for voice dictation. Other input types (number, date, ...) render without the button.
 */
export const ClearableInput = ({
  className,
  leading,
  trailing,
  'aria-label': ariaLabel,
  ...props
}: ComponentProps<'input'> & {
  /** Absolutely positioned adornment rendered inside the field (e.g. an icon). */
  leading?: ReactNode;
  /** Control rendered inside the field, left of the mic and clear buttons. */
  trailing?: ReactNode;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const field = useField();
  const editable =
    TEXT_TYPES.includes(props.type ?? 'text') &&
    !props.disabled &&
    !props.readOnly;
  const filled = editable && String(props.value ?? '') !== '';
  const dictatable = editable && DICTATION_TYPES.includes(props.type ?? 'text');
  const label = ariaLabel ?? field?.label ?? props.placeholder ?? 'pole';

  return (
    <div className="relative">
      {leading}
      <Input
        {...props}
        ref={ref}
        aria-label={ariaLabel}
        className={cn(
          trailing || dictatable ? 'pr-16' : 'pr-10',
          trailing && dictatable && 'pr-24',
          '[&::-webkit-search-cancel-button]:hidden',
          className,
        )}
      />
      <div
        className={cn(
          'absolute top-1/2 flex -translate-y-1/2 items-center gap-1 transition-[right] duration-200 ease-out motion-reduce:transition-none',
          filled ? 'right-8' : 'right-2',
        )}
      >
        {trailing}
        {dictatable ? <DictationButton target={ref} label={label} /> : null}
      </div>
      {filled ? (
        <button
          type="button"
          aria-label={`Wyczyść: ${label}`}
          onClick={() => ref.current && clear(ref.current)}
          className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-soft hover:bg-brand-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand animate-clear-in motion-reduce:animate-none"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
};
