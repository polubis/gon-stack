import {
  ArrowLeft,
  Atom,
  CheckCircle2,
  Clock,
  Code2,
  FileCode2,
  HelpCircle,
  Search,
} from 'lucide-react';
import { copy } from './copy';

const testIcon = { code: Code2, react: Atom, js: FileCode2 } as const;

const iconAccent = {
  emerald: 'bg-emerald-500/10 text-emerald-400',
  violet: 'bg-violet-500/10 text-violet-400',
  blue: 'bg-blue-500/10 text-blue-400',
} as const;

export const ChooseTestMain = () => (
  <main
    data-e2e="exam:choose-test-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <a
          href="/exams/"
          aria-label={copy.chooseTest.back}
          data-e2e="exam:choose-test-back"
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
        </a>
        <h1 className="text-lg font-bold text-white">
          <span className="hidden md:inline">
            {copy.chooseTest.titleDesktop}
          </span>
          <span className="md:hidden">{copy.chooseTest.titleMobile}</span>
        </h1>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder={copy.chooseTest.searchPlaceholder}
          data-e2e="exam:choose-test-search"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-3">
        {copy.chooseTest.tests.map((item, index) => {
          const Icon = testIcon[item.icon];

          return (
            <label
              key={item.name}
              data-e2e={`exam:choose-test-card-${index}`}
              className={`flex items-start gap-3.5 rounded-2xl border p-4 ${
                item.selected
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-slate-800 bg-slate-900'
              }`}
            >
              <input
                type="radio"
                name="test"
                defaultChecked={item.selected}
                className="sr-only"
              />

              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconAccent[item.accent]}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>

              <span className="flex-1">
                <span className="block text-sm font-semibold text-white">
                  {item.name}
                </span>
                <span className="mt-0.5 hidden text-xs text-slate-400 md:block">
                  {item.description}
                </span>
                <span className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.questions} Questions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.minutes} min
                  </span>
                </span>
              </span>

              {item.selected ? (
                <CheckCircle2
                  className="h-5 w-5 shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
              ) : (
                <span
                  className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-600"
                  aria-hidden="true"
                />
              )}
            </label>
          );
        })}
      </div>

      <a
        href="/exams-configure/"
        data-e2e="exam:choose-test-continue"
        className="flex w-full items-center justify-center rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400"
      >
        {copy.chooseTest.continue}
      </a>
    </div>
  </main>
);
