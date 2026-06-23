const MaterialsQualitySection = () => (
  <section
    className="fluid page-section isolate flex flex-col justify-center"
    aria-labelledby="materials-quality-heading"
  >
    <header className="mb-12 text-center">
      <h2 id="materials-quality-heading" className="text-h2 font-500 mb-4">
        Jakość Materiałów
      </h2>
      <p className="text-regular font-300 max-w-3xl mx-auto">
        Wszystkie materiały są starannie przygotowane i weryfikowane. Sprawdź
        metryki jakości, które gwarantują wysoką wartość edukacyjną.
      </p>
    </header>

    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
      role="list"
      aria-label="Metryki jakości materiałów"
    >
      <div
        className="flex flex-col items-center justify-start p-6 rounded-xl bg-gradient-to-br from-[#0a1410] to-[#050a08] border border-[#1a2520] relative overflow-hidden"
        role="listitem"
      >
        <div
          className="radial-flare size-24 -top-6 right-4"
          aria-hidden="true"
        />
        <div className="relative w-[160px] h-[160px] flex items-center justify-center">
          <svg
            className="gauge-glow absolute inset-0"
            width="160"
            height="160"
            viewBox="0 0 160 160"
            aria-hidden="true"
          >
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#1a2520"
              strokeWidth="8"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="url(#gradient-green)"
              strokeWidth="8"
              strokeLinecap="round"
              className="gauge-progress"
              style={
                {
                  ['--dash-array' as string]: '440',
                  ['--dash-offset' as string]: '44',
                } as React.CSSProperties
              }
              strokeDasharray="440"
              strokeDashoffset="440"
              transform="rotate(-90 80 80)"
            />
            <defs>
              <linearGradient
                id="gradient-green"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: '#0bad67', stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: '#0dd97d', stopOpacity: 1 }}
                />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex flex-col items-center justify-center z-10">
            <span className="text-h1 font-500 text-primary-400 leading-none">
              90
            </span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-h5 font-500 mb-2">Aktualność</h3>
          <p className="text-small text-foreground-secondary">
            Zgodne z najnowszymi standardami
          </p>
        </div>
      </div>

      <div
        className="flex flex-col items-center justify-start p-6 rounded-xl bg-gradient-to-br from-[#0a1410] to-[#050a08] border border-[#1a2520] relative overflow-hidden"
        role="listitem"
      >
        <div
          className="radial-flare size-24 -top-6 left-4"
          aria-hidden="true"
        />
        <div className="relative w-[160px] h-[120px] flex items-center justify-center">
          <svg
            className="gauge-glow absolute inset-0"
            width="160"
            height="120"
            viewBox="0 0 160 120"
            aria-hidden="true"
          >
            <path
              d="M 20 100 A 60 60 0 0 1 140 100"
              fill="none"
              stroke="#1a2520"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M 20 100 A 60 60 0 0 1 140 100"
              fill="none"
              stroke="url(#gradient-green-2)"
              strokeWidth="8"
              strokeLinecap="round"
              className="gauge-progress"
              style={
                {
                  ['--dash-array' as string]: '188',
                  ['--dash-offset' as string]: '20',
                } as React.CSSProperties
              }
              strokeDasharray="188"
              strokeDashoffset="188"
            />
            <defs>
              <linearGradient
                id="gradient-green-2"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: '#0bad67', stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: '#0dd97d', stopOpacity: 1 }}
                />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex flex-col items-center justify-center z-10 mt-16">
            <span className="text-h1 font-500 text-primary-400 leading-none">
              89
            </span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-h5 font-500 mb-2">Praktyczność</h3>
          <p className="text-small text-foreground-secondary">
            Kod testowany w realnych projektach
          </p>
        </div>
      </div>

      <div
        className="flex flex-col items-center justify-start p-6 rounded-xl bg-gradient-to-br from-[#0a1410] to-[#050a08] border border-[#1a2520] relative overflow-hidden"
        role="listitem"
      >
        <div
          className="radial-flare size-24 -bottom-6 right-4"
          aria-hidden="true"
        />
        <div className="relative w-[140px] h-[140px] flex items-center justify-center">
          <svg
            className="gauge-glow absolute inset-0"
            width="140"
            height="140"
            viewBox="0 0 140 140"
            aria-hidden="true"
          >
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke="#1a2520"
              strokeWidth="7"
            />
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke="url(#gradient-green-3)"
              strokeWidth="7"
              strokeLinecap="round"
              className="gauge-progress"
              style={
                {
                  ['--dash-array' as string]: '377',
                  ['--dash-offset' as string]: '38',
                } as React.CSSProperties
              }
              strokeDasharray="377"
              strokeDashoffset="377"
              transform="rotate(-90 70 70)"
            />
            <defs>
              <linearGradient
                id="gradient-green-3"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: '#0bad67', stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: '#0dd97d', stopOpacity: 1 }}
                />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex flex-col items-center justify-center z-10">
            <span className="text-h1 font-500 text-primary-400 leading-none">
              90
            </span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-h5 font-500 mb-2">Przystępność</h3>
          <p className="text-small text-foreground-secondary">
            Zrozumiałe dla każdego poziomu
          </p>
        </div>
      </div>

      <div
        className="flex flex-col items-center justify-start p-6 rounded-xl bg-gradient-to-br from-[#0a1410] to-[#050a08] border border-[#1a2520] relative overflow-hidden"
        role="listitem"
      >
        <div
          className="radial-flare size-24 -bottom-6 left-4"
          aria-hidden="true"
        />
        <div className="flex flex-col items-center justify-center w-[140px] h-[160px]">
          <svg
            className="gauge-glow"
            width="140"
            height="140"
            viewBox="0 0 140 140"
            aria-hidden="true"
          >
            <rect
              x="60"
              y="20"
              width="20"
              height="100"
              rx="10"
              fill="#1a2520"
            />
            <rect
              x="60"
              y="35"
              width="20"
              height="85"
              rx="10"
              fill="url(#gradient-vertical)"
            >
              <animate
                attributeName="height"
                from="0"
                to="85"
                dur="2s"
                fill="freeze"
                begin="0s"
              />
              <animate
                attributeName="y"
                from="120"
                to="35"
                dur="2s"
                fill="freeze"
                begin="0s"
              />
            </rect>
            <defs>
              <linearGradient
                id="gradient-vertical"
                x1="0%"
                y1="100%"
                x2="0%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: '#0bad67', stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: '#0dd97d', stopOpacity: 1 }}
                />
              </linearGradient>
            </defs>
          </svg>
          <div className="text-center mt-2">
            <span className="text-h1 font-500 text-primary-400 leading-none">
              85
            </span>
          </div>
        </div>
        <div className="mt-2 text-center">
          <h3 className="text-h5 font-500 mb-2">Kompletność</h3>
          <p className="text-small text-foreground-secondary">
            Wyczerpujące omówienie tematów
          </p>
        </div>
      </div>
    </div>

    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      role="list"
      aria-label="Dodatkowe metryki jakości"
    >
      {[
        {
          score: '90',
          stroke: '#0bad67',
          dashOffset: '20',
          label: 'Weryfikacja',
          desc: 'Wieloetapowy proces review',
        },
        {
          score: '86',
          stroke: '#0dd97d',
          dashOffset: '28',
          label: 'Feedback',
          desc: 'Reaguje na społeczność',
        },
        {
          score: '80',
          stroke: '#0bad67',
          dashOffset: '40',
          label: 'Dostępność',
          desc: 'Większość darmowa, część premium',
        },
        {
          score: '88',
          stroke: '#0dd97d',
          dashOffset: '24',
          label: 'Aktualizacje',
          desc: 'Regularna aktualizacja treści',
        },
      ].map(({ score, stroke, dashOffset, label, desc }) => (
        <div
          key={label}
          className="flex flex-col items-center justify-start p-4 rounded-xl bg-gradient-to-br from-[#0a1410] to-[#050a08] border border-[#1a2520] relative overflow-hidden"
          role="listitem"
        >
          <div className="relative w-[80px] h-[80px] flex items-center justify-center mb-2">
            <svg
              className="absolute inset-0"
              width="80"
              height="80"
              viewBox="0 0 80 80"
              aria-hidden="true"
            >
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="#1a2520"
                strokeWidth="5"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke={stroke}
                strokeWidth="5"
                strokeLinecap="round"
                className="gauge-progress"
                style={
                  {
                    ['--dash-array' as string]: '201',
                    ['--dash-offset' as string]: dashOffset,
                  } as React.CSSProperties
                }
                strokeDasharray="201"
                strokeDashoffset="201"
                transform="rotate(-90 40 40)"
              />
            </svg>
            <span className="text-h4 font-500 text-primary-400 z-10 leading-none">
              {score}
            </span>
          </div>
          <h4 className="text-regular-bold font-500 mb-1">{label}</h4>
          <p className="text-small text-foreground-secondary text-center">
            {desc}
          </p>
        </div>
      ))}
    </div>

    <div className="mt-16">
      <div className="text-center mb-12">
        <h3 className="text-h2 font-500">Jak mierzę te metryki?</h3>
        <p className="text-regular font-300 text-foreground-secondary mt-6 max-w-2xl mx-auto">
          Zautomatyzowany proces weryfikacji, który działa nieprzerwanie i
          zapewnia najwyższą jakość materiałów.
        </p>
      </div>

      <div className="relative">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="radial-flare size-56 -top-10 left-[8%]" />
          <div className="radial-flare size-64 -bottom-12 right-[4%]" />
        </div>
        <div
          className="absolute left-[12.5%] right-[12.5%] top-[3.25rem] h-px bg-gradient-to-r from-foreground-secondary via-primary-400 to-foreground-secondary hidden ltp:block"
          aria-hidden="true"
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-foreground-secondary via-primary-400 to-foreground-secondary ltp:hidden"
          aria-hidden="true"
        />

        <ol
          className="relative flex flex-col gap-6 ltp:grid ltp:grid-cols-4 ltp:gap-6"
          aria-label="Proces weryfikacji jakości materiałów"
        >
          {[
            {
              num: 1,
              title: 'Tworzenie na żądanie',
              desc: 'Materiał powstaje na żądanie społeczności w moim unikalnym stylu',
              glass: {
                backgroundColor: 'rgba(11, 27, 18, 0.72)',
                backdropFilter: 'blur(6px)',
              },
            },
            {
              num: 2,
              title: 'Automatyczna weryfikacja',
              desc: 'N8N pipeline: gramatyka, SEO, review przez wiele modeli LLM',
              glass: {
                backgroundColor: 'rgba(11, 27, 18, 0.62)',
                backdropFilter: 'blur(8px)',
              },
            },
            {
              num: 3,
              title: 'Ocena & poprawki',
              desc: 'LLM wystawia oceny numeryczne, wprowadza poprawki, finalne review',
              glass: {
                backgroundColor: 'rgba(11, 27, 18, 0.78)',
                backdropFilter: 'blur(5px)',
              },
            },
            {
              num: 4,
              title: 'Ciągła re-ewaluacja',
              desc: 'Cykliczny proces: feedback społeczności → poprawki → akceptacja',
              glass: {
                backgroundColor: 'rgba(11, 27, 18, 0.66)',
                backdropFilter: 'blur(9px)',
              },
            },
          ].map(({ num, title, desc, glass }) => (
            <li
              key={num}
              className="relative flex items-start gap-4 ltp:flex-col ltp:items-center ltp:text-center rounded-xl p-[1px] bg-gradient-to-r from-background via-primary-500/20 to-background w-full max-w-[420px] mx-auto ltp:max-w-none ltp:mx-0"
            >
              <div
                className="flex flex-col items-center text-center gap-4 rounded-xl px-5 py-6 h-full w-full"
                style={glass}
              >
                <div
                  className="relative z-1 flex items-center justify-center size-14 rounded-full border border-primary-400 text-h4 font-500 text-primary-500"
                  aria-hidden="true"
                >
                  {num}
                </div>
                <div className="relative z-1">
                  <h4 className="text-h5 font-500">{title}</h4>
                  <p className="text-regular font-300 text-foreground-secondary mt-2">
                    {desc}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex justify-center mt-12">
        <a
          className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-[#091610] rounded-full text-regular-bold font-500 shadow-[0_0_16px_2px_rgba(1,120,70,0.6)] hover:shadow-[0_0_20px_4px_rgba(1,120,70,0.8)] transition-shadow"
          href="https://4markdown.com/document-preview/?id=fa9e7d53-fd86-43e8-bb0b-d2224560e5c5"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Zobacz szczegółową metodologię pomiaru jakości"
          title="Zobacz szczegółową metodologię pomiaru jakości"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="text-[#091610]"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
          <span>Zobacz metodologię</span>
        </a>
      </div>
    </div>
  </section>
);

export { MaterialsQualitySection };
