import {
  ArrowLeft,
  CircleDot,
  Link2,
  ListChecks,
  MessageSquare,
} from 'lucide-react';
import { copy } from './copy';

const typeIcon = {
  singleChoice: CircleDot,
  multipleChoice: ListChecks,
  openQuestion: MessageSquare,
  linking: Link2,
} as const;

export const ChooseTypeMain = () => (
  <main
    data-e2e="questions-library:choose-type-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-xl flex-col gap-6 md:max-w-3xl">
      <div className="flex items-center gap-3">
        <a
          href="/questions-library-link-concept/"
          aria-label={copy.chooseType.back}
          data-e2e="questions-library:choose-type-back"
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
        </a>
        <div>
          <h1 className="text-lg font-bold text-white">
            {copy.chooseType.title}
          </h1>
          <p className="text-sm text-slate-400">{copy.chooseType.subtitle}</p>
        </div>
      </div>

      <div
        className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4"
        role="radiogroup"
        aria-label={copy.chooseType.title}
      >
        {copy.chooseType.types.map((type) => {
          const Icon = typeIcon[type.name];
          const selected = type.name === copy.chooseType.selected;

          return (
            <button
              key={type.name}
              type="button"
              role="radio"
              aria-checked={selected}
              data-e2e={`questions-library:choose-type-${type.name}`}
              className={`flex items-center gap-4 rounded-2xl border p-4 text-left md:flex-col md:items-start md:gap-0 md:p-5 ${
                selected
                  ? 'border-orange-500 bg-orange-500/5'
                  : 'border-slate-800 bg-slate-900'
              }`}
            >
              <span className="flex shrink-0 items-center justify-between md:mb-4 md:w-full">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    selected
                      ? 'bg-orange-500/10 text-orange-400'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span
                  className={`hidden h-5.5 w-5.5 items-center justify-center rounded-full border-2 md:flex ${
                    selected
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-slate-600'
                  }`}
                >
                  {selected && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                </span>
              </span>

              <span className="flex-1 md:flex-none">
                <span className="flex items-center justify-between gap-2 md:block">
                  <span className="text-sm font-semibold text-white">
                    {type.title}
                  </span>
                  <span
                    className={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full border-2 md:hidden ${
                      selected
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-slate-600'
                    }`}
                  >
                    {selected && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                </span>
                <span className="mt-1 block text-xs text-slate-400 md:text-sm">
                  {type.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <a
        href="/questions-library-compose/"
        data-e2e="questions-library:choose-type-continue"
        className="flex w-full items-center justify-center rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400"
      >
        {copy.chooseType.continue}
      </a>
    </div>
  </main>
);
