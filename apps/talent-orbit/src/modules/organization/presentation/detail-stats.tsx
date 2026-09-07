import { Folder, Users } from 'lucide-react';
import { copy } from './copy';

const statIcon = [Users, Folder];

export const DetailStats = () => (
  <div data-e2e="organization:detail-stats" className="grid grid-cols-2 gap-3">
    {copy.detail.stats.map((stat, index) => {
      const Icon = statIcon[index];

      return (
        <div
          key={stat.label}
          data-e2e={`organization:stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
          className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4"
        >
          <Icon className="h-5 w-5 text-orange-400" aria-hidden="true" />
          <div>
            <span className="block text-xl font-bold text-white">
              {stat.value}
            </span>
            <span className="block text-xs text-slate-400">{stat.label}</span>
          </div>
        </div>
      );
    })}
  </div>
);
