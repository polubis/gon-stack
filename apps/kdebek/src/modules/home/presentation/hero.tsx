import { Calendar, Info, Quote, ShieldCheck } from 'lucide-react';
import { BookingWidget } from './booking-widget';
import { images } from './images';
import { BOOKING_URL } from './links';
import { ServicesGrid } from './services-grid';

export const Hero = () => (
  <section className="relative">
    <div className="relative overflow-hidden">
      <div
        className="absolute left-6 top-10 h-24 w-24 opacity-40 sm:left-10"
        // px required: background-image/background-size can't be expressed with Tailwind's spacing scale.
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--color-dot-grid) 1.5px, transparent 1.5px)',
          backgroundSize: '12px 12px',
        }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-24 pt-16 md:pb-10 lg:grid-cols-2 lg:pb-32 lg:pt-20">
        <div className="relative z-10">
          <p className="text-xs font-bold tracking-[0.2em] text-primary">
            ZDROWIE &nbsp;•&nbsp; RUCH &nbsp;•&nbsp; LEPSZA JAKOŚĆ ŻYCIA
          </p>
          <h1
            data-e2e="home:hero-heading"
            className="mt-4 font-display text-4xl font-bold leading-[1.15] text-secondary sm:text-5xl"
          >
            Profesjonalna fizjoterapia
            <br />
            <span className="text-primary">dopasowana do Ciebie</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-light">
            Pomagam wrócić do sprawności, złagodzić ból i zapobiegać kontuzjom.
            Indywidualne podejście, skuteczne metody, realne efekty.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold uppercase text-white shadow-sm sm:w-auto sm:justify-start"
            >
              <Calendar className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              Umów się
            </a>
            <a
              href="#o-mnie"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary px-5 py-3 text-sm font-bold uppercase text-primary sm:w-auto sm:justify-start"
            >
              <Info className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              Więcej
            </a>
          </div>

          <p className="mt-6 flex items-start gap-2 text-sm text-ink-light">
            <ShieldCheck
              className="h-4.5 w-4.5 shrink-0 text-primary"
              aria-hidden="true"
            />
            Bezpiecznie &nbsp;•&nbsp; Skutecznie &nbsp;•&nbsp; Z myślą o Tobie
          </p>
        </div>

        <div className="relative z-10">
          <div className="w-full overflow-hidden rounded-[3rem] shadow-md">
            <img
              src={images.hero}
              alt="Kacper Dębek — fizjoterapeuta"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="block w-full h-auto rounded-[3rem]"
            />
          </div>

          <div className="-mt-10 flex justify-center md:-mt-24 lg:hidden">
            <BookingWidget className="max-w-none md:max-w-lg" />
          </div>
        </div>
      </div>
    </div>

    <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 lg:pb-28">
      <div className="lg:max-w-[58%]">
        <ServicesGrid />

        <blockquote className="mt-10 flex items-start gap-4 rounded-2xl bg-surface px-6 py-5 ring-1 ring-line">
          <Quote className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
          <p className="font-display text-base italic text-secondary">
            Twoje ciało zasługuje na najlepszą opiekę. Razem osiągniemy Twój
            cel.
          </p>
        </blockquote>
      </div>
    </div>

    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto hidden max-w-7xl px-6 lg:block">
      <div className="pointer-events-auto absolute right-6 top-[26rem] w-full max-w-sm">
        <BookingWidget />
      </div>
    </div>
  </section>
);
