import { DetailActions } from './detail-actions';
import { DetailHeader } from './detail-header';
import { DetailStats } from './detail-stats';

export const DetailMain = () => (
  <main
    data-e2e="organization:detail-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <DetailHeader />
      <DetailStats />
      <DetailActions />
    </div>
  </main>
);
