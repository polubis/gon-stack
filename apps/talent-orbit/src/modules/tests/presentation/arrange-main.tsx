import {
  ArrowLeft,
  ArrowRight,
  Atom,
  ChevronDown,
  Clock,
  GripVertical,
  ListChecks,
  Zap,
} from 'lucide-react';
import { copy } from './copy';
import { WizardSidebar } from './wizard-sidebar';

const questionIcon = { react: Atom, list: ListChecks, bolt: Zap } as const;

export const ArrangeMain = () => (
  <div data-e2e="tests:arrange-main" className="flex min-h-screen bg-slate-950">
    <WizardSidebar />

    <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <a
            href="/tests-select-questions/"
            aria-label={copy.arrange.back}
            data-e2e="tests:arrange-back"
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
          </a>
          <div>
            <h1 className="text-lg font-bold text-white">
              <span className="hidden md:inline">
                {copy.arrange.titleDesktop}
              </span>
              <span className="md:hidden">{copy.arrange.titleMobile}</span>
            </h1>
            <p className="text-sm text-slate-400">
              <span className="hidden md:inline">
                {copy.arrange.subtitleDesktop}
              </span>
              <span className="md:hidden">{copy.arrange.subtitleMobile}</span>
            </p>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-300">
            {copy.arrange.questionsHeading} ({copy.arrange.questions.length})
          </h2>

          <div className="flex flex-col gap-3">
            {copy.arrange.questions.map((question, index) => {
              const Icon = questionIcon[question.icon];

              return (
                <div
                  key={question.question}
                  data-e2e={`tests:arrange-row-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4"
                >
                  <GripVertical
                    className="h-4.5 w-4.5 shrink-0 text-slate-600"
                    aria-hidden="true"
                  />
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-white">
                      {question.question}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 md:hidden">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {question.type}
                    </span>
                  </span>
                  <button
                    type="button"
                    data-e2e={`tests:arrange-time-${index}`}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                  >
                    {question.minutes} min
                    <ChevronDown
                      className="h-4 w-4 text-slate-400"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div
          data-e2e="tests:arrange-total-time"
          className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"
        >
          <Clock
            className="h-5 w-5 shrink-0 text-emerald-400"
            aria-hidden="true"
          />
          <span className="flex-1 text-sm text-slate-300">
            {copy.arrange.totalTimeLabel}
          </span>
          <span className="text-lg font-bold text-emerald-400">
            {copy.arrange.totalMinutes} min
          </span>
        </div>

        <a
          href="/tests-review/"
          data-e2e="tests:arrange-continue"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400"
        >
          {copy.arrange.continue}
          <ArrowRight className="hidden h-4 w-4 md:block" aria-hidden="true" />
        </a>
      </div>
    </main>
  </div>
);
