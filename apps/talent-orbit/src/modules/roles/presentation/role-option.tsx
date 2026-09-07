import { AlertTriangle, type LucideIcon } from 'lucide-react';
import { copy } from './copy';

type Props = {
  icon: LucideIcon;
  name: string;
  title: string;
  description: string;
  current: boolean;
  selected: boolean;
  warning?: string;
};

export const RoleOption = ({
  icon: Icon,
  name,
  title,
  description,
  current,
  selected,
  warning,
}: Props) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    data-e2e={`roles:assign-option-${name}`}
    className={`flex items-start gap-4 rounded-2xl border p-4 text-left ${
      selected
        ? 'border-orange-500 bg-orange-500/5'
        : 'border-slate-800 bg-slate-900'
    }`}
  >
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
        selected
          ? 'bg-orange-500/10 text-orange-400'
          : 'bg-slate-800 text-slate-300'
      }`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>

    <span className="flex-1">
      <span className="flex items-center gap-2">
        <span className="text-sm font-semibold text-white">{title}</span>
        {current && (
          <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-xs font-semibold text-orange-400">
            {copy.assign.currentBadge}
          </span>
        )}
      </span>
      <span className="mt-1 block text-sm text-slate-400">{description}</span>
      {warning && (
        <span className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-400">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          {warning}
        </span>
      )}
    </span>

    <span
      data-e2e={`roles:assign-radio-${name}`}
      className={`mt-1 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full border-2 ${
        selected ? 'border-orange-500 bg-orange-500' : 'border-slate-600'
      }`}
    >
      {selected && <span className="h-2 w-2 rounded-full bg-white" />}
    </span>
  </button>
);
