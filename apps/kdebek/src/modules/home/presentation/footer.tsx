import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  CalendarPlus,
  ChevronRight,
  Heart,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

import { copy } from './copy';
import { GreenOnLogo } from './green-on-logo';
import { LogoMark } from './logo-mark';
import {
  BOOKING_URL,
  FACEBOOK_URL,
  GOOGLE_REVIEWS_URL,
  GREENON_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  MAILTO_URL,
  PHONE_URL,
  YOUTUBE_URL,
} from './links';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from './social-icons';

const socialIcons: Record<string, LucideIcon> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
};

const socialUrls: Record<string, string> = {
  facebook: FACEBOOK_URL,
  instagram: INSTAGRAM_URL,
  linkedin: LINKEDIN_URL,
  youtube: YOUTUBE_URL,
};

type ContactBlockId = keyof typeof copy.footer.contactBlocks;

const contactBlockIcons: Record<ContactBlockId, LucideIcon> = {
  booking: CalendarPlus,
  email: Mail,
  phone: Phone,
  location: MapPin,
};

const ContactCard = ({ id }: { id: ContactBlockId }) => {
  const Icon = contactBlockIcons[id];
  const block = copy.footer.contactBlocks[id];

  return (
    <div className="min-w-0">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <Icon className="h-5 w-5 shrink-0" />
      </span>
      <h3 className="mt-3 font-semibold text-secondary">{block.title}</h3>
      <div className="mt-1 space-y-1">
        {id === 'booking' && (
          <>
            <p className="text-sm text-ink-light">
              {copy.footer.contactBlocks.booking.description}
            </p>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              {copy.footer.contactBlocks.booking.linkLabel}
              <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
          </>
        )}
        {id === 'email' && (
          <>
            <p className="text-sm text-ink-light">
              {copy.footer.contactBlocks.email.address}
            </p>
            <a
              href={MAILTO_URL}
              className="mt-2 block text-sm font-medium leading-snug text-primary"
            >
              {copy.footer.contactBlocks.email.linkLine1}
              <br />
              {copy.footer.contactBlocks.email.linkLine2}
            </a>
          </>
        )}
        {id === 'phone' && (
          <a href={PHONE_URL} className="text-sm font-medium text-primary">
            {copy.footer.contactBlocks.phone.number}
          </a>
        )}
        {id === 'location' && (
          <>
            <p className="text-sm text-ink-light">
              {copy.footer.contactBlocks.location.line1}
            </p>
            <p className="text-sm text-ink-light">
              {copy.footer.contactBlocks.location.line2}
            </p>
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              {copy.footer.contactBlocks.location.linkLabel}
              <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
          </>
        )}
      </div>
    </div>
  );
};

const contactBlockIds: ContactBlockId[] = [
  'booking',
  'email',
  'phone',
  'location',
];

export const Footer = () => (
  <footer
    id="kontakt"
    className="scroll-mt-28 bg-footer px-4 py-6 sm:px-6 sm:py-8"
  >
    <div className="mx-auto max-w-7xl rounded-3xl bg-white px-6 py-10 shadow-sm sm:px-8 lg:px-10">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[minmax(0,1.35fr)_repeat(4,minmax(0,1fr))] xl:gap-x-8 xl:gap-y-0">
        <div className="min-w-0 sm:col-span-2 lg:col-span-4 xl:col-span-1">
          <a href="/" className="flex items-center gap-2">
            <LogoMark className="h-7 w-9 shrink-0" />
            <span className="flex flex-col gap-0.5">
              <span className="font-display text-2xl italic leading-tight text-secondary">
                {copy.footer.brandName}
              </span>
              <span className="text-2xs font-semibold leading-tight tracking-[0.2em] text-ink-light">
                {copy.footer.brandTag}
              </span>
            </span>
          </a>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-light">
            {copy.footer.description}
          </p>
          <div className="mt-5 flex items-center gap-3">
            {copy.footer.socialLinks.map(({ id, label }) => {
              const Icon = socialIcons[id];

              return (
                <a
                  key={id}
                  href={socialUrls[id]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink-light"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                </a>
              );
            })}
          </div>
        </div>

        {contactBlockIds.map((id) => (
          <ContactCard key={id} id={id} />
        ))}
      </div>

      <div className="my-10 h-px bg-line" />

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_17.5rem] xl:items-start xl:gap-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
          {copy.footer.linkColumns.map(({ id, title, links }) => (
            <div key={id} className="min-w-0">
              <p className="font-semibold text-secondary">{title}</p>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => {
                  const href = link.href ?? BOOKING_URL;
                  const isExternal = href !== '#' && !href.startsWith('/');

                  return (
                    <li key={link.label}>
                      <a
                        href={href}
                        {...(isExternal && {
                          target: '_blank',
                          rel: 'noopener noreferrer',
                        })}
                        className="flex items-start gap-1.5 text-sm leading-snug text-ink-light"
                      >
                        <ChevronRight
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl bg-surface p-6 text-center ring-1 ring-line xl:mx-0 xl:max-w-none xl:self-start">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm">
            <CalendarPlus className="h-6 w-6 shrink-0" />
          </span>
          <p className="font-display text-lg font-bold text-secondary">
            {copy.footer.bookingCard.title}
          </p>
          <p className="text-sm leading-relaxed text-ink-light">
            {copy.footer.bookingCard.description}
          </p>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block w-full rounded-xl bg-primary-dark px-4 py-3 text-center text-xs font-bold text-white"
          >
            {copy.footer.bookingCard.cta}
          </a>
        </div>
      </div>

      <div className="my-10 h-px bg-line" />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start gap-4 text-left text-sm text-ink-light lg:flex-row lg:items-center lg:justify-between">
          <p>
            {copy.footer.copyrightPrefix} {new Date().getFullYear()}{' '}
            {copy.footer.copyrightSuffix}
          </p>
          <p className="flex items-start gap-1.5">
            <Heart
              className="h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            {copy.footer.madeWith}
          </p>
        </div>

        <div className="flex justify-end">
          <a
            href={GREENON_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={copy.footer.poweredByAriaLabel}
            className="rounded text-secondary outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <GreenOnLogo height={72} className="shrink-0" />
          </a>
        </div>
      </div>
    </div>
  </footer>
);
