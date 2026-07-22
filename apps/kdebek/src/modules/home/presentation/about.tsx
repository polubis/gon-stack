import {
  Award,
  BookOpen,
  FileText,
  Heart,
  Quote,
  Star,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { AboutGallery } from './about-gallery';
import { Counter } from './counter';
import { copy } from './copy';

const credentialIcons: Record<string, LucideIcon> = {
  experience: FileText,
  specializations: Target,
  approach: Heart,
};

const statIcons: Record<string, LucideIcon> = {
  clients: Users,
  visits: FileText,
  'google-rating': Star,
  'booksy-rating': Star,
  years: Award,
  courses: BookOpen,
};

export const About = () => (
  <section id="o-mnie" className="scroll-mt-28 bg-white py-20">
    <div className="mx-auto max-w-7xl px-6">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-primary">
            {copy.about.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-secondary sm:text-4xl">
            {copy.about.headingLine1}
            <br />
            {copy.about.headingLine2}
          </h2>
          <div className="mt-4 max-w-md space-y-3">
            {copy.about.introParagraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-sm leading-relaxed text-ink-light"
              >
                {paragraph}
              </p>
            ))}
          </div>
          <span className="mt-5 block h-0.5 w-10 bg-primary" />

          <ul className="mt-6 divide-y divide-line list-none p-0">
            {copy.about.credentials.map(({ id, title, description }) => {
              const Icon = credentialIcons[id];

              return (
                <li key={id} className="flex gap-4 py-4 first:pt-0">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-secondary">{title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-light">
                      {description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <blockquote className="mt-6 flex items-start gap-3">
            <Quote
              className="h-6 w-6 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="font-display text-base italic leading-snug text-secondary">
              {copy.about.quote}
            </p>
          </blockquote>
        </div>

        <AboutGallery />
      </div>
    </div>

    <div className="mx-auto mt-16 max-w-7xl px-6">
      <dl className="grid grid-cols-2 gap-8 rounded-3xl bg-surface px-8 py-10 ring-1 ring-line sm:grid-cols-3 lg:grid-cols-7 lg:gap-4">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <dt className="flex items-center gap-2">
            <Users
              className="h-6 w-6 shrink-0 text-ink-light"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-secondary">
              {copy.about.statsTitle}
            </span>
          </dt>
          <dd className="mt-0.5 text-xs leading-relaxed text-ink-light">
            {copy.about.statsDescription}
          </dd>
        </div>
        {copy.about.stats.map((stat) => {
          const { id, value, suffix, label } = stat;
          const decimals = 'decimals' in stat ? stat.decimals : undefined;
          const Icon = statIcons[id];

          return (
            <div key={id}>
              <dt className="flex items-center gap-2">
                <Icon
                  className="h-6 w-6 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span className="sr-only">{label}</span>
              </dt>
              <dd className="mt-2 font-display text-2xl font-bold text-secondary">
                <Counter value={value} decimals={decimals} suffix={suffix} />
              </dd>
              <dd
                aria-hidden="true"
                className="mt-0.5 whitespace-nowrap text-xs leading-relaxed text-ink-light"
              >
                {label}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  </section>
);
