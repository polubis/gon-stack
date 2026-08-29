import { ArrowLeft, Atom, ChevronDown, CircleDot, Plus } from 'lucide-react';
import { copy } from './copy';

export const ComposeMain = () => (
  <main
    data-e2e="questions-library:compose-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <a
          href="/questions-library-choose-type/"
          aria-label={copy.compose.back}
          data-e2e="questions-library:compose-back"
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
        </a>
        <h1 className="text-lg font-bold text-white">{copy.compose.title}</h1>
      </div>

      <form
        data-e2e="questions-library:compose-form"
        className="flex flex-col gap-6"
      >
        <div>
          <span className="mb-2 block text-sm font-semibold text-slate-200">
            {copy.compose.conceptLabel}
          </span>
          <button
            type="button"
            data-e2e="questions-library:compose-concept"
            className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
          >
            <span className="flex items-center gap-2">
              <Atom className="h-4 w-4 text-orange-500" aria-hidden="true" />
              {copy.compose.concept}
            </span>
            <ChevronDown
              className="h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
          </button>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-slate-200">
            {copy.compose.typeLabel}
          </span>
          <button
            type="button"
            data-e2e="questions-library:compose-type"
            className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
          >
            <span className="flex items-center gap-2">
              <CircleDot
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
              {copy.compose.type}
            </span>
            <ChevronDown
              className="h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
          </button>
        </div>

        <div>
          <label
            htmlFor="question-text"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            {copy.compose.questionLabel}{' '}
            <span className="text-orange-500">*</span>
          </label>
          <textarea
            id="question-text"
            rows={3}
            defaultValue={copy.compose.question}
            maxLength={copy.compose.questionMax}
            data-e2e="questions-library:compose-question"
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {copy.compose.question.length}/{copy.compose.questionMax}
          </p>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-slate-200">
            {copy.compose.optionsLabel}{' '}
            <span className="text-orange-500">*</span>
          </span>
          <div className="flex flex-col gap-2.5">
            {copy.compose.options.map((option) => (
              <div
                key={option.letter}
                data-e2e={`questions-library:compose-option-${option.letter.toLowerCase()}`}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                  option.correct
                    ? 'border-orange-500/60 bg-orange-500/5'
                    : 'border-slate-700 bg-slate-950'
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                  {option.letter}
                </span>
                <span className="flex-1 text-sm text-white">
                  {option.label}
                </span>
                {option.correct && (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                    {copy.review.correct}
                  </span>
                )}
                <span
                  className={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full border-2 ${
                    option.correct
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-slate-600'
                  }`}
                >
                  {option.correct && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                </span>
              </div>
            ))}

            <button
              type="button"
              data-e2e="questions-library:compose-add-option"
              className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-700 py-3 text-sm font-semibold text-slate-300 hover:border-orange-500 hover:text-orange-400"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {copy.compose.addOption}
            </button>
          </div>
        </div>

        <a
          href="/questions-library-review/"
          data-e2e="questions-library:compose-continue"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400"
        >
          {copy.compose.continue}
        </a>
      </form>
    </div>
  </main>
);
