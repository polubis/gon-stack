import {
  ArrowLeft,
  Atom,
  BarChart3,
  ChevronDown,
  CirclePlus,
  X,
} from 'lucide-react';
import { copy } from './copy';

export const ConceptCreateMain = () => (
  <main
    data-e2e="knowledge-bank:concept-create-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <a
          href="#"
          aria-label={copy.conceptForm.back}
          data-e2e="knowledge-bank:concept-create-back"
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
        </a>
        <h1 className="text-lg font-bold text-white">
          {copy.conceptForm.title}
        </h1>
      </div>

      <form
        data-e2e="knowledge-bank:concept-create-form"
        className="flex flex-col gap-6"
      >
        <div>
          <label
            htmlFor="concept-title"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            {copy.conceptForm.titleLabel}{' '}
            <span className="text-orange-500">*</span>
          </label>
          <input
            id="concept-title"
            type="text"
            defaultValue={copy.conceptForm.titleValue}
            maxLength={copy.conceptForm.titleMax}
            data-e2e="knowledge-bank:concept-create-title"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {copy.conceptForm.titleValue.length}/{copy.conceptForm.titleMax}
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="md:flex-1">
            <label
              htmlFor="concept-coverage"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              {copy.conceptForm.coverageLabel}{' '}
              <span className="text-orange-500">*</span>
            </label>
            <textarea
              id="concept-coverage"
              rows={4}
              defaultValue={copy.conceptForm.coverageValue}
              maxLength={copy.conceptForm.coverageMax}
              data-e2e="knowledge-bank:concept-create-coverage"
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {copy.conceptForm.coverageValue.length}/
              {copy.conceptForm.coverageMax}
            </p>
          </div>

          <div className="md:w-44">
            <span className="mb-2 block text-sm font-semibold text-slate-200">
              {copy.conceptForm.difficultyLabel}{' '}
              <span className="text-orange-500">*</span>
            </span>
            <button
              type="button"
              data-e2e="knowledge-bank:concept-create-difficulty"
              className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              <span className="flex items-center gap-2">
                <BarChart3
                  className="h-4 w-4 text-orange-500"
                  aria-hidden="true"
                />
                {copy.conceptForm.difficultyValue}
              </span>
              <ChevronDown
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-slate-200">
            {copy.conceptForm.tagsLabel}
          </span>
          <div
            data-e2e="knowledge-bank:concept-create-tags"
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5"
          >
            <div className="flex flex-1 flex-wrap gap-2">
              {copy.conceptForm.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-white"
                >
                  {tag}
                  <X className="h-3 w-3 text-slate-400" aria-hidden="true" />
                </span>
              ))}
            </div>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-slate-400"
              aria-hidden="true"
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {copy.conceptForm.tagsHelper}
          </p>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-slate-200">
            {copy.conceptForm.parentLabel}{' '}
            <span className="text-orange-500">*</span>
          </span>
          <button
            type="button"
            data-e2e="knowledge-bank:concept-create-parent"
            className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
          >
            <span className="flex items-center gap-2">
              <Atom className="h-4 w-4 text-sky-400" aria-hidden="true" />
              {copy.conceptForm.parentValue}
            </span>
            <span className="flex items-center gap-2">
              <X className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <ChevronDown
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
            </span>
          </button>
        </div>

        <button
          type="submit"
          data-e2e="knowledge-bank:concept-create-submit"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400"
        >
          <CirclePlus className="h-4.5 w-4.5" aria-hidden="true" />
          {copy.conceptForm.submit}
        </button>
      </form>
    </div>
  </main>
);
