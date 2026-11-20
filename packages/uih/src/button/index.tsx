import type { ComponentProps } from 'react';

type ButtonAppearance = 'solid';
type ButtonColor = 'primary';
type ButtonSize = 's' | 'm' | 'l';

type ButtonRootProps = Omit<ComponentProps<'button'>, 'type' | 'color'> & {
  appearance?: ButtonAppearance;
  color?: ButtonColor;
  size?: ButtonSize;
  type?: 'button' | 'submit' | 'reset';
};

const Root = ({
  appearance = 'solid',
  color = 'primary',
  size = 'm',
  type = 'button',
  ref,
  ...props
}: ButtonRootProps) => (
  <button
    ref={ref}
    {...props}
    type={type}
    data-ds="button"
    data-appearance={appearance}
    data-color={color}
    data-size={size}
  />
);

export const Button = { Root };
export type { ButtonAppearance, ButtonColor, ButtonRootProps, ButtonSize };
