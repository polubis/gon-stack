import { useState } from 'react';
import {
  ArrowRight,
  Building2,
  Calendar,
  ChevronDown,
  HeartPulse,
  Sparkles,
  User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';

import { copy } from './copy';
import { BOOKING_URL } from './links';

type OfferTab = 'private' | 'company';

type OfferVariant = {
  id: string;
  name: string;
  price: string;
  duration: string;
};

type OfferServiceContent = {
  id: string;
  title: string;
  description: string;
  price: string;
  body?: string[];
  variants?: OfferVariant[];
  details?: string[];
  videoUrl?: string;
  videoTitle?: string;
};

type OfferService = OfferServiceContent & { icon: LucideIcon };

const privateServiceIcons: Record<string, LucideIcon> = {
  'therapeutic-massage': HeartPulse,
  'classic-massage': Sparkles,
};

const companyServiceIcons: Record<string, LucideIcon> = {
  'office-massage': Building2,
};

const privateServices: OfferService[] = copy.offerWidget.privateServices.map(
  (service) => ({ ...service, icon: privateServiceIcons[service.id] }),
);

const companyServices: OfferService[] = copy.offerWidget.companyServices.map(
  (service) => ({ ...service, icon: companyServiceIcons[service.id] }),
);

const tabIcons: Record<OfferTab, LucideIcon> = {
  private: User,
  company: Building2,
};

const ServiceRow = ({
  service,
  isOpen,
  onToggle,
}: {
  service: OfferService;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const Icon = service.icon;

  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={`${
          isOpen
            ? copy.offerWidget.ariaCollapsePrefix
            : copy.offerWidget.ariaExpandPrefix
        } ${service.title}`}
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5"
      >
        <span
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <Icon className="h-5 w-5 shrink-0" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <span>
              <span className="block font-semibold text-secondary">
                {service.title}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-light">
                {service.description}
              </span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-secondary sm:text-right">
              {service.price}
            </span>
          </span>
        </span>

        <ChevronDown
          className={cn(
            'mt-1 h-5 w-5 shrink-0 text-ink-light transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="border-t border-line bg-surface/60 pb-4 pt-3">
          <div className="flex gap-3 px-4 sm:gap-4 sm:px-5">
            <span className="w-10 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1 space-y-4">
              {service.body && service.body.length > 0 && (
                <div className="space-y-3">
                  {service.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm leading-relaxed text-ink-light"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {service.variants && service.variants.length > 0 && (
                <ul className="divide-y divide-line">
                  {service.variants.map(({ id, name, price, duration }) => (
                    <li
                      key={id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="text-sm leading-snug text-secondary">
                        {name}
                      </span>
                      <span className="text-right text-sm whitespace-nowrap">
                        <span className="block font-semibold text-secondary">
                          {price}
                        </span>
                        <span className="text-ink-light">{duration}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {service.videoUrl && (
                <div className="overflow-hidden rounded-xl ring-1 ring-line">
                  <div className="relative aspect-video">
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={service.videoUrl}
                      title={service.videoTitle ?? service.title}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {service.details && service.details.length > 0 && (
                <ul className="space-y-2">
                  {service.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-2 text-sm text-ink-light"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {detail}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex justify-end">
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold tracking-wide text-white"
                >
                  <Calendar
                    className="h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  {copy.offerWidget.ctaBook}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const OfferWidget = ({ id }: { id?: string }) => {
  const [activeTab, setActiveTab] = useState<OfferTab>('private');
  const [openService, setOpenService] = useState<string | null>(
    privateServices[0]?.id ?? null,
  );

  const services = activeTab === 'private' ? privateServices : companyServices;

  const handleTabChange = (tab: OfferTab) => {
    setActiveTab(tab);
    const nextServices = tab === 'private' ? privateServices : companyServices;
    setOpenService(nextServices[0]?.id ?? null);
  };

  return (
    <div
      id={id}
      className={cn(
        'overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-line',
        id && 'scroll-mt-28',
      )}
    >
      <div className="border-b border-line p-3 sm:p-4">
        <div
          role="tablist"
          aria-label={copy.offerWidget.ariaTablist}
          className="flex flex-col gap-2 sm:flex-row"
        >
          {copy.offerWidget.tabs.map(({ id: tabId, label }) => {
            const isActive = activeTab === tabId;
            const TabIcon = tabIcons[tabId as OfferTab];

            return (
              <button
                key={tabId}
                id={`offer-tab-${tabId}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="offer-tabpanel"
                onClick={() => handleTabChange(tabId as OfferTab)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold tracking-wide sm:text-2xs',
                  isActive
                    ? 'bg-primary text-white'
                    : 'border border-line bg-white text-primary',
                )}
              >
                <TabIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="uppercase">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="offer-tabpanel"
        role="tabpanel"
        aria-labelledby={`offer-tab-${activeTab}`}
        tabIndex={0}
      >
        {services.map((service) => (
          <ServiceRow
            key={service.id}
            service={service}
            isOpen={openService === service.id}
            onToggle={() =>
              setOpenService((current) =>
                current === service.id ? null : service.id,
              )
            }
          />
        ))}

        <div className="border-t border-line px-4 py-4 sm:px-5">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            {copy.offerWidget.ctaAllServices}
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
};
