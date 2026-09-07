import {
  ArrowLeft,
  BarChart3,
  Calendar,
  ClipboardList,
  Copy,
  Lock,
} from 'lucide-react';
import { copy } from './copy';
import { Sidebar } from './sidebar';

export const DetailMain = () => (
  <div data-e2e="exam:detail-main" className="flex min-h-screen bg-slate-950">
    <Sidebar />

    <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <a
            href="/exams/"
            aria-label={copy.detail.back}
            data-e2e="exam:detail-back"
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
          </a>
          <h1 className="text-lg font-bold text-white">{copy.detail.title}</h1>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-white">
              {copy.detail.nameMobile}
            </span>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-slate-700/50 px-2 py-0.5 text-xs font-semibold text-slate-300">
              <Lock className="h-3 w-3" aria-hidden="true" />
              {copy.detail.status}
            </span>
          </span>
        </div>

        <div
          data-e2e="exam:detail-summary"
          className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          <div className="hidden md:block">
            <h2 className="text-lg font-bold text-white">{copy.detail.name}</h2>
            <div className="mt-3 flex items-center gap-3 border-t border-slate-800 pt-4">
              <span className="text-sm text-slate-400">
                {copy.detail.statusLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-700/50 px-2 py-0.5 text-xs font-semibold text-slate-300">
                <Lock className="h-3 w-3" aria-hidden="true" />
                {copy.detail.status}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-slate-800 pt-4">
              <Calendar className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <span className="text-sm text-slate-400">
                {copy.detail.deadlineLabel}
              </span>
              <span className="text-sm font-semibold text-white">
                {copy.detail.deadline}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-4 md:hidden">
            <Calendar
              className="h-4 w-4 shrink-0 text-slate-400"
              aria-hidden="true"
            />
            <span>
              <span className="block text-xs text-slate-400">
                {copy.detail.deadlineLabel}
              </span>
              <span className="block text-sm font-semibold text-white">
                {copy.detail.deadlineMobile}
              </span>
            </span>
          </div>
        </div>

        <div
          data-e2e="exam:detail-overview"
          className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:grid-cols-3 md:border-0 md:bg-transparent md:p-0"
        >
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 md:bg-slate-900">
            <p className="text-xl font-bold text-white">
              {copy.detail.participants}
            </p>
            <p className="text-xs text-slate-400">
              {copy.detail.participantsLabel}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-4 md:block">
            <p className="text-xl font-bold text-white">
              {copy.detail.completed}{' '}
              <span className="text-sm font-normal text-slate-400">
                ({copy.detail.completedPercent}%)
              </span>
            </p>
            <p className="text-xs text-slate-400">
              {copy.detail.completedLabel}
            </p>
          </div>
          <div className="col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-4 md:col-span-1">
            <p className="text-xl font-bold text-white">
              {copy.detail.average}%
            </p>
            <p className="text-xs text-slate-400">{copy.detail.averageLabel}</p>
          </div>
        </div>

        <div
          data-e2e="exam:detail-credentials"
          className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          <div>
            <h2 className="text-sm font-semibold text-white">
              {copy.detail.shareTitle}
            </h2>
            <p className="mt-0.5 hidden text-xs text-slate-400 md:block">
              {copy.detail.shareSubtitle}
            </p>
          </div>

          <div>
            <label
              htmlFor="exam-link"
              className="mb-2 block text-xs text-slate-400"
            >
              {copy.detail.linkLabel}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="exam-link"
                type="text"
                readOnly
                value={copy.detail.link}
                data-e2e="exam:detail-link"
                className="hidden w-full flex-1 truncate rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-orange-400 md:block"
              />
              <input
                type="text"
                readOnly
                value={copy.detail.linkMobile}
                aria-label={copy.detail.linkLabel}
                data-e2e="exam:detail-link-mobile"
                className="w-full flex-1 truncate rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-orange-400 md:hidden"
              />
              <button
                type="button"
                aria-label={copy.detail.linkLabel}
                data-e2e="exam:detail-copy-link"
                className="flex shrink-0 items-center justify-center rounded-lg border border-slate-700 p-2.5 text-slate-300 hover:bg-slate-800"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="access-code"
              className="mb-2 block text-xs text-slate-400"
            >
              <span className="hidden md:inline">{copy.detail.codeLabel}</span>
              <span className="md:hidden">
                {copy.detail.passwordLabelMobile}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="access-code"
                type="text"
                readOnly
                value={copy.detail.code}
                data-e2e="exam:detail-code"
                className="hidden w-full flex-1 truncate rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white md:block"
              />
              <input
                type="text"
                readOnly
                value={copy.detail.codeMobile}
                aria-label={copy.detail.codeLabel}
                data-e2e="exam:detail-code-mobile"
                className="w-full flex-1 truncate rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white md:hidden"
              />
              <button
                type="button"
                aria-label={copy.detail.codeLabel}
                data-e2e="exam:detail-copy-code"
                className="flex shrink-0 items-center justify-center rounded-lg border border-slate-700 p-2.5 text-slate-300 hover:bg-slate-800"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <a
            href="/exams-statistics/"
            data-e2e="exam:detail-view-statistics"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400 md:border md:border-slate-700 md:bg-transparent"
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            {copy.detail.viewStatistics}
          </a>
        </div>
      </div>
    </main>
  </div>
);
