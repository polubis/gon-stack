import {
  ArrowLeft,
  Atom,
  CheckCircle2,
  ListChecks,
  Pencil,
  Plus,
  X,
} from 'lucide-react';
import { copy } from './copy';

export const DetailMain = () => (
  <main
    data-e2e="questions-library:detail-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <a
          href="/questions-library/"
          aria-label={copy.detail.back}
          data-e2e="questions-library:detail-back"
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
        </a>
        <h1 className="text-lg font-bold text-white">{copy.detail.title}</h1>
      </div>

      <div
        role="status"
        data-e2e="questions-library:detail-success-banner"
        className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400"
      >
        <CheckCircle2 className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
        <span className="flex-1">{copy.detail.successBanner}</span>
        <button
          type="button"
          aria-label={copy.detail.dismiss}
          data-e2e="questions-library:detail-dismiss-banner"
          className="text-emerald-400 hover:text-emerald-300"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <h2 className="text-xl font-bold text-white">{copy.detail.question}</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-2 text-xs text-slate-400">
            {copy.detail.conceptLabel}
          </p>
          <p className="flex items-center gap-2 text-sm font-semibold text-white">
            <Atom className="h-4 w-4 text-orange-400" aria-hidden="true" />
            {copy.detail.concept}
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs text-slate-400">{copy.detail.typeLabel}</p>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-white">
            <ListChecks className="h-4 w-4 text-slate-400" aria-hidden="true" />
            {copy.detail.type}
          </span>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-400">
          {copy.detail.optionsLabel}
        </h3>
        <div className="flex flex-col gap-2.5">
          {copy.detail.options.map((option) => (
            <div
              key={option.letter}
              data-e2e={`questions-library:detail-option-${option.letter.toLowerCase()}`}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                option.correct
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-slate-800 bg-slate-900'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                  option.correct ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                {option.letter}
              </span>
              <span className="flex-1 text-sm text-white">{option.label}</span>
              {option.correct && (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                  {copy.detail.correct}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <a
          href="/questions-library-compose/"
          data-e2e="questions-library:detail-edit"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-3 text-sm font-semibold text-white hover:bg-slate-900"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          {copy.detail.edit}
        </a>
        <a
          href="#"
          data-e2e="questions-library:detail-add-to-test"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {copy.detail.addToTest}
        </a>
      </div>
    </div>
  </main>
);
