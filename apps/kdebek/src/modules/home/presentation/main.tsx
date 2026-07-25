import type { HomeImages } from '../domain/models';

import { About } from './about';
import { Footer } from './footer';
import { Hero } from './hero';
import { Navbar } from './navbar';
import { Offer } from './offer';
import { OnlineBookingCta } from './online-booking-cta';
import { Testimonials } from './testimonials';

type MainProps = {
  images: HomeImages;
};

export const Main = ({ images }: MainProps) => (
  <>
    <Navbar />
    <main data-e2e="home:main">
      <Hero image={images.hero} />
      <Testimonials image={images.therapy} />
      <About galleryImages={images.gallery} />
      <Offer />
      <OnlineBookingCta />
    </main>
    <Footer />
  </>
);
