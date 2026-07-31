/* =============================================================================
 * Public Props
 * ============================================================================= */

export type ToggleProps = {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onCheckedChange: () => void;
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Toggle = ({
  checked,
  disabled,
  label,
  onCheckedChange,
}: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={onCheckedChange}
    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-line'}${disabled ? ' opacity-60' : ''}`}
  >
    <span
      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform${checked ? ' translate-x-5' : ''}`}
    />
  </button>
);
