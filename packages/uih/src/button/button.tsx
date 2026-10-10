import type { ComponentProps } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type VariantProps = { variant?: ButtonVariant };

type ButtonRootProps = Omit<ComponentProps<'button'>, 'type'> &
  VariantProps & {
    type?: 'button' | 'submit' | 'reset';
  };

const Root = ({
  variant = 'primary',
  type = 'button',
  ref,
  ...props
}: ButtonRootProps) => (
  <button
    ref={ref}
    {...props}
    type={type}
    data-ds-button=""
    data-variant={variant}
  />
);

export const Button = { Root };
export type { ButtonRootProps, ButtonVariant };
