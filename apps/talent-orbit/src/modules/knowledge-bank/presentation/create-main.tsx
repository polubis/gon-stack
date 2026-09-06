import { ArrowLeft, ChevronDown, Lock } from 'lucide-react';
import { copy } from './copy';

export const CreateMain = () => (
  <main
    data-e2e="knowledge-bank:create-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <a
      href="/knowledge-bank/"
      aria-label={copy.create.back}
      data-e2e="knowledge-bank:create-back"
      className="inline-flex text-slate-300 hover:text-white"
    >
      <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
    </a>

    <div className="mx-auto mt-6 max-w-md md:mt-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">{copy.create.title}</h1>
        <p className="mt-2 text-sm text-slate-400">{copy.create.subtitle}</p>
      </div>

      <form
        data-e2e="knowledge-bank:create-form"
        className="mt-8 flex flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:border-none md:bg-transparent md:p-0"
      >
        <div>
          <label
            htmlFor="bank-name"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            {copy.create.nameLabel}
          </label>
          <input
            id="bank-name"
            type="text"
            placeholder={copy.create.namePlaceholder}
            data-e2e="knowledge-bank:create-name"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="bank-description"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            {copy.create.descriptionLabel}
          </label>
          <textarea
            id="bank-description"
            rows={3}
            placeholder={copy.create.descriptionPlaceholder}
            data-e2e="knowledge-bank:create-description"
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-slate-200">
            {copy.create.visibilityLabel}
          </span>
          <button
            type="button"
            data-e2e="knowledge-bank:create-visibility"
            className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
          >
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
              {copy.create.visibilityValue}
            </span>
            <ChevronDown
              className="h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
          </button>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-slate-200">
            {copy.create.ownerLabel}
          </span>
          <button
            type="button"
            data-e2e="knowledge-bank:create-owner"
            className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
          >
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                T
              </span>
              {copy.create.ownerValue}
            </span>
            <ChevronDown
              className="h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="mt-2 flex items-center gap-3 md:mt-3">
          <a
            href="/knowledge-bank/"
            data-e2e="knowledge-bank:create-cancel"
            className="flex flex-1 items-center justify-center rounded-lg border border-slate-700 py-3 text-sm font-semibold text-white hover:bg-slate-800 md:hidden"
          >
            {copy.create.cancel}
          </a>
          <button
            type="submit"
            data-e2e="knowledge-bank:create-submit"
            className="flex flex-1 items-center justify-center rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400"
          >
            {copy.create.submit}
          </button>
        </div>
      </form>
    </div>
  </main>
);
