import { ArrowRight, Calendar, FileText, Lock, Mail } from 'lucide-react';

import { images } from './images';

const posts = [
  {
    tag: 'BÓL KRĘGOSŁUPA',
    title: 'Ból karku przy pracy biurowej – przyczyny i ćwiczenia',
    excerpt:
      'Sprawdź, skąd bierze się ból karku przy pracy siedzącej i poznaj 5 prostych ćwiczeń, które przyniosą ulgę.',
    date: '14 maja 2024',
    image: images.blog.neckPain,
  },
  {
    tag: 'KOLANO',
    title: 'Rehabilitacja po urazie kolana – jak wygląda i ile trwa?',
    excerpt:
      'Dowiedz się, jak przebiega rehabilitacja po urazie kolana, jakie są etapy i od czego zależy czas powrotu do sprawności.',
    date: '7 maja 2024',
    image: images.blog.kneeRehab,
  },
  {
    tag: 'ĆWICZENIA',
    title: 'Jak zadbać o kręgosłup na co dzień? 7 prostych zasad',
    excerpt:
      'Poznaj 7 zasad, które pomogą Ci zadbać o zdrowy kręgosłup, poprawić postawę i zapobiegać bólowi na co dzień.',
    date: '28 kwietnia 2024',
    image: images.blog.spineCare,
  },
  {
    tag: 'MASAŻ',
    title: 'Masaż leczniczy – kiedy warto się na niego zdecydować?',
    excerpt:
      'Poznaj wskazania do masażu leczniczego, różnice względem relaksacyjnego i to, czego możesz oczekiwać po pierwszej wizycie.',
    date: '21 kwietnia 2024',
    image: images.blog.massage,
  },
];

export const Blog = () => (
  <section id="blog" className="scroll-mt-28 bg-surface py-20">
    <div className="mx-auto max-w-7xl px-6">
      <p className="text-xs font-bold tracking-[0.2em] text-primary">
        PORADY I WIEDZA
      </p>
      <h2 className="mt-3 font-display text-3xl font-bold text-secondary sm:text-4xl">
        Blog fizjoterapeutyczny
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-light">
        Praktyczna wiedza, ćwiczenia i wskazówki, które pomogą Ci zadbać o
        zdrowie na co dzień.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-stretch">
        <div className="order-1 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-start-1 lg:row-start-1 lg:flex lg:flex-col">
          {posts.map(({ tag, title, excerpt, date, image }) => (
            <article
              key={title}
              className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line lg:flex-row"
            >
              <div className="relative shrink-0 overflow-hidden lg:w-44 lg:self-stretch xl:w-52">
                <img
                  src={image}
                  alt={title}
                  className="block h-auto w-full object-cover lg:absolute lg:inset-0 lg:h-full"
                />
                <span
                  className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-2xs font-bold tracking-wide text-white"
                  aria-hidden="true"
                >
                  {tag}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5 lg:py-4 lg:pr-5">
                <h3 className="font-semibold leading-snug text-secondary">
                  {title}
                </h3>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-light lg:line-clamp-2">
                  {excerpt}
                </p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-4 text-xs">
                  <span className="flex items-center gap-1.5 text-ink-light">
                    <Calendar
                      className="h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {date}
                  </span>
                  <a
                    href="#"
                    className="flex shrink-0 items-center gap-1 font-medium text-primary"
                  >
                    Czytaj
                    <ArrowRight
                      className="h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="order-3 mx-auto flex w-full max-w-sm sm:max-w-md md:max-w-lg lg:order-2 lg:col-start-2 lg:row-start-1 lg:max-w-none lg:self-stretch">
          <div className="flex w-full flex-col items-center justify-center rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-line sm:p-8">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10"
              aria-hidden="true"
            >
              <FileText className="h-6 w-6 shrink-0 text-primary" />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold text-secondary">
              Bądź na bieżąco
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-light">
              Zapisz się do newslettera i otrzymuj praktyczne porady oraz
              informacje o nowych wpisach.
            </p>

            <label
              htmlFor="newsletter-email"
              className="mt-5 flex w-full items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm text-ink-light"
            >
              <Mail
                className="h-4 w-4 shrink-0 text-ink-light"
                aria-hidden="true"
              />
              <input
                id="newsletter-email"
                type="email"
                placeholder="Twój adres e-mail"
                className="w-full bg-transparent outline-none placeholder:text-ink-light"
                required
              />
            </label>

            <button
              type="button"
              className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white"
            >
              ZAPISZ SIĘ
            </button>

            <p className="mt-3 flex w-full items-start justify-start gap-1.5 text-left text-xs text-ink-light">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Nie wysyłamy spamu. Możesz wypisać się w każdej chwili.
            </p>
          </div>
        </div>

        <div className="order-2 flex justify-start lg:order-3 lg:col-start-1 lg:row-start-2">
          <a
            href="#"
            className="flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            Zobacz wszystkie artykuły
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  </section>
);
