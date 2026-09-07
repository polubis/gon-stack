import {
  ArrowLeft,
  Atom,
  ClipboardList,
  Clock,
  ListChecks,
  Zap,
} from 'lucide-react';
import { copy } from './copy';
import { WizardSidebar } from './wizard-sidebar';

const questionIcon = { react: Atom, list: ListChecks, bolt: Zap } as const;

export const ReviewMain = () => (
  <div data-e2e="tests:review-main" className="flex min-h-screen bg-slate-950">
    <WizardSidebar />

    <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6 md:max-w-4xl">
        <div className="flex items-center gap-3">
          <a
            href="/tests-arrange/"
            aria-label={copy.review.back}
            data-e2e="tests:review-back"
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
          </a>
          <div>
            <h1 className="text-lg font-bold text-white">
              <span className="hidden md:inline">{copy.review.title}</span>
              <span className="md:hidden">{copy.review.titleMobile}</span>
            </h1>
            <p className="text-sm text-slate-400">
              <span className="hidden md:inline">
                {copy.review.subtitleDesktop}
              </span>
              <span className="md:hidden">{copy.review.subtitleMobile}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:grid md:grid-cols-[1fr_1.4fr] md:items-start">
          <div className="flex flex-col gap-4">
            <div
              data-e2e="tests:review-summary"
              className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <span className="flex items-center gap-3 md:hidden">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
                  <ClipboardList className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="block text-xs text-slate-400">
                    {copy.review.nameLabel}
                  </span>
                  <span className="block text-sm font-semibold text-white">
                    {copy.review.name}
                  </span>
                </span>
              </span>

              <div className="hidden md:block">
                <p className="text-xs text-slate-400">{copy.review.summary}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {copy.review.nameLabel}
                </p>
                <p className="text-sm font-semibold text-white">
                  {copy.review.name}
                </p>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <p className="text-xs text-slate-400">
                  {copy.review.questionsLabel}
                </p>
                <p className="text-lg font-bold text-white">
                  {copy.review.questionsCount}
                </p>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
                <Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span className="flex-1 text-xs text-slate-400">
                  {copy.review.totalTimeLabel}
                </span>
                <span className="text-sm font-bold text-white">
                  {copy.review.totalMinutes} min
                </span>
              </div>
            </div>

            <a
              href="/tests-detail/"
              data-e2e="tests:review-create-desktop"
              className="hidden w-full items-center justify-center rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400 md:flex"
            >
              {copy.review.create}
            </a>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-300">
              <span className="hidden md:inline">
                {copy.review.questionsHeading} ({copy.review.questionsCount})
              </span>
              <span className="md:hidden">
                {copy.review.questionsHeadingOrdered}
              </span>
            </h2>

            <div className="flex flex-col gap-2.5">
              {copy.review.questions.map((question, index) => {
                const Icon = questionIcon[question.icon];

                return (
                  <div
                    key={question.question}
                    data-e2e={`tests:review-row-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <Icon
                      className="h-4.5 w-4.5 shrink-0 text-slate-400"
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-sm text-white">
                      {question.question}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {question.minutes} min
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <a
            href="/tests-arrange/"
            data-e2e="tests:review-back-button"
            className="flex flex-1 items-center justify-center rounded-lg border border-slate-700 py-3 text-sm font-semibold text-white hover:bg-slate-900"
          >
            {copy.review.back}
          </a>
          <a
            href="/tests-detail/"
            data-e2e="tests:review-create-mobile"
            className="flex flex-1 items-center justify-center rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400"
          >
            {copy.review.create}
          </a>
        </div>
      </div>
    </main>
  </div>
);
