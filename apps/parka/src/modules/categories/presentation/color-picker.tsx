import { Check } from 'lucide-react';
import { SelectPopover } from '@/shared/ui/select-popover';
import { COLORS } from '../configuration/constraints';

type Props = {
  value: string;
  /** A non-preset color the category already has, shown as an extra swatch. */
  custom: string | null;
  onChange: (color: string) => void;
};

export const ColorPicker = ({ value, custom, onChange }: Props) => {
  const swatches: readonly string[] = custom ? [...COLORS, custom] : COLORS;

  return (
    <SelectPopover
      label="Kolor"
      data-e2e="categories:form-color"
      value={
        <span
          className="h-5 w-5 shrink-0 rounded-full"
          style={{ backgroundColor: value }}
        />
      }
    >
      {(close) => (
        <div className="grid grid-cols-5 gap-2">
          {swatches.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Kolor ${c}`}
              aria-pressed={c === value}
              data-e2e={`categories:form-color-option:${c}`}
              onClick={() => {
                onChange(c);
                close();
              }}
              className="mx-auto grid h-9 w-9 place-items-center rounded-full"
              style={{ backgroundColor: c }}
            >
              {c === value ? (
                <Check className="h-4 w-4 text-on-brand" aria-hidden="true" />
              ) : null}
            </button>
          ))}
        </div>
      )}
    </SelectPopover>
  );
};
