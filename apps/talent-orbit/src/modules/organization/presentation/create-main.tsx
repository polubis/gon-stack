import { ArrowLeft, ChevronDown } from 'lucide-react';
import { copy } from './copy';

export const CreateMain = () => (
  <main
    data-e2e="organization:create-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <a
      href="/organization/"
      aria-label={copy.create.back}
      data-e2e="organization:create-back"
      className="inline-flex text-slate-300 hover:text-white"
    >
      <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
    </a>

    <div className="mx-auto mt-6 max-w-md md:mt-10">
      <h1 className="text-center text-2xl font-bold text-white">
        {copy.create.title}
      </h1>

      <form
        data-e2e="organization:create-form"
        className="mt-8 flex flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:border-none md:bg-transparent md:p-0"
      >
        <div>
          <label
            htmlFor="organization-name"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            {copy.create.nameLabel}
          </label>
          <input
            id="organization-name"
            type="text"
            defaultValue={copy.create.nameValue}
            data-e2e="organization:create-name"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="organization-description"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            {copy.create.descriptionLabel}
          </label>
          <textarea
            id="organization-description"
            rows={3}
            defaultValue={copy.create.descriptionValue}
            data-e2e="organization:create-description"
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-slate-200">
            {copy.create.ownerLabel}
          </span>
          <button
            type="button"
            data-e2e="organization:create-owner"
            className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
          >
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                T
              </span>
              <span className="flex flex-col items-start">
                {copy.create.ownerValue}
                <span className="text-xs font-normal text-slate-400">
                  {copy.create.ownerHint}
                </span>
              </span>
            </span>
            <ChevronDown
              className="h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
          </button>
        </div>

        <button
          type="submit"
          data-e2e="organization:create-submit"
          className="mt-2 flex items-center justify-center rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400"
        >
          {copy.create.submit}
        </button>
      </form>
    </div>
  </main>
);
