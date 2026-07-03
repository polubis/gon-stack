import { About } from './about';
import { Blog } from './blog';
import { Footer } from './footer';
import { Hero } from './hero';
import { Navbar } from './navbar';
import { Offer } from './offer';
import { OnlineBookingCta } from './online-booking-cta';
import { Testimonials } from './testimonials';

const Main = () => (
  <>
    <Navbar />
    <Hero />
    <Testimonials />
    <OnlineBookingCta />
    <About />
    <Blog />
    <Offer />
    <Footer />
  </>
);

export { Main };
