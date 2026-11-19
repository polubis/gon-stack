import { copy, reviewSources } from './copy';
import {
  BOOKING_URL,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  FACEBOOK_URL,
  GOOGLE_REVIEWS_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  YOUTUBE_URL,
} from './links';

const SCHEMA_DAY: Record<string, string> = {
  monday: 'https://schema.org/Monday',
  tuesday: 'https://schema.org/Tuesday',
  wednesday: 'https://schema.org/Wednesday',
  thursday: 'https://schema.org/Thursday',
  friday: 'https://schema.org/Friday',
  saturday: 'https://schema.org/Saturday',
  sunday: 'https://schema.org/Sunday',
};

const toPlnAmount = (price: string) =>
  Number.parseFloat(price.replace(/[^\d,.]/g, '').replace(',', '.'));

const openingHoursSpecification = copy.offerPanel.openingHours.days.flatMap(
  (day) => {
    if (day.closed || day.slots.length === 0) return [];

    return day.slots.map((slot) => {
      const [opens, closes] = slot.split(' - ');

      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: SCHEMA_DAY[day.id],
        opens,
        closes,
      };
    });
  },
);

const combinedReviewCount = reviewSources.reduce(
  (total, source) => total + Number.parseInt(source.reviewsCountLabel, 10),
  0,
);

const buildOffers = (services: typeof copy.offerWidget.privateServices) =>
  services.flatMap((service) =>
    (service.variants ?? []).map((variant) => ({
      '@type': 'Offer',
      name: variant.name,
      price: toPlnAmount(variant.price),
      priceCurrency: 'PLN',
      availability: 'https://schema.org/InStock',
      url: BOOKING_URL,
    })),
  );

export const buildHomeJsonLd = (domain: string) => {
  const siteUrl = `${domain}/`;
  const businessId = `${siteUrl}#business`;
  const personId = `${siteUrl}#person`;

  const localBusiness = {
    '@type': ['LocalBusiness', 'HealthAndBeautyBusiness'],
    '@id': businessId,
    name: copy.footer.brandName,
    description: copy.footer.description,
    url: siteUrl,
    telephone: CONTACT_PHONE,
    email: CONTACT_EMAIL,
    priceRange: '80–150 PLN',
    image: `${domain}/og.webp`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: copy.footer.contactBlocks.location.line1,
      addressLocality: 'Olsztyn',
      postalCode: '10-080',
      addressCountry: 'PL',
    },
    hasMap: GOOGLE_REVIEWS_URL,
    openingHoursSpecification,
    sameAs: [
      FACEBOOK_URL,
      INSTAGRAM_URL,
      LINKEDIN_URL,
      YOUTUBE_URL,
      GOOGLE_REVIEWS_URL,
      BOOKING_URL,
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      bestRating: '5',
      reviewCount: combinedReviewCount,
    },
    employee: { '@id': personId },
  };

  const person = {
    '@type': 'Person',
    '@id': personId,
    name: copy.footer.brandName,
    jobTitle: 'Technik masażysta',
    worksFor: { '@id': businessId },
    image: `${domain}/og.webp`,
    sameAs: [FACEBOOK_URL, INSTAGRAM_URL, LINKEDIN_URL, YOUTUBE_URL],
  };

  const services = copy.servicesGrid.items.map((item) => {
    const offers = buildOffers(
      copy.offerWidget.privateServices.filter(
        (service) => service.id === item.id,
      ),
    );

    return {
      '@type': 'Service',
      name: item.title,
      description: item.description,
      provider: { '@id': businessId },
      areaServed: {
        '@type': 'City',
        name: 'Olsztyn',
      },
      ...(offers.length > 0 && { offers }),
    };
  });

  const website = {
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    url: siteUrl,
    name: copy.meta.siteName,
    inLanguage: 'pl-PL',
    publisher: { '@id': businessId },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [localBusiness, person, website, ...services],
  };
};
