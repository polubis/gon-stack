import { About } from './about';
import { Footer } from './footer';
import { Hero } from './hero';
import { Navbar } from './navbar';
import { Offer } from './offer';
import { OnlineBookingCta } from './online-booking-cta';
import { Testimonials } from './testimonials';

export const Main = () => (
  <>
    <Navbar />
    <main data-e2e="home:main">
      <Hero />
      <Testimonials />
      <About />
      <Offer />
      <OnlineBookingCta />
    </main>
    <Footer />
  </>
);
