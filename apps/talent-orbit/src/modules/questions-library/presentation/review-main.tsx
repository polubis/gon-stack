import { ArrowLeft, Atom, ListChecks } from 'lucide-react';
import { copy } from './copy';

export const ReviewMain = () => (
  <main
    data-e2e="questions-library:review-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <a
          href="/questions-library-compose/"
          aria-label={copy.review.back}
          data-e2e="questions-library:review-back"
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
        </a>
        <h1 className="text-lg font-bold text-white">{copy.review.title}</h1>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-400">
          {copy.review.summary}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
              <Atom className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <p className="text-xs text-slate-400">{copy.review.conceptLabel}</p>
            <p className="text-sm font-semibold text-white">
              {copy.review.concept}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
              <ListChecks className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <p className="text-xs text-slate-400">{copy.review.typeLabel}</p>
            <p className="text-sm font-semibold text-white">
              {copy.review.type}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-400">
          {copy.review.questionLabel}
        </h2>
        <p className="text-base font-semibold text-white">
          {copy.review.question}
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-400">
          {copy.review.optionsLabel}
        </h2>
        <div className="flex flex-col gap-2.5">
          {copy.review.options.map((option) => (
            <div
              key={option.letter}
              data-e2e={`questions-library:review-option-${option.letter.toLowerCase()}`}
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
                  {copy.review.correctAnswer}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="/questions-library-compose/"
          data-e2e="questions-library:review-back-button"
          className="flex flex-1 items-center justify-center rounded-lg border border-slate-700 py-3 text-sm font-semibold text-white hover:bg-slate-900 md:hidden"
        >
          {copy.review.back}
        </a>
        <a
          href="/questions-library-detail/"
          data-e2e="questions-library:review-publish"
          className="flex flex-1 items-center justify-center rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400"
        >
          {copy.review.publish}
        </a>
      </div>
    </div>
  </main>
);
