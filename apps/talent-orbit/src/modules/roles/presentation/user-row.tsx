type Props = {
  id: string;
  role: string;
  status: string;
  selected: boolean;
};

export const UserRow = ({ id, role, status, selected }: Props) => (
  <a
    href="/roles-assign/"
    role="radio"
    aria-checked={selected}
    data-e2e={`roles:user-row-${id.toLowerCase()}`}
    className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border p-4 md:grid-cols-[auto_1fr_8rem_8rem] ${
      selected
        ? 'border-orange-500 bg-orange-500/5'
        : 'border-slate-800 bg-slate-900'
    }`}
  >
    <span
      className={`flex h-5.5 w-5.5 items-center justify-center rounded-full border-2 ${
        selected ? 'border-orange-500 bg-orange-500' : 'border-slate-600'
      }`}
    >
      {selected && <span className="h-2 w-2 rounded-full bg-white" />}
    </span>

    <span className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
        U
      </span>
      <span>
        <span className="block text-sm font-semibold text-white">{id}</span>
        <span className="block text-xs text-slate-400 md:hidden">{role}</span>
      </span>
    </span>

    <span className="hidden text-sm text-slate-300 md:block">{role}</span>

    <span className="flex items-center gap-1.5 text-sm text-slate-300">
      <span
        className={`h-2 w-2 rounded-full ${status === 'Active' ? 'bg-emerald-500' : 'bg-orange-500'}`}
        aria-hidden="true"
      />
      {status}
    </span>
  </a>
);
