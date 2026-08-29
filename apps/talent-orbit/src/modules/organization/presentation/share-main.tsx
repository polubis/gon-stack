import {
  ArrowLeft,
  ChevronDown,
  ClipboardList,
  Building2,
  MessageCircleQuestion,
  Share2,
  Waypoints,
} from 'lucide-react';
import { copy } from './copy';
import { Sidebar } from './sidebar';

const resourceTypeIcon = [Waypoints, MessageCircleQuestion, ClipboardList];

export const ShareMain = () => (
  <div
    data-e2e="organization:share-main"
    className="flex min-h-screen bg-slate-950"
  >
    <Sidebar />

    <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="flex items-center gap-3">
          <a
            href="/organization/"
            aria-label={copy.share.back}
            data-e2e="organization:share-back"
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
          </a>
          <h1 className="text-lg font-bold text-white">{copy.share.title}</h1>
        </div>

        <form
          data-e2e="organization:share-form"
          className="flex flex-col gap-6"
        >
          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-200">
              {copy.share.resourceTypeLabel}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {copy.share.resourceTypes.map((type, index) => {
                const Icon = resourceTypeIcon[index];
                const active = index === 0;

                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={active}
                    data-e2e={`organization:share-resource-type-${index}`}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-medium ${
                      active
                        ? 'border-orange-500 text-orange-400'
                        : 'border-slate-700 text-slate-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="share-resource"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              {copy.share.resourceLabel}
            </label>
            <button
              type="button"
              id="share-resource"
              data-e2e="organization:share-resource"
              className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              {copy.share.resourceValue}
              <ChevronDown
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
            </button>
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-200">
              {copy.share.organizationLabel}
            </span>
            <button
              type="button"
              data-e2e="organization:share-organization"
              className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              <span className="flex items-center gap-2">
                <Building2
                  className="h-4 w-4 text-slate-400"
                  aria-hidden="true"
                />
                {copy.share.organizationValue}
              </span>
              <ChevronDown
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
            </button>
          </div>

          <a
            href="/organization-shared/"
            data-e2e="organization:share-submit"
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            {copy.share.submit}
          </a>
        </form>
      </div>
    </main>
  </div>
);
