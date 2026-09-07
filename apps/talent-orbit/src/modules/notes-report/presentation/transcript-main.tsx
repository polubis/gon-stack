import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Mic,
  ShieldCheck,
  Upload,
  Users,
} from 'lucide-react';
import { copy } from './copy';
import { Sidebar } from './sidebar';

export const TranscriptMain = () => (
  <div
    data-e2e="notes-report:transcript-main"
    className="flex min-h-screen bg-slate-950"
  >
    <Sidebar />

    <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="hidden items-center gap-2 text-sm font-semibold text-orange-400 md:flex">
          <Users className="h-4.5 w-4.5" aria-hidden="true" />
          {copy.transcript.badge}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/notes-report-notes/"
            aria-label={copy.transcript.back}
            data-e2e="notes-report:transcript-back"
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
          </a>
          <h1 className="text-lg font-bold text-white">
            {copy.transcript.titleDesktop}
          </h1>
        </div>

        <div className="flex flex-col gap-1 md:hidden">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
            <Mic className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <p className="text-sm text-slate-400">{copy.transcript.hintMobile}</p>
        </div>

        <div
          data-e2e="notes-report:transcript-candidate-card"
          className="hidden items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:flex"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-white">
              {copy.transcript.sessionName}
            </span>
            <span className="mt-0.5 block text-xs text-slate-400">
              {copy.transcript.candidateIdLabel}:{' '}
              <span className="text-orange-400">
                {copy.transcript.candidateId}
              </span>
            </span>
          </span>
        </div>

        <div className="hidden md:block">
          <h2 className="text-base font-semibold text-white">
            {copy.transcript.sectionTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {copy.transcript.sectionHint}
          </p>
        </div>

        <label
          data-e2e="notes-report:transcript-dropzone"
          className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-10 text-center"
        >
          <input type="file" className="sr-only" />

          <span className="hidden text-slate-400 md:block">
            <FileText className="h-9 w-9" aria-hidden="true" />
          </span>
          <span className="text-slate-400 md:hidden">
            <Upload className="h-9 w-9" aria-hidden="true" />
          </span>

          <span className="hidden text-sm text-slate-300 md:block">
            {copy.transcript.dropTitleDesktop}
          </span>
          <span className="hidden text-xs text-slate-400 md:block">
            {copy.transcript.or}
          </span>
          <span className="hidden rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-white md:flex md:items-center md:gap-2">
            <Upload className="h-4 w-4" aria-hidden="true" />
            {copy.transcript.uploadFile}
          </span>

          <span className="text-sm text-slate-300 md:hidden">
            {copy.transcript.dropTitleMobile}
          </span>
          <span className="text-sm font-medium text-orange-400 md:hidden">
            {copy.transcript.uploadFileMobile}
          </span>

          <span className="hidden flex-col gap-0.5 text-xs text-slate-400 md:flex">
            <span>{copy.transcript.formats}</span>
            <span>{copy.transcript.maxSize}</span>
          </span>
        </label>

        <p className="text-xs text-slate-400 md:hidden">
          {copy.transcript.charCount}
        </p>

        <div
          data-e2e="notes-report:transcript-privacy"
          className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"
        >
          <ShieldCheck
            className="h-5 w-5 shrink-0 text-emerald-400"
            aria-hidden="true"
          />
          <p className="text-sm text-slate-300">
            <span className="hidden md:inline">
              <span className="font-semibold text-white">
                {copy.transcript.privacyTitle}
              </span>{' '}
              {copy.transcript.privacyBody}
            </span>
            <span className="md:hidden">
              {copy.transcript.privacyBodyMobile}
            </span>
          </p>
        </div>

        <a
          href="/notes-report-review/"
          data-e2e="notes-report:transcript-continue"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400"
        >
          {copy.transcript.continue}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </main>
  </div>
);
