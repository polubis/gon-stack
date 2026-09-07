import {
  Atom,
  ChevronDown,
  ChevronRight,
  Code2,
  FileCode2,
  Palette,
  Search,
} from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { copy } from './copy';

const questionIcon = {
  html: Code2,
  js: FileCode2,
  css: Palette,
  react: Atom,
} as const;

const iconAccent = {
  html: 'bg-sky-500/10 text-sky-400',
  js: 'bg-amber-500/10 text-amber-400',
  css: 'bg-blue-500/10 text-blue-400',
  react: 'bg-violet-500/10 text-violet-400',
} as const;

const checkedCount = copy.selectQuestions.questions.filter(
  (question) => question.checked,
).length;

export const SelectQuestionsMain = () => (
  <main
    data-e2e="tests:select-questions-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-xl flex-col gap-6 md:max-w-4xl">
      <div className="flex items-center gap-3">
        <a
          href="/tests-name/"
          aria-label={copy.selectQuestions.back}
          data-e2e="tests:select-questions-back"
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
        </a>
        <div>
          <h1 className="text-lg font-bold text-white">
            <span className="hidden md:inline">
              {copy.selectQuestions.titleDesktop}
            </span>
            <span className="md:hidden">
              {copy.selectQuestions.titleMobile}
            </span>
          </h1>
          <p className="hidden text-sm text-slate-400 md:block">
            {copy.selectQuestions.subtitle}
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <button
          type="button"
          data-e2e="tests:select-questions-concepts"
          className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white"
        >
          {copy.selectQuestions.concepts}
          <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </button>
        <button
          type="button"
          data-e2e="tests:select-questions-types"
          className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white"
        >
          {copy.selectQuestions.types}
          <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </button>
        <div className="relative ml-auto w-72">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder={copy.selectQuestions.searchPlaceholder}
            data-e2e="tests:select-questions-search-desktop"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder={copy.selectQuestions.searchPlaceholder}
            data-e2e="tests:select-questions-search-mobile"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {copy.selectQuestions.typeFilters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              aria-pressed={index === 0}
              data-e2e={`tests:select-questions-filter-${filter.toLowerCase().replace(/\s+/g, '-')}`}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
                index === 0
                  ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                  : 'border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-800 md:block">
        <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-800 bg-slate-900/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span>{copy.selectQuestions.questionColumn}</span>
          <span>{copy.selectQuestions.conceptTypeColumn}</span>
        </div>
        <div className="flex flex-col divide-y divide-slate-800">
          {copy.selectQuestions.questions.map((question) => {
            const Icon = questionIcon[question.icon];

            return (
              <label
                key={question.title}
                data-e2e={`tests:select-questions-row-${question.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-4 bg-slate-900 px-4 py-4"
              >
                <input
                  type="checkbox"
                  defaultChecked={question.checked}
                  aria-label={question.title}
                  className="h-4.5 w-4.5 shrink-0 rounded border-slate-600 bg-slate-950 text-orange-500 focus:ring-orange-500"
                />
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconAccent[question.icon]}`}
                >
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-white">
                    {question.title}
                  </span>
                  <span className="block text-xs text-slate-400">
                    {question.question}
                  </span>
                </span>
                <span className="flex flex-col items-end gap-1.5">
                  <span className="text-xs text-slate-400">
                    {question.concept}
                  </span>
                  <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300">
                    {question.type}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {copy.selectQuestions.questions.map((question) => {
          const Icon = questionIcon[question.icon];

          return (
            <label
              key={question.title}
              data-e2e={`tests:select-questions-row-mobile-${question.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4"
            >
              <input
                type="checkbox"
                defaultChecked={question.checked}
                aria-label={question.title}
                className="h-4.5 w-4.5 shrink-0 rounded border-slate-600 bg-slate-950 text-orange-500 focus:ring-orange-500"
              />
              <span className="flex-1">
                <span className="block text-sm font-semibold text-white">
                  {question.question}
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {question.concept}
                </span>
              </span>
              <ChevronRight
                className="h-4.5 w-4.5 shrink-0 text-slate-400"
                aria-hidden="true"
              />
            </label>
          );
        })}
      </div>

      <a
        href="/tests-arrange/"
        data-e2e="tests:select-questions-continue"
        className="flex w-full items-center justify-center rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400"
      >
        {copy.selectQuestions.continue} ({checkedCount})
      </a>
    </div>
  </main>
);
