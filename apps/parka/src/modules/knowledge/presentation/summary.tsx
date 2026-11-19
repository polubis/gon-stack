import { Ring } from '@/shared/ui/ring';
import { useContext } from './context';

/** Summary card on the obsidian hero: finished vs unfinished topics. */
export const Summary = () => {
  const { summary } = useContext();
  const unfinished = summary.topics - summary.doneTopics;
  const pct =
    summary.topics === 0
      ? 0
      : Math.round((summary.doneTopics / summary.topics) * 100);
  return (
    <div
      data-e2e="knowledge:summary"
      className="hero-card flex flex-col justify-center gap-5 rounded-4xl p-5 shadow-popover md:p-7 xl:h-full"
    >
      <div className="flex items-center gap-5">
        <Ring
          surface="hero"
          pct={pct}
          label={`Ukończono ${pct}% tematów (${summary.doneTopics} z ${summary.topics})`}
          className="size-28 md:size-32"
        >
          <span
            data-e2e="knowledge:progress"
            className="text-2xl tracking-tight md:text-3xl"
          >
            {pct}%
          </span>
        </Ring>
        <div className="min-w-0">
          <p className="text-sm text-on-hero-soft">Ukończone tematy</p>
          <p className="animate-rise text-4xl font-semibold tracking-tight tabular-nums motion-reduce:animate-none md:text-5xl">
            {summary.doneTopics} z {summary.topics}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-3 divide-x divide-hero-line border-t border-hero-line pt-4">
        {(
          [
            ['Wszystkie', summary.topics, 'knowledge:total'],
            ['Ukończone', summary.doneTopics, 'knowledge:done'],
            ['Nieukończone', unfinished, 'knowledge:unfinished'],
          ] as const
        ).map(([label, value, id]) => (
          <div key={label} className="flex flex-col items-center gap-0.5 px-2">
            <dt className="text-center text-xs text-on-hero-soft">{label}</dt>
            <dd
              data-e2e={id}
              className="text-sm font-semibold tabular-nums md:text-base"
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
