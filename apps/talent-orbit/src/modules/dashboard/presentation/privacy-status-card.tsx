import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { copy } from './copy';

export const PrivacyStatusCard = () => (
  <div
    data-e2e="dashboard:privacy-status"
    className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
  >
    <div className="flex items-center justify-between">
      <h2 className="font-semibold text-white">{copy.privacyStatus.title}</h2>
      <ShieldCheck className="h-5 w-5 text-emerald-400" aria-hidden="true" />
    </div>

    <ul className="mt-4 flex flex-col gap-3">
      {copy.privacyStatus.items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-2.5 text-sm text-slate-300"
        >
          <CheckCircle2
            className="h-4 w-4 shrink-0 text-emerald-400"
            aria-hidden="true"
          />
          {item}
        </li>
      ))}
    </ul>
  </div>
);
