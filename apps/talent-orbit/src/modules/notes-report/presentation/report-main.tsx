import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  FileDown,
  Info,
  Lightbulb,
  Star,
  UserCircle2,
} from 'lucide-react';
import { copy } from './copy';
import { Sidebar } from './sidebar';

export const ReportMain = () => (
  <div
    data-e2e="notes-report:report-main"
    className="flex min-h-screen bg-slate-950"
  >
    <Sidebar />

    <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <a
            href="/notes-report-review/"
            aria-label={copy.report.back}
            data-e2e="notes-report:report-back"
            className="text-slate-300 hover:text-white md:hidden"
          >
            <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
          </a>
          <h1 className="text-lg font-bold text-white md:hidden">
            {copy.report.titleMobile}
          </h1>
        </div>

        <div
          role="status"
          data-e2e="notes-report:report-ready"
          className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
        >
          <CheckCircle2
            className="h-5 w-5 shrink-0 text-emerald-400"
            aria-hidden="true"
          />
          <span>
            <span className="block text-sm font-semibold text-emerald-400">
              {copy.report.ready}
            </span>
            <span className="block text-xs text-emerald-400/80">
              {copy.report.readySubtitle}
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>
            <span className="block text-xs text-slate-400">
              {copy.report.candidateLabel}
            </span>
            <span className="block text-lg font-bold text-white">
              {copy.report.candidateId}
            </span>
          </span>
          <UserCircle2
            className="h-8 w-8 text-emerald-400"
            aria-hidden="true"
          />
        </div>

        <div
          data-e2e="notes-report:report-summary"
          className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-4"
        >
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Info className="h-4 w-4 text-blue-400" aria-hidden="true" />
            {copy.report.summaryTitle}
          </h2>
          <p className="text-sm text-slate-300">
            <span className="hidden md:inline">{copy.report.summary}</span>
            <span className="md:hidden">{copy.report.summaryMobile}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            data-e2e="notes-report:report-strengths"
            className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4"
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <Star className="h-4 w-4" aria-hidden="true" />
              {copy.report.strengthsTitle}
            </h2>
            <ul className="flex flex-col gap-2">
              {copy.report.strengths.map((item) => (
                <li
                  key={item}
                  className="hidden items-start gap-2 text-sm text-slate-300 md:flex"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
              {copy.report.strengthsMobile.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-slate-300 md:hidden"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            data-e2e="notes-report:report-areas"
            className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4"
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-400">
              <Lightbulb className="h-4 w-4" aria-hidden="true" />
              {copy.report.areasTitle}
            </h2>
            <ul className="flex flex-col gap-2">
              {copy.report.areas.map((item) => (
                <li
                  key={item}
                  className="hidden items-start gap-2 text-sm text-slate-300 md:flex"
                >
                  <Circle
                    className="mt-1 h-2.5 w-2.5 shrink-0 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
              {copy.report.areasMobile.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-slate-300 md:hidden"
                >
                  <span
                    className="mt-2.5 h-1 w-3 shrink-0 rounded-full bg-amber-400"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          type="button"
          data-e2e="notes-report:report-export"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-3.5 text-sm font-semibold text-white hover:bg-slate-900"
        >
          <FileDown className="h-4 w-4 text-blue-400" aria-hidden="true" />
          {copy.report.exportToWord}
        </button>

        <a
          href="/notes-report-feedback/"
          data-e2e="notes-report:report-view-details"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400 md:hidden"
        >
          {copy.report.viewDetails}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </main>
  </div>
);
