import { Quote, Star } from 'lucide-react';

import { copy } from './copy';
import { images } from './images';
import { BOOKING_URL, GOOGLE_REVIEWS_URL } from './links';

const reviewUrls = {
  google: GOOGLE_REVIEWS_URL,
  booksy: BOOKING_URL,
} as const;

const Stars = () => (
  <div className="flex gap-0.5 text-rating" aria-hidden="true">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="h-4 w-4 shrink-0 fill-current" />
    ))}
  </div>
);

const RatingSource = ({
  name,
  ratingValue,
  reviewsCountLabel,
  url,
}: {
  name: string;
  ratingValue: string;
  reviewsCountLabel: string;
  url: string;
}) => (
  <div className="text-right">
    <p className="flex items-center justify-end gap-1.5 text-2xl font-bold text-secondary">
      <Star
        className="h-5 w-5 shrink-0 fill-current text-rating"
        aria-hidden="true"
      />
      {ratingValue}
    </p>
    <p className="text-sm text-ink-light">{name}</p>
    <div className="mt-2 flex justify-end">
      <Stars />
    </div>
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 inline-block text-sm text-ink-light underline"
    >
      {reviewsCountLabel}
    </a>
  </div>
);

export const Testimonials = () => (
  <section className="mx-auto max-w-7xl px-6 py-20">
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <p className="text-xs font-bold tracking-[0.2em] text-primary">
          {copy.testimonials.eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-secondary sm:text-4xl">
          {copy.testimonials.heading}
        </h2>
        <p className="mt-3 max-w-lg text-ink-light">
          {copy.testimonials.subheading}
        </p>
      </div>

      <div className="flex items-start justify-end gap-6 sm:gap-8">
        {copy.testimonials.sources.map(
          ({ id, name, ratingValue, reviewsCountLabel }) => (
            <RatingSource
              key={id}
              name={name}
              ratingValue={ratingValue}
              reviewsCountLabel={reviewsCountLabel}
              url={reviewUrls[id as keyof typeof reviewUrls]}
            />
          ),
        )}
      </div>
    </div>

    <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-stretch">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {copy.testimonials.items.map(
          ({ id, name, subtitle, text, initials }) => (
            <article
              key={id}
              className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line"
            >
              <div
                className="flex items-start justify-between"
                aria-hidden="true"
              >
                <Stars />
                <Quote className="h-6 w-6 shrink-0 text-line" />
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-light">
                {text}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
                >
                  {initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-secondary">{name}</p>
                  <p className="text-xs text-ink-light">{subtitle}</p>
                </div>
              </div>
            </article>
          ),
        )}
      </div>

      <div className="relative aspect-[4/3] min-h-0 overflow-hidden rounded-3xl lg:aspect-auto lg:h-full">
        <img
          src={images.testimonials.therapy}
          alt={copy.testimonials.imageAlt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </div>
    </div>
  </section>
);
