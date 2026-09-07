import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Share2,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { copy } from './copy';

export const ConfirmationMain = () => (
  <main
    data-e2e="organization:confirmation-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="flex items-center gap-3">
        <a
          href="/organization-shared/"
          aria-label={copy.confirmation.back}
          data-e2e="organization:confirmation-back"
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
        </a>
        <h1 className="text-lg font-bold text-white">
          {copy.confirmation.title}
        </h1>
      </div>

      <div
        data-e2e="organization:confirmation-success"
        className="flex items-start gap-3 rounded-2xl border border-emerald-800 bg-emerald-500/10 p-4"
      >
        <CheckCircle2
          className="h-5 w-5 shrink-0 text-emerald-400"
          aria-hidden="true"
        />
        <div className="flex-1">
          <span className="block text-sm font-semibold text-emerald-400">
            {copy.confirmation.success}
          </span>
          <span className="block text-sm text-emerald-200/80">
            {copy.confirmation.successSubtitle}
          </span>
        </div>
        <button
          type="button"
          aria-label={copy.confirmation.dismiss}
          data-e2e="organization:confirmation-dismiss"
          className="text-emerald-400 hover:text-emerald-200"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center gap-3.5 rounded-2xl border border-orange-500 bg-slate-900 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
          <Share2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold text-white">
            {copy.confirmation.resource.name}
          </span>
          <span className="block text-xs text-slate-400">
            {copy.confirmation.resource.type}
          </span>
        </span>
      </div>

      <div>
        <span className="mb-2 block text-xs font-semibold text-slate-400">
          {copy.confirmation.organizationLabel}
        </span>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <Building2
            className="h-4.5 w-4.5 text-slate-400"
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-white">
            {copy.confirmation.organizationValue}
          </span>
        </div>
      </div>

      <div>
        <span className="mb-2 block text-xs font-semibold text-slate-400">
          {copy.confirmation.accessLabel}
        </span>
        <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <Users
            className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-400"
            aria-hidden="true"
          />
          <div>
            <span className="block text-sm font-semibold text-white">
              {copy.confirmation.accessTitle}
            </span>
            <span className="block text-xs text-slate-400">
              {copy.confirmation.accessSubtitle}
            </span>
          </div>
        </div>
      </div>

      <a
        href="#"
        data-e2e="organization:confirmation-open"
        className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400"
      >
        {copy.confirmation.openResource}
      </a>
      <button
        type="button"
        data-e2e="organization:confirmation-stop-sharing"
        className="flex items-center justify-center gap-2 rounded-lg border border-red-900 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        {copy.confirmation.stopSharing}
      </button>
    </div>
  </main>
);
