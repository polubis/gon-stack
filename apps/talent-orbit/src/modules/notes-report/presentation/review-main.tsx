import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Pencil,
  ShieldCheck,
} from 'lucide-react';
import { copy } from './copy';
import { Sidebar } from './sidebar';

export const ReviewMain = () => (
  <div
    data-e2e="notes-report:review-main"
    className="flex min-h-screen bg-slate-950"
  >
    <Sidebar />

    <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <a
            href="/notes-report-transcript/"
            aria-label={copy.review.back}
            data-e2e="notes-report:review-back"
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
          </a>
          <h1 className="text-lg font-bold text-white">
            {copy.review.titleDesktop}
          </h1>
        </div>
        <p className="-mt-4 text-sm text-slate-400">{copy.review.subtitle}</p>

        <div
          data-e2e="notes-report:review-notes-card"
          className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <FileText className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <span className="hidden md:inline">{copy.review.notesTitle}</span>
              <span className="md:hidden">{copy.review.notesTitleMobile}</span>
            </span>
            <button
              type="button"
              data-e2e="notes-report:review-notes-edit"
              className="flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.review.edit}
            </button>
          </div>
          <p className="hidden text-xs text-slate-400 md:block">
            {copy.review.notesSubtitleMobile}
          </p>

          <p className="hidden whitespace-pre-line text-sm text-slate-300 md:block">
            {copy.review.notesPreview}
          </p>
          <p className="text-right text-xs text-slate-400">
            {copy.review.notesChars}
          </p>
        </div>

        <div
          data-e2e="notes-report:review-transcript-card"
          className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <FileText className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <span className="hidden md:inline">
                {copy.review.transcriptTitle}
              </span>
              <span className="md:hidden">
                {copy.review.transcriptTitleMobile}
              </span>
            </span>
            <button
              type="button"
              data-e2e="notes-report:review-transcript-edit"
              className="flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.review.edit}
            </button>
          </div>
          <p className="hidden text-xs text-slate-400 md:block">
            {copy.review.transcriptSubtitleMobile}
          </p>

          <p className="hidden whitespace-pre-line text-sm text-slate-300 md:block">
            {copy.review.transcriptPreview}
          </p>
          <p className="text-right text-xs text-slate-400">
            {copy.review.transcriptChars}
          </p>
        </div>

        <div
          data-e2e="notes-report:review-privacy"
          className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4"
        >
          <ShieldCheck
            className="h-4.5 w-4.5 shrink-0 text-slate-400"
            aria-hidden="true"
          />
          <p className="text-sm text-slate-400">
            <span className="hidden md:inline">{copy.review.privacyNote}</span>
            <span className="md:hidden">{copy.review.privacyNoteMobile}</span>
          </p>
        </div>

        <a
          href="/notes-report-report/"
          data-e2e="notes-report:review-continue"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-400 md:bg-orange-500 md:hover:bg-orange-400"
        >
          {copy.review.acceptAndGenerate}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </main>
  </div>
);
