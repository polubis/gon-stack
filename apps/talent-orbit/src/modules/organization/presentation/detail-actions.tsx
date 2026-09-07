import {
  ChevronRight,
  ClipboardList,
  MessageCircleQuestion,
  Share2,
  Waypoints,
} from 'lucide-react';
import { copy } from './copy';

const actionIcon = [Waypoints, MessageCircleQuestion, ClipboardList, Share2];

const actionAccent = [
  'bg-orange-500/10 text-orange-400',
  'bg-sky-500/10 text-sky-400',
  'bg-violet-500/10 text-violet-400',
  'bg-emerald-500/10 text-emerald-400',
];

export const DetailActions = () => (
  <div data-e2e="organization:detail-actions" className="flex flex-col gap-3">
    {copy.detail.actions.map((action, index) => {
      const Icon = actionIcon[index];

      return (
        <a
          key={action.label}
          href={action.href}
          data-e2e={`organization:action-${index}`}
          className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900 p-4"
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${actionAccent[index]}`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-white">
              {action.label}
            </span>
            <span className="block text-xs text-slate-400">
              {action.description}
            </span>
          </span>
          <ChevronRight
            className="h-4.5 w-4.5 shrink-0 text-slate-400"
            aria-hidden="true"
          />
        </a>
      );
    })}
  </div>
);
