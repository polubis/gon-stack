import {
  ArrowLeft,
  ArrowRight,
  Atom,
  CheckCircle2,
  ClipboardList,
  Clock,
  ListChecks,
  Pencil,
  X,
  Zap,
} from 'lucide-react';
import { copy } from './copy';
import { WizardSidebar } from './wizard-sidebar';

const questionIcon = { react: Atom, list: ListChecks, bolt: Zap } as const;

export const DetailMain = () => (
  <div data-e2e="tests:detail-main" className="flex min-h-screen bg-slate-950">
    <WizardSidebar />

    <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <a
            href="/tests/"
            aria-label={copy.detail.back}
            data-e2e="tests:detail-back"
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
          </a>
          <h1 className="text-lg font-bold text-white">{copy.detail.title}</h1>
        </div>

        <div
          role="status"
          data-e2e="tests:detail-success-banner"
          className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400"
        >
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          <span className="flex-1">
            <span className="hidden md:inline">
              {copy.detail.successBanner}
            </span>
            <span className="md:hidden">{copy.detail.successBannerMobile}</span>
          </span>
          <button
            type="button"
            aria-label={copy.detail.dismiss}
            data-e2e="tests:detail-dismiss-banner"
            className="text-emerald-400 hover:text-emerald-300"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10 text-orange-400 md:hidden">
            <ClipboardList className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-bold text-white">{copy.detail.name}</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center md:text-left">
            <p className="text-xl font-bold text-white">
              {copy.detail.questionsCount}
            </p>
            <p className="text-xs text-slate-400">
              {copy.detail.questionsLabel}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center md:text-left">
            <p className="text-xl font-bold text-white">
              {copy.detail.totalMinutes}{' '}
              <span className="text-sm font-normal">min</span>
            </p>
            <p className="text-xs text-slate-400">
              {copy.detail.totalTimeLabel}
            </p>
          </div>
          <div className="hidden items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-emerald-400 md:flex">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-semibold">{copy.detail.ready}</span>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-300">
            {copy.detail.questionsHeadingOrdered}
          </h3>
          <div className="flex flex-col gap-2.5">
            {copy.detail.questions.map((question, index) => {
              const Icon = questionIcon[question.icon];

              return (
                <div
                  key={question.question}
                  data-e2e={`tests:detail-row-${index}`}
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

        <div className="flex flex-col gap-3">
          <a
            href="#"
            data-e2e="tests:detail-create-exam"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400 md:order-2"
          >
            {copy.detail.createExam}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href="/tests-name/"
            data-e2e="tests:detail-edit"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-3 text-sm font-semibold text-white hover:bg-slate-900 md:order-1"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            {copy.detail.edit}
          </a>
        </div>
      </div>
    </main>
  </div>
);
