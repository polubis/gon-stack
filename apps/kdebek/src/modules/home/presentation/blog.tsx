import { ArrowRight, Calendar, FileText, Lock, Mail } from 'lucide-react';

const posts = [
  {
    tag: 'BÓL KRĘGOSŁUPA',
    title: 'Ból karku przy pracy biurowej – przyczyny i ćwiczenia',
    excerpt:
      'Sprawdź, skąd bierze się ból karku przy pracy siedzącej i poznaj 5 prostych ćwiczeń, które przyniosą ulgę.',
    date: '14 maja 2024',
    image:
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop',
  },
  {
    tag: 'KOLANO',
    title: 'Rehabilitacja po urazie kolana – jak wygląda i ile trwa?',
    excerpt:
      'Dowiedz się, jak przebiega rehabilitacja po urazie kolana, jakie są etapy i od czego zależy czas powrotu do sprawności.',
    date: '7 maja 2024',
    image:
      'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?q=80&w=800&auto=format&fit=crop',
  },
  {
    tag: 'ĆWICZENIA',
    title: 'Jak zadbać o kręgosłup na co dzień? 7 prostych zasad',
    excerpt:
      'Poznaj 7 zasad, które pomogą Ci zadbać o zdrowy kręgosłup, poprawić postawę i zapobiegać bólowi na co dzień.',
    date: '28 kwietnia 2024',
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop',
  },
];

const Blog = () => (
  <section className="bg-surface py-20">
    <div className="mx-auto max-w-7xl px-6">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div>
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

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map(({ tag, title, excerpt, date, image }) => (
              <article
                key={title}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line"
              >
                <div className="relative aspect-[4/3] bg-slate-200">
                  <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">
                    {tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold leading-snug text-secondary">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-light">
                    {excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-ink-light">
                      <Calendar className="h-3.5 w-3.5" />
                      {date}
                    </span>
                    <a
                      href="#"
                      className="flex items-center gap-1 font-medium text-primary"
                    >
                      Czytaj więcej
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <a
              href="#"
              className="flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              Zobacz wszystkie artykuły
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-line">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </span>
          <h3 className="mt-4 font-display text-xl font-bold text-secondary">
            Bądź na bieżąco
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-light">
            Zapisz się do newslettera i otrzymuj praktyczne porady oraz
            informacje o nowych wpisach.
          </p>

          <label className="mt-5 flex w-full items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm text-ink-light">
            <Mail className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="email"
              placeholder="Twój adres e-mail"
              className="w-full bg-transparent outline-none placeholder:text-ink-light"
            />
          </label>

          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-dark"
          >
            ZAPISZ SIĘ
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-light">
            <Lock className="h-3.5 w-3.5" />
            Nie wysyłamy spamu. Możesz wypisać się w każdej chwili.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export { Blog };
