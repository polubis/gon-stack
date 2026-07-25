import type { LucideIcon } from 'lucide-react';
import {
  Angry,
  Heart,
  Laugh,
  Lightbulb,
  MessageSquare,
  Star,
  ThumbsDown,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { appConfig } from '../configuration/constraints';
import type { ScoreBreakdown, ScoreStats } from '../domain/models';

type TestimonialsWidgetProps = {
  stats: ScoreStats;
  commentsCount: number;
  className?: string;
};

const MOOD_ITEMS: {
  key: keyof ScoreBreakdown;
  icon: LucideIcon;
  label: string;
}[] = [
  { key: 'perfect', icon: Laugh, label: 'Świetnie' },
  { key: 'good', icon: Heart, label: 'Dobrze' },
  { key: 'decent', icon: Lightbulb, label: 'Neutralnie' },
  { key: 'bad', icon: ThumbsDown, label: 'Słabo' },
  { key: 'ugly', icon: Angry, label: 'Bardzo słabo' },
];

const averageFormatter = new Intl.NumberFormat('pl-PL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const countFormatter = new Intl.NumberFormat('pl-PL');

type StatChipProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

const profileLink = appConfig.opinionsSection.profileLink;

const StatChip = ({ icon: Icon, label, value }: StatChipProps) => (
  <a
    href={profileLink}
    target="_blank"
    rel="noopener noreferrer"
    title={label}
    className="stat-link stat-chip group inline-flex items-center gap-1.5 rounded-full border border-primary-500/20 bg-primary-500/5 px-2.5 py-1 text-foreground transition-colors duration-300"
  >
    <span className="relative inline-flex size-3.5 shrink-0 items-center justify-center">
      <span
        className="stat-ping pointer-events-none absolute inset-0 rounded-full border border-primary-500/40"
        aria-hidden="true"
      />
      <Icon
        className="stat-icon size-3.5 shrink-0 text-primary-500 transition-colors duration-300"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </span>
    <span
      className="text-small font-500 tabular-nums transition-colors duration-300 ease-in-out group-hover:text-primary-500"
      translate="no"
    >
      {value}
    </span>
    <span className="sr-only">{label}</span>
  </a>
);

export const TestimonialsWidget = ({
  stats,
  commentsCount,
  className,
}: TestimonialsWidgetProps) => {
  const formattedAverage = averageFormatter.format(stats.average);
  const formattedCommentsCount = countFormatter.format(commentsCount);

  return (
    <section
      className={cn('w-fit max-w-full', className)}
      aria-labelledby="testimonials-stats-title"
    >
      <h2 id="testimonials-stats-title" className="sr-only">
        Statystyki opinii użytkowników
      </h2>

      <div className="flex w-fit max-w-full flex-wrap items-center gap-1.5">
        <StatChip
          icon={Star}
          label="Średnia ocena na 4markdown.com"
          value={`${formattedAverage}/10`}
        />
        <StatChip
          icon={MessageSquare}
          label="Liczba opinii na 4markdown.com"
          value={`${formattedCommentsCount} opinii`}
        />
        {MOOD_ITEMS.map(({ key, icon, label }) => (
          <StatChip
            key={key}
            icon={icon}
            label={label}
            value={countFormatter.format(stats.breakdown[key])}
          />
        ))}
      </div>
    </section>
  );
};
