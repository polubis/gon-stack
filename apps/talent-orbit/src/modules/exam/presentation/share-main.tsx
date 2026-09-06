import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Copy,
  Link2,
  Lock,
  Play,
  RotateCw,
  Users,
} from 'lucide-react';
import { copy } from './copy';

export const ShareMain = () => (
  <main
    data-e2e="exam:share-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-3 md:hidden">
        <h1 className="text-lg font-bold text-white">
          {copy.share.titleMobile}
        </h1>
      </div>

      <div
        role="status"
        data-e2e="exam:share-success-banner"
        className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400 md:hidden"
      >
        <CheckCircle2 className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
        {copy.share.successBannerMobile}
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <h1 className="text-lg font-bold text-white">{copy.share.title}</h1>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
          {copy.share.ready}
        </span>
      </div>
      <p className="hidden text-sm text-slate-400 md:block">
        {copy.share.subtitle}
      </p>

      <div
        data-e2e="exam:share-name-card"
        className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:hidden"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
          <ClipboardList className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold text-white">
            {copy.share.nameMobile}
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.share.deadlineLabel}: {copy.share.deadline}
          </span>
        </span>
      </div>

      <div
        data-e2e="exam:share-attempts-card"
        className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:hidden"
      >
        <Users className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
        <span className="flex-1">
          <span className="block text-sm text-slate-400">
            {copy.share.attemptsLabel}
          </span>
          <span className="block text-sm font-semibold text-white">
            {copy.share.attemptsMobile}
          </span>
        </span>
      </div>

      <div
        data-e2e="exam:share-summary"
        className="hidden flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:flex"
      >
        <h2 className="text-sm font-semibold text-white">
          {copy.share.summaryTitle}
        </h2>

        <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
          <ClipboardList
            className="h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
          <span className="flex-1 text-sm text-slate-300">
            {copy.share.questionsLabel}
          </span>
          <span className="text-sm font-semibold text-white">
            {copy.share.questionsCount}
          </span>
        </div>
        <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
          <Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span className="flex-1 text-sm text-slate-300">
            {copy.share.durationLabel}
          </span>
          <span className="text-sm font-semibold text-white">
            {copy.share.durationMinutes} min
          </span>
        </div>
        <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
          <CheckCircle2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span className="flex-1 text-sm text-slate-300">
            {copy.share.passScoreLabel}
          </span>
          <span className="text-sm font-semibold text-white">
            {copy.share.passScore}%
          </span>
        </div>
        <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
          <RotateCw className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span className="flex-1 text-sm text-slate-300">
            {copy.share.attemptsLabel}
          </span>
          <span className="text-sm font-semibold text-white">
            {copy.share.attempts}
          </span>
        </div>
        <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
          <Calendar className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span className="flex-1 text-sm text-slate-300">
            {copy.share.deadlineFullLabel}
          </span>
          <span className="text-sm font-semibold text-white">
            {copy.share.deadlineFull}
          </span>
        </div>
      </div>

      <div
        data-e2e="exam:share-credentials"
        className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5"
      >
        <h2 className="hidden text-sm font-semibold text-white md:block">
          {copy.share.shareTitle}
        </h2>

        <div className="flex items-center gap-2 text-sm text-slate-300 md:hidden">
          <Link2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
          {copy.share.joinLinkLabel}
        </div>
        <div>
          <label
            htmlFor="join-link"
            className="mb-2 hidden text-xs text-slate-400 md:block"
          >
            {copy.share.joinLinkLabel}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="join-link"
              type="text"
              readOnly
              value={copy.share.joinLink}
              data-e2e="exam:share-join-link"
              className="w-full flex-1 truncate rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300"
            />
            <button
              type="button"
              data-e2e="exam:share-copy-link"
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2.5 text-xs font-semibold text-white hover:bg-orange-400"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.share.copy}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-300 md:hidden">
          <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
          {copy.share.passwordLabel}
        </div>
        <div>
          <label
            htmlFor="join-password"
            className="mb-2 hidden text-xs text-slate-400 md:block"
          >
            {copy.share.passwordLabel}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="join-password"
              type="text"
              readOnly
              value={copy.share.password}
              data-e2e="exam:share-password"
              className="w-full flex-1 truncate rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300"
            />
            <button
              type="button"
              data-e2e="exam:share-copy-password"
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2.5 text-xs font-semibold text-white hover:bg-orange-400"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.share.copy}
            </button>
          </div>
        </div>
      </div>

      <a
        href="/exams-detail/"
        data-e2e="exam:share-start"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400"
      >
        <Play className="h-4 w-4" aria-hidden="true" />
        {copy.share.start}
      </a>
    </div>
  </main>
);
