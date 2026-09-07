import { ArrowLeft, Check, Clipboard, Pencil, Quote } from 'lucide-react';
import { copy } from './copy';
import { Sidebar } from './sidebar';

export const FeedbackMain = () => (
  <div
    data-e2e="notes-report:feedback-main"
    className="flex min-h-screen bg-slate-950"
  >
    <Sidebar />

    <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <a
            href="/notes-report-report/"
            aria-label={copy.feedback.back}
            data-e2e="notes-report:feedback-back"
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
          </a>
          <h1 className="text-lg font-bold text-white">
            {copy.feedback.titleDesktop}
          </h1>
        </div>
        <p className="-mt-4 text-sm text-slate-400">
          <span className="hidden md:inline">
            {copy.feedback.subtitleDesktop}
          </span>
          <span className="md:hidden">{copy.feedback.subtitleMobile}</span>
        </p>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">
              {copy.feedback.feedbackLabel}{' '}
              <span className="font-normal text-slate-400">
                {copy.feedback.editable}
              </span>
            </span>
            <button
              type="button"
              data-e2e="notes-report:feedback-edit"
              className="hidden items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 md:flex"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.feedback.edit}
            </button>
          </div>

          <div
            data-e2e="notes-report:feedback-text"
            className="relative flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4"
          >
            <Quote
              className="h-5 w-5 text-emerald-500 md:hidden"
              aria-hidden="true"
            />
            <p className="hidden whitespace-pre-line text-sm text-slate-300 md:block">
              {copy.feedback.feedback}
            </p>
            <p className="whitespace-pre-line text-sm text-slate-300 md:hidden">
              {copy.feedback.feedbackMobile}
            </p>
            <p className="text-right text-xs text-slate-400">
              {copy.feedback.charCount}
            </p>

            <button
              type="button"
              aria-label={copy.feedback.edit}
              data-e2e="notes-report:feedback-edit-mobile"
              className="absolute right-4 top-4 flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 md:hidden"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.feedback.edit}
            </button>
          </div>
        </div>

        <button
          type="button"
          data-e2e="notes-report:feedback-copy"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-3.5 text-sm font-semibold text-white hover:bg-slate-900"
        >
          <Clipboard className="h-4 w-4" aria-hidden="true" />
          {copy.feedback.copyFeedback}
        </button>

        <div
          role="status"
          data-e2e="notes-report:feedback-copied"
          className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-400"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          {copy.feedback.copied}
        </div>

        <a
          href="/notes-report-report/"
          data-e2e="notes-report:feedback-back-to-exam"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-3.5 text-sm font-semibold text-white hover:bg-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {copy.feedback.backToExam}
        </a>
      </div>
    </main>
  </div>
);
