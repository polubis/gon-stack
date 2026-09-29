import { useState, type ComponentProps } from 'react';
import { inputClass } from './controls';

const parse = (text: string): number => {
  const n = Number(text.replace(',', '.'));
  return Number.isNaN(n) ? 0 : n;
};

const format = (value: number): string => (value === 0 ? '' : String(value));

/**
 * Text-based numeric field: accepts `,` or `.` as decimal separator, keeps
 * partial input (`3,`) and can be fully cleared. Reports `0` when empty.
 */
export const NumberInput = ({
  value,
  onValueChange,
  integer = false,
  className,
  ...props
}: Omit<
  ComponentProps<'input'>,
  'value' | 'onChange' | 'type' | 'inputMode'
> & {
  value: number;
  onValueChange: (value: number) => void;
  integer?: boolean;
}) => {
  const [text, setText] = useState(format(value));
  const shown = parse(text) === value ? text : format(value);

  return (
    <input
      type="text"
      inputMode={integer ? 'numeric' : 'decimal'}
      autoComplete="off"
      placeholder="0"
      {...props}
      className={className ?? inputClass}
      value={shown}
      onChange={(e) => {
        const next = e.target.value;
        if (!(integer ? /^\d*$/ : /^\d*[.,]?\d*$/).test(next)) return;
        setText(next);
        onValueChange(parse(next));
      }}
    />
  );
};
