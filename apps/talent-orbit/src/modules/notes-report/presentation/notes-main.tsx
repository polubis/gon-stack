import {
  ArrowLeft,
  Bold,
  ChevronDown,
  FileText,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Save,
  Underline,
  Users,
} from 'lucide-react';
import { copy } from './copy';
import { Sidebar } from './sidebar';

export const NotesMain = () => (
  <div
    data-e2e="notes-report:notes-main"
    className="flex min-h-screen bg-slate-950"
  >
    <Sidebar />

    <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="hidden items-center gap-2 text-sm font-semibold text-orange-400 md:flex">
          <Users className="h-4.5 w-4.5" aria-hidden="true" />
          {copy.notes.badge}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/notes-report-thank-you/"
            aria-label={copy.notes.back}
            data-e2e="notes-report:notes-back"
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
          </a>
          <h1 className="text-lg font-bold text-white">
            {copy.notes.titleDesktop}
          </h1>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-orange-400 md:hidden">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/10">
            <FileText className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <span className="text-slate-400">
            {copy.notes.examLabel}:{' '}
            <span className="text-orange-400">{copy.notes.exam}</span>
          </span>
        </div>

        <div
          data-e2e="notes-report:notes-candidate-card"
          className="hidden items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:flex"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-white">
              {copy.notes.exam}
            </span>
            <span className="mt-0.5 block text-xs text-slate-400">
              {copy.notes.candidateIdLabel}:{' '}
              <span className="text-orange-400">{copy.notes.candidateId}</span>
            </span>
          </span>
        </div>

        <div className="hidden md:block">
          <h2 className="text-base font-semibold text-white">
            {copy.notes.notesTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{copy.notes.notesHint}</p>
        </div>

        <div className="hidden flex-col overflow-hidden rounded-xl border border-slate-700 md:flex">
          <div className="flex items-center gap-3 border-b border-slate-700 bg-slate-900 px-3 py-2">
            <button
              type="button"
              data-e2e="notes-report:notes-format"
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
            >
              {copy.notes.format}
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <div className="h-4 w-px bg-slate-700" aria-hidden="true" />
            <Bold className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <Italic className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <Underline className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <List className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <ListOrdered
              className="h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <LinkIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          <textarea
            rows={8}
            placeholder={copy.notes.placeholder}
            data-e2e="notes-report:notes-textarea"
            className="w-full resize-none bg-slate-950 px-4 py-4 text-sm text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div
          data-e2e="notes-report:notes-suggestions"
          className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:hidden"
        >
          <div>
            <h2 className="text-sm font-semibold text-emerald-400">
              {copy.notes.strengthsTitle}
            </h2>
            <ul className="mt-2 flex flex-col gap-1.5">
              {copy.notes.strengths.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <span
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-500"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h2 className="text-sm font-semibold text-red-400">
              {copy.notes.concernsTitle}
            </h2>
            <ul className="mt-2 flex flex-col gap-1.5">
              {copy.notes.concerns.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <span
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-500"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <a
          href="/notes-report-transcript/"
          data-e2e="notes-report:notes-continue"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {copy.notes.saveAndContinue}
        </a>
      </div>
    </main>
  </div>
);
