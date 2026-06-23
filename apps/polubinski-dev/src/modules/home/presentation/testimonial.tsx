import type { Testimonial as TestimonialData } from '../domain/models';

type TestimonialProps = TestimonialData & {
  className?: string;
  contentClassName?: string;
};

const Testimonial = ({
  content,
  avatar,
  name,
  position,
  className,
  contentClassName,
}: TestimonialProps) => {
  return (
    <figure className={className}>
      <blockquote>
        <svg
          width="21"
          height="15"
          viewBox="0 0 21 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M0 14.04V5.72C0 3.92364 0.488485 2.52121 1.46546 1.51273C2.44242 0.504242 3.86061 0 5.72 0H7.89455V3.26182H6.09818C5.27879 3.26182 4.64848 3.48242 4.20727 3.92364C3.76606 4.36485 3.54545 4.99515 3.54545 5.81455V7.65818H6.42909V14.04H0ZM12.6691 14.04V5.72C12.6691 3.92364 13.1576 2.52121 14.1345 1.51273C15.1115 0.504242 16.5297 0 18.3891 0H20.5636V3.26182H18.7673C17.9479 3.26182 17.3176 3.48242 16.8764 3.92364C16.4352 4.36485 16.2145 4.99515 16.2145 5.81455V7.65818H19.0982V14.04H12.6691Z"
            className="fill-foreground"
          />
        </svg>
        <p
          className={`text-regular font-400 mt-6 ${contentClassName ?? ''}`.trim()}
        >
          {content}
        </p>
      </blockquote>
      <figcaption className="flex items-center gap-5 mt-6">
        {avatar?.url ? (
          <img
            className="rounded-full w-12 h-12 object-cover"
            src={avatar.url}
            alt={avatar.alt}
            title={avatar.title}
            width={48}
            height={48}
            loading="lazy"
          />
        ) : (
          <div
            className="avatar-placeholder-neon rounded-full w-12 h-12 flex items-center justify-center text-primary-400 font-medium shrink-0 text-[length:var(--text-regular)]"
            aria-hidden
          >
            {name ? name.charAt(0).toUpperCase() : '?'}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <cite className="text-regular-bold font-400 not-italic">{name}</cite>
          {position && <span className="text-small font-400">{position}</span>}
        </div>
      </figcaption>
    </figure>
  );
};

export type { TestimonialProps };
export { Testimonial };
