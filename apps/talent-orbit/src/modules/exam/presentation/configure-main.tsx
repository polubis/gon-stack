import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Shuffle,
} from 'lucide-react';
import { copy } from './copy';

export const ConfigureMain = () => (
  <main
    data-e2e="exam:configure-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-xl flex-col gap-6 md:max-w-4xl">
      <div className="flex items-center gap-3">
        <a
          href="/exams-choose-test/"
          aria-label={copy.configure.back}
          data-e2e="exam:configure-back"
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
        </a>
        <div>
          <h1 className="text-lg font-bold text-white">
            <span className="hidden md:inline">
              {copy.configure.titleDesktop}
            </span>
            <span className="md:hidden">{copy.configure.titleMobile}</span>
          </h1>
          <p className="hidden text-sm text-slate-400 md:block">
            {copy.configure.subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 md:grid md:grid-cols-[1.4fr_1fr] md:items-start">
        <form data-e2e="exam:configure-form" className="flex flex-col gap-6">
          <div>
            <label
              htmlFor="exam-name"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              {copy.configure.nameLabel}
            </label>
            <input
              id="exam-name"
              type="text"
              defaultValue={copy.configure.name}
              data-e2e="exam:configure-name"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-200">
                {copy.configure.useDefaultsLabel}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {copy.configure.useDefaultsHint}
              </p>
              <a
                href="#"
                data-e2e="exam:configure-override"
                className="mt-1 inline-block text-xs font-medium text-orange-400 underline md:hidden"
              >
                {copy.configure.override}
              </a>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked="true"
              aria-label={copy.configure.useDefaultsLabel}
              data-e2e="exam:configure-defaults-toggle"
              className="relative h-6 w-11 shrink-0 rounded-full bg-orange-500"
            >
              <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="deadline-date"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                {copy.configure.deadlineLabel}
              </label>
              <div className="relative">
                <Calendar
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="deadline-date"
                  type="text"
                  defaultValue={copy.configure.deadlineDate}
                  data-e2e="exam:configure-deadline-date"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-10 pr-3 text-sm text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="deadline-time"
                className="mb-2 block text-sm font-semibold text-slate-200 md:opacity-0"
              >
                Time
              </label>
              <input
                id="deadline-time"
                type="text"
                defaultValue={copy.configure.deadlineTime}
                data-e2e="exam:configure-deadline-time"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="closes-date"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                {copy.configure.closesLabel}
              </label>
              <div className="relative">
                <Calendar
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="closes-date"
                  type="text"
                  defaultValue={copy.configure.closesDate}
                  data-e2e="exam:configure-closes-date"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-10 pr-3 text-sm text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="closes-time"
                className="mb-2 block text-sm font-semibold text-slate-200 md:opacity-0"
              >
                Time
              </label>
              <input
                id="closes-time"
                type="text"
                defaultValue={copy.configure.closesTime}
                data-e2e="exam:configure-closes-time"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="attempts"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              {copy.configure.attemptsLabel}
            </label>
            <input
              id="attempts"
              type="number"
              defaultValue={copy.configure.attempts}
              data-e2e="exam:configure-attempts"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
            />
            <p className="mt-1.5 hidden text-xs text-slate-400 md:block">
              {copy.configure.attemptsHint}
            </p>
          </div>

          <a
            href="/exams-share/"
            data-e2e="exam:configure-continue"
            className="flex w-full items-center justify-center rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400 md:hidden"
          >
            {copy.configure.continue}
          </a>
        </form>

        <div
          data-e2e="exam:configure-override-panel"
          className="hidden flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:flex"
        >
          <div>
            <h2 className="text-sm font-semibold text-white">
              {copy.configure.overrideTitle}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {copy.configure.overrideSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
            <FileText className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <span className="flex-1 text-sm text-slate-300">
              {copy.configure.questionsLabel}
            </span>
            <span className="text-sm font-semibold text-white">
              {copy.configure.questionsCount}
            </span>
          </div>

          <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
            <Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <span className="flex-1 text-sm text-slate-300">
              {copy.configure.totalTimeLabel}
            </span>
            <span className="text-sm font-semibold text-white">
              {copy.configure.totalMinutes} min
            </span>
          </div>

          <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
            <CheckCircle2
              className="h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <span className="flex-1 text-sm text-slate-300">
              {copy.configure.passingScoreLabel}
            </span>
            <span className="text-sm font-semibold text-white">
              {copy.configure.passingScore}%
            </span>
          </div>

          <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
            <Shuffle className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <span className="flex-1 text-sm text-slate-300">
              {copy.configure.randomizeLabel}
            </span>
            <span className="text-sm font-semibold text-white">
              {copy.configure.randomizeValue}
            </span>
          </div>
        </div>

        <a
          href="/exams-share/"
          data-e2e="exam:configure-continue-desktop"
          className="hidden w-full items-center justify-center rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400 md:col-span-2 md:flex"
        >
          {copy.configure.continue}
        </a>
      </div>
    </div>
  </main>
);
