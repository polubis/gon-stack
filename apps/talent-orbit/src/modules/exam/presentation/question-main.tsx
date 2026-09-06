import { ArrowLeft, Timer } from 'lucide-react';
import { copy } from './copy';

export const QuestionMain = () => (
  <main
    data-e2e="exam:question-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-3 md:hidden">
        <a
          href="/exams-join/"
          aria-label={copy.question.back}
          data-e2e="exam:question-back"
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
        </a>
        <h1 className="text-lg font-bold text-white">
          {copy.question.titleMobile}
        </h1>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-200">
          {copy.question.progressLabel}
        </p>
        <div
          data-e2e="exam:question-timer"
          className="hidden shrink-0 items-center gap-2 rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-sm font-bold text-orange-400 md:flex"
        >
          <Timer className="h-4 w-4" aria-hidden="true" />
          {copy.question.timer}
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="h-full w-1/3 rounded-full bg-orange-500" />
      </div>

      <div
        data-e2e="exam:question-timer-mobile"
        className="flex flex-col items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-5 md:hidden"
      >
        <span className="flex items-center gap-2 text-2xl font-bold text-blue-400">
          <Timer className="h-6 w-6" aria-hidden="true" />
          {copy.question.timerMobile}
        </span>
        <span className="text-xs text-slate-400">
          {copy.question.timeRemainingMobile}
        </span>
      </div>

      <h2 className="text-lg font-semibold text-white">
        {copy.question.question}
      </h2>

      <div className="hidden flex-col gap-3 md:flex">
        {copy.question.options.map((option) => (
          <label
            key={option.letter}
            data-e2e={`exam:question-option-${option.letter.toLowerCase()}`}
            className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4"
          >
            <input type="radio" name="answer" className="sr-only" />
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-600 text-sm font-semibold text-slate-300">
              {option.letter}
            </span>
            <span className="text-sm text-white">{option.text}</span>
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {copy.question.optionsMobile.map((option) => (
          <label
            key={option.letter}
            data-e2e={`exam:question-option-mobile-${option.letter.toLowerCase()}`}
            className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4"
          >
            <input type="radio" name="answer-mobile" className="sr-only" />
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-600 text-sm font-semibold text-slate-300">
              {option.letter}
            </span>
            <span className="text-sm text-white">{option.text}</span>
          </label>
        ))}
      </div>

      <a
        href="/exams-submitted/"
        data-e2e="exam:question-submit"
        className="flex w-full items-center justify-center rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400 md:bg-orange-500 md:hover:bg-orange-400"
      >
        {copy.question.submit}
      </a>
    </div>
  </main>
);
