import { DetailHeader } from './detail-header';
import { DetailRootConcepts } from './detail-root-concepts';
import { DetailSummary } from './detail-summary';
import { DetailTabs } from './detail-tabs';

export const DetailMain = () => (
  <main
    data-e2e="knowledge-bank:detail-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <DetailHeader />
      <DetailTabs />
      <DetailSummary />
      <DetailRootConcepts />
    </div>
  </main>
);
