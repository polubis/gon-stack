import {
  useRef,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { DictationButton } from '@/shared/dictation/dictation-button';
import { Input, inputClass, useField } from './controls';
import { setNativeValue } from './native-value';

const TEXT_TYPES = ['text', 'email', 'password', 'search', 'tel', 'url'];

const DICTATION_TYPES = ['text', 'search'];

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
      <Adornments
        target={ref}
        label={label}
        filled={filled}
        top="top-1/2 -translate-y-1/2"
        before={trailing}
        mic={dictatable}
      />
    </div>
  );
};

const BUTTON_CLASS =
  'grid h-6 w-6 place-items-center rounded-full text-ink-soft hover:bg-brand-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

/**
 * Mic + "x" adornments shared by every text field: mic sits far right when the
 * field is empty and slides left once the "x" appears. `top` aligns it.
 */
const Adornments = ({
  target,
  label,
  filled,
  top,
  before,
  mic = true,
}: {
  target: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  label: string;
  filled: boolean;
  top: string;
  before?: ReactNode;
  mic?: boolean;
}) => (
  <>
    <div
      className={cn(
        'absolute flex items-center gap-1 transition-[right] duration-200 ease-out motion-reduce:transition-none',
        top,
        filled ? 'right-8' : 'right-2',
      )}
    >
      {before}
      {mic ? <DictationButton target={target} label={label} /> : null}
    </div>
    {filled ? (
      <button
        type="button"
        aria-label={`Wyczyść: ${label}`}
        onClick={() => {
          const el = target.current;
          if (!el) return;
          setNativeValue(el, '');
          el.focus();
        }}
        className={cn(
          'absolute right-2 animate-clear-in motion-reduce:animate-none',
          BUTTON_CLASS,
          top,
        )}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    ) : null}
  </>
);

/** `<textarea>` with the same mic + "x" behaviour as `ClearableInput`, anchored top right. */
export const ClearableTextarea = ({
  className,
  label: shortLabel,
  'aria-label': ariaLabel,
  ...props
}: ComponentProps<'textarea'> & {
  /** Short name used by the mic and "x" buttons when the field's own label is long. */
  label?: string;
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const field = useField();
  const editable = !props.disabled && !props.readOnly;
  const filled = editable && String(props.value ?? '') !== '';
  const label =
    shortLabel ?? ariaLabel ?? field?.label ?? props.placeholder ?? 'pole';

  return (
    <div className="relative">
      <textarea
        {...props}
        ref={ref}
        aria-label={ariaLabel}
        className={cn(inputClass, 'pr-16', className)}
      />
      {editable ? (
        <Adornments target={ref} label={label} filled={filled} top="top-2" />
      ) : null}
    </div>
  );
};
