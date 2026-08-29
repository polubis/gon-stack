import { ChevronRight, Database, Layers, Share2 } from 'lucide-react';
import { copy } from './copy';

const bankIcon = [Share2, Database, Layers];

const accentClasses = {
  orange: {
    icon: 'bg-orange-500/10 text-orange-400',
    concepts: 'text-orange-400',
  },
  violet: {
    icon: 'bg-violet-500/10 text-violet-400',
    concepts: 'text-violet-400',
  },
  sky: { icon: 'bg-sky-500/10 text-sky-400', concepts: 'text-sky-400' },
} as const;

export const ListBankCard = ({ index }: { index: number }) => {
  const bank = copy.list.banks[index];
  const Icon = bankIcon[index];
  const accent = accentClasses[bank.accent];

  return (
    <a
      href={`/knowledge-bank/${bank.slug}/`}
      data-e2e={`knowledge-bank:card-${index}`}
      className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900 p-4"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.icon}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>

      <span className="flex-1">
        <span className="block text-sm font-semibold text-white">
          {bank.name}
        </span>
        <span className={`block text-sm font-medium ${accent.concepts}`}>
          {bank.concepts}
        </span>
        <span className="block text-xs text-slate-400">{bank.updated}</span>
      </span>

      <ChevronRight
        className="h-4.5 w-4.5 shrink-0 text-slate-400"
        aria-hidden="true"
      />
    </a>
  );
};
