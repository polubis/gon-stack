export const images = {
  hero: '/images/hero.jpg',
  about: {
    gallery: [
      {
        src: '/images/about-posty/03.jpg',
        alt: 'Kacper Dębek — Biuro Masażu',
      },
      {
        src: '/images/about-posty/04.jpg',
        alt: 'Ćwiczenia rehabilitacyjne',
      },
      {
        src: '/images/about-posty/05.jpg',
        alt: 'Kacper Dębek w gabinecie',
      },
      {
        src: '/images/about-posty/06.jpg',
        alt: 'Sesja fizjoterapeutyczna',
      },
    ],
  },
  testimonials: {
    therapy: '/images/testimonials-therapy.jpg',
  },
  blog: {
    neckPain: '/images/blog-neck-pain.jpg',
    kneeRehab: '/images/blog-knee-rehab.jpg',
    spineCare: '/images/blog-spine-care.jpg',
    massage: '/images/about-massage.jpg',
  },
} as const;
