import { ArrowLeft, CheckCircle2, Download, Star, Users } from 'lucide-react';
import { copy } from './copy';
import { Sidebar } from './sidebar';

const distributionTone = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
} as const;

export const StatisticsMain = () => (
  <div
    data-e2e="exam:statistics-main"
    className="flex min-h-screen bg-slate-950"
  >
    <Sidebar />

    <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6 md:max-w-4xl">
        <div className="flex items-center gap-3">
          <a
            href="/exams-detail/"
            aria-label={copy.statistics.back}
            data-e2e="exam:statistics-back"
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
          </a>
          <h1 className="text-lg font-bold text-white">
            {copy.statistics.title}
          </h1>
        </div>

        <div
          className="grid grid-cols-3 gap-3"
          data-e2e="exam:statistics-summary"
        >
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <Users className="h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
            <p className="mt-2 text-xl font-bold text-white">
              {copy.statistics.participants}
            </p>
            <p className="text-xs text-slate-400">
              {copy.statistics.participantsLabel}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <CheckCircle2
              className="h-4.5 w-4.5 text-emerald-400"
              aria-hidden="true"
            />
            <p className="mt-2 text-xl font-bold text-white">
              {copy.statistics.completed}
            </p>
            <p className="text-xs text-slate-400">
              {copy.statistics.completedLabel}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <Star className="h-4.5 w-4.5 text-orange-400" aria-hidden="true" />
            <p className="mt-2 text-xl font-bold text-white">
              {copy.statistics.average}
            </p>
            <p className="text-xs text-slate-400">
              {copy.statistics.averageLabel}
            </p>
          </div>
        </div>

        <div
          data-e2e="exam:statistics-distribution"
          className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          <h2 className="text-sm font-semibold text-white">
            {copy.statistics.distributionTitle}
          </h2>

          <div className="mt-5 hidden items-end justify-around gap-4 md:flex">
            {copy.statistics.distributionDesktop.map((bucket) => {
              const max = Math.max(
                ...copy.statistics.distributionDesktop.map((b) => b.value),
              );

              return (
                <div
                  key={bucket.label}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="text-xs font-semibold text-slate-300">
                    {bucket.value}
                  </span>
                  <div
                    className="w-full max-w-14 rounded-t-md bg-blue-500"
                    style={{ height: `${(bucket.value / max) * 8}rem` }}
                  />
                  <span className="text-xs text-slate-400">{bucket.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-3 md:hidden">
            {copy.statistics.distributionMobile.map((bucket) => (
              <div key={bucket.label} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs text-slate-400">
                  {bucket.label}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${distributionTone[bucket.tone]}`}
                    style={{ width: `${bucket.percent}%` }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right text-xs text-slate-400">
                  {bucket.count} ({bucket.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          data-e2e="exam:statistics-performance"
          className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          <h2 className="text-sm font-semibold text-white">
            {copy.statistics.performanceTitle}
          </h2>

          <div className="mt-4 hidden md:block">
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 border-b border-slate-800 pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span>#</span>
              <span>{copy.statistics.questionColumn}</span>
              <span>{copy.statistics.correctColumn}</span>
              <span>{copy.statistics.timeColumn}</span>
            </div>
            <div className="flex flex-col divide-y divide-slate-800">
              {copy.statistics.performance.map((row, index) => (
                <div
                  key={row.question}
                  data-e2e={`exam:statistics-row-${index}`}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 py-3"
                >
                  <span className="text-sm text-slate-400">{index + 1}</span>
                  <span className="text-sm text-white">{row.question}</span>
                  <span className="text-sm font-semibold text-white">
                    {row.correct}%
                  </span>
                  <span className="text-sm text-slate-400">{row.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 md:hidden">
            {copy.statistics.performanceMobile.map((row, index) => (
              <div
                key={row.question}
                data-e2e={`exam:statistics-row-mobile-${index}`}
                className="flex items-center gap-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-white">{row.question}</p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${row.percent >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold ${row.percent >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}
                >
                  {row.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <a
          href="#"
          data-e2e="exam:statistics-export"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-3 text-sm font-semibold text-white hover:bg-slate-900"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {copy.statistics.exportResults}
        </a>
      </div>
    </main>
  </div>
);
