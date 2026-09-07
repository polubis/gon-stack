import {
  Accessibility,
  ArrowLeft,
  Atom,
  ChevronDown,
  ChevronRight,
  Database,
  Gauge,
  Globe2,
  Search,
  Share2,
} from 'lucide-react';
import { copy } from './copy';

const conceptIcon = {
  'Web Platform': Globe2,
  React: Atom,
  Accessibility,
  Performance: Gauge,
  'State Management': Database,
} as const;

export const LinkConceptMain = () => (
  <main
    data-e2e="questions-library:link-concept-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-xl flex-col gap-6 md:max-w-3xl">
      <div className="flex items-center gap-3">
        <a
          href="/questions-library/"
          aria-label={copy.linkConcept.back}
          data-e2e="questions-library:link-concept-back"
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
        </a>
        <div>
          <h1 className="text-lg font-bold text-white">
            {copy.linkConcept.title}
          </h1>
          <p className="text-sm text-slate-400">{copy.linkConcept.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:hidden">
        <button
          type="button"
          data-e2e="questions-library:link-concept-bank-mobile"
          className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"
        >
          <span className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-orange-500" aria-hidden="true" />
            {copy.linkConcept.bank}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </button>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder={copy.linkConcept.searchPlaceholder}
            data-e2e="questions-library:link-concept-search"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div
          className="flex flex-col gap-3"
          role="radiogroup"
          aria-label={copy.linkConcept.selectConcept}
        >
          {copy.linkConcept.concepts
            .filter((concept) => concept !== 'Web Platform')
            .map((concept) => {
              const Icon = conceptIcon[concept];
              const selected = concept === copy.linkConcept.selected;

              return (
                <button
                  key={concept}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  data-e2e={`questions-library:link-concept-option-${concept.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`flex items-center gap-3 rounded-lg border p-4 text-sm font-medium text-white ${
                    selected
                      ? 'border-orange-500 bg-orange-500/5'
                      : 'border-slate-800 bg-slate-900'
                  }`}
                >
                  <Icon
                    className="h-5 w-5 text-orange-400"
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-left">{concept}</span>
                  <span
                    className={`flex h-5.5 w-5.5 items-center justify-center rounded-full border-2 ${
                      selected
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-slate-600'
                    }`}
                  >
                    {selected && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      <div className="hidden grid-cols-[1fr_2fr] gap-6 md:grid">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-300">
            {copy.linkConcept.selectBank}
          </h2>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-2">
            <button
              type="button"
              data-e2e="questions-library:link-concept-bank-desktop"
              className="flex w-full items-center gap-3 rounded-xl border border-orange-500 bg-orange-500/5 p-3 text-left text-sm font-semibold text-white"
            >
              <Share2
                className="h-5 w-5 shrink-0 text-orange-400"
                aria-hidden="true"
              />
              <span className="flex-1">{copy.linkConcept.bank}</span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-slate-400"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-300">
            {copy.linkConcept.selectConcept}
          </h2>
          <div
            className="flex flex-col gap-3"
            role="radiogroup"
            aria-label={copy.linkConcept.selectConcept}
          >
            {copy.linkConcept.concepts.map((concept) => {
              const Icon = conceptIcon[concept];
              const selected = concept === copy.linkConcept.selected;

              return (
                <button
                  key={concept}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  data-e2e={`questions-library:link-concept-option-${concept.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-sm font-medium text-white ${
                    selected
                      ? 'border-orange-500 bg-orange-500/5'
                      : 'border-slate-800 bg-slate-900'
                  }`}
                >
                  <Icon className="h-5 w-5 text-slate-300" aria-hidden="true" />
                  <span className="flex-1 text-left">{concept}</span>
                  <span
                    className={`flex h-5.5 w-5.5 items-center justify-center rounded-full border-2 ${
                      selected
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-slate-600'
                    }`}
                  >
                    {selected && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <a
        href="/questions-library-choose-type/"
        data-e2e="questions-library:link-concept-continue"
        className="flex w-full items-center justify-center rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400"
      >
        {copy.linkConcept.continue}
      </a>
    </div>
  </main>
);
