import { Plus } from 'lucide-react';
import { copy } from './copy';
import { ListExamCard } from './list-exam-card';
import { MobileNav } from './mobile-nav';
import { Sidebar } from './sidebar';

export const ListMain = () => (
  <div data-e2e="exam:list-main" className="flex min-h-screen bg-slate-950">
    <Sidebar />

    <div className="flex-1">
      <MobileNav />

      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-10 md:px-10 md:py-10">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-white">{copy.list.title}</h1>
          <a
            href="/exams-choose-test/"
            data-e2e="exam:list-new-desktop"
            className="hidden items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 md:flex"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {copy.list.newExam}
          </a>
        </div>

        <div
          className="flex items-center gap-1 border-b border-slate-800"
          data-e2e="exam:list-tabs"
        >
          {copy.list.tabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              aria-pressed={index === 0}
              data-e2e={`exam:list-tab-${tab.toLowerCase()}`}
              className={`px-3 pb-3 text-sm font-semibold ${
                index === 0
                  ? 'border-b-2 border-orange-500 text-orange-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {copy.list.exams.map((exam, index) => (
            <ListExamCard key={exam.name} index={index} />
          ))}
        </div>

        <a
          href="/exams-choose-test/"
          data-e2e="exam:list-new-mobile"
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400 md:hidden"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {copy.list.newExam}
        </a>
      </main>
    </div>
  </div>
);
