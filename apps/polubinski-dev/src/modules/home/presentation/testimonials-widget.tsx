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

const TestimonialsWidget = ({
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

      <div className="flex w-fit max-w-full flex-wrap items-center gap-x-4 gap-y-2 text-small font-500 text-foreground-secondary">
        <a
          href={appConfig.opinionsSection.profileLink}
          target="_blank"
          rel="noopener noreferrer"
          title="Zobacz profil ocen na 4markdown.com"
          className="stat-link group flex items-center gap-1.5"
        >
          <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
            <span
              className="stat-ping pointer-events-none absolute inset-0 rounded-full border border-primary-400"
              aria-hidden="true"
            />
            <Star
              className="stat-icon size-4 shrink-0 text-primary-400"
              aria-hidden="true"
            />
          </span>
          <span
            className="transition-colors duration-300 ease-in-out group-hover:text-white"
            translate="no"
          >
            <span className="font-500 tabular-nums">{formattedAverage}</span>
            /10
          </span>
        </a>

        <a
          href={appConfig.opinionsSection.profileLink}
          target="_blank"
          rel="noopener noreferrer"
          title="Zobacz profil ocen na 4markdown.com"
          className="stat-link group flex items-center gap-1.5"
        >
          <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
            <span
              className="stat-ping pointer-events-none absolute inset-0 rounded-full border border-primary-400"
              aria-hidden="true"
            />
            <MessageSquare
              className="stat-icon size-4 shrink-0 text-primary-400"
              aria-hidden="true"
            />
          </span>
          <span
            className="tabular-nums transition-colors duration-300 ease-in-out group-hover:text-white"
            translate="no"
          >
            {formattedCommentsCount} opinii
          </span>
        </a>

        {MOOD_ITEMS.map(({ key, icon: Icon, label }) => (
          <a
            key={key}
            href={appConfig.opinionsSection.profileLink}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            className="stat-link group flex items-center gap-1.5"
          >
            <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
              <span
                className="stat-ping pointer-events-none absolute inset-0 rounded-full border border-primary-400"
                aria-hidden="true"
              />
              <Icon
                className="stat-icon size-4 shrink-0"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </span>
            <span
              className="tabular-nums transition-colors duration-300 ease-in-out group-hover:text-white"
              translate="no"
            >
              {countFormatter.format(stats.breakdown[key])}
            </span>
            <span className="sr-only">{label}</span>
          </a>
        ))}
      </div>
    </section>
  );
};

export { TestimonialsWidget };
