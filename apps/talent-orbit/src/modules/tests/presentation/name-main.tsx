import { ArrowLeft } from 'lucide-react';
import { copy } from './copy';

export const NameMain = () => (
  <main
    data-e2e="tests:name-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <a
          href="/tests/"
          aria-label={copy.name.back}
          data-e2e="tests:name-back"
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
        </a>
        <div>
          <h1 className="text-lg font-bold text-white">
            <span className="hidden md:inline">{copy.name.titleDesktop}</span>
            <span className="md:hidden">{copy.name.titleMobile}</span>
          </h1>
          <p className="hidden text-sm text-slate-400 md:block">
            {copy.name.subtitle}
          </p>
        </div>
      </div>

      <form data-e2e="tests:name-form" className="flex flex-col gap-6">
        <div>
          <label
            htmlFor="test-name"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            {copy.name.nameLabel}
          </label>
          <input
            id="test-name"
            type="text"
            defaultValue={copy.name.name}
            data-e2e="tests:name-input"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="test-description"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            {copy.name.descriptionLabel}
          </label>
          <textarea
            id="test-description"
            rows={5}
            defaultValue={copy.name.description}
            data-e2e="tests:name-description"
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/tests/"
            data-e2e="tests:name-cancel"
            className="flex flex-1 items-center justify-center rounded-lg border border-slate-700 py-3 text-sm font-semibold text-white hover:bg-slate-900 md:hidden"
          >
            {copy.name.cancel}
          </a>
          <a
            href="/tests-select-questions/"
            data-e2e="tests:name-continue"
            className="flex flex-1 items-center justify-center rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400"
          >
            {copy.name.continue}
          </a>
        </div>
      </form>
    </div>
  </main>
);
