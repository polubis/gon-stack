import { useState, type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type ToggleProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Toggle = ({
  variant = 'secondary',
  pressed,
  defaultPressed = false,
  onPressedChange,
  className,
  onClick,
  ...props
}: ToggleProps) => {
  const [internalPressed, setInternalPressed] = useState(defaultPressed);
  const isControlled = pressed !== undefined;
  const isPressed = isControlled ? pressed : internalPressed;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isControlled) setInternalPressed(!isPressed);
    onPressedChange?.(!isPressed);
    onClick?.(e);
  };

  return (
    <button
      type="button"
      aria-pressed={isPressed}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center',
        'px-3 py-2',
        'rounded-(--toggle-radius)',
        'text-sm font-medium',
        'transition-all duration-160 ease-in-out',
        'outline-none',
        'focus-visible:ring-2 focus-visible:ring-(--toggle-focus)',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' &&
          !isPressed && [
            'border border-(--toggle-primary-border)',
            'bg-(--toggle-primary-bg)',
            'text-(--toggle-primary-text)',
            'enabled:hover:bg-(--toggle-primary-bg-hover)',
          ],
        variant === 'primary' &&
          isPressed && [
            'border border-(--toggle-primary-border-active)',
            'bg-(--toggle-primary-bg-active)',
            'text-(--toggle-primary-text-active)',
            'enabled:hover:saturate-[1.15]',
          ],
        variant === 'secondary' &&
          !isPressed && [
            'border border-(--toggle-secondary-border)',
            'bg-(--toggle-secondary-bg)',
            'text-(--toggle-secondary-text)',
            'enabled:hover:bg-(--toggle-secondary-bg-hover)',
          ],
        variant === 'secondary' &&
          isPressed && [
            'border border-(--toggle-secondary-border-active)',
            'bg-(--toggle-secondary-bg-active)',
            'text-(--toggle-secondary-text-active)',
            'enabled:hover:saturate-[1.15]',
          ],
        className,
      )}
      {...props}
    />
  );
};
