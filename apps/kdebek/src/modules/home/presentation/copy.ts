const NBSP = ' ';

export const reviewSources = [
  {
    id: 'google',
    name: 'Google',
    ratingValue: '5.0',
    reviewsCountLabel: '52 opinii',
  },
  {
    id: 'booksy',
    name: 'Booksy',
    ratingValue: '5.0',
    reviewsCountLabel: '66 opinii',
  },
] as const;

const reviewTrustLine = reviewSources
  .map((source) => `${source.ratingValue} ${source.name}`)
  .join(`${NBSP}•${NBSP}`);

export const copy = {
  meta: {
    title: 'Kacper Dębek — masaż leczniczy i klasyczny',
    description:
      'Kacper Dębek – certyfikowany technik masażysta w Olsztynie. Masaż leczniczy i klasyczny, indywidualne podejście do bólu i napięć mięśniowych. Umów wizytę online.',
  },

  navbar: {
    brandFull: 'Kacper Dębek',
    brandShort: 'KDębek',
    brandTag: 'masazysta-olsztyn.pl',
    navItems: [
      { id: 'o-mnie', label: 'O mnie' },
      { id: 'oferta', label: 'Oferta' },
      { id: 'cennik', label: 'Cennik' },
      { id: 'kontakt', label: 'Kontakt' },
    ],
    cta: 'Umów wizytę online',
    ariaOpenMenu: 'Otwórz menu',
    ariaCloseMenu: 'Zamknij menu',
    ariaMobileNav: 'Menu mobilne',
  },

  hero: {
    eyebrow: `MNIEJ BÓLU ${NBSP}•${NBSP} WIĘCEJ RUCHU ${NBSP}•${NBSP} SZYBSZY POWRÓT DO FORMY`,
    headingLine1: 'Wróć do ruchu',
    headingLine2: 'bez bólu, który Cię ogranicza',
    subheading:
      'Indywidualne podejście i sprawdzone metody pracy z bólem, poparte 5-letnim doświadczeniem. Szukamy przyczyny dolegliwości, nie tylko objawów.',
    ctaPrimary: 'Umów wizytę online',
    ctaSecondary: 'Poznaj moje podejście',
    trustLine: `${reviewTrustLine}${NBSP}•${NBSP} 1000+ pacjentów${NBSP}•${NBSP} 5 lat praktyki`,
    quote:
      'Nie obiecuję cudów — obiecuję zaangażowanie, sprawdzone metody i realne efekty.',
    imageAlt: 'Kacper Dębek — masażysta',
  },

  servicesGrid: {
    heading: 'W czym mogę Ci pomóc?',
    items: [
      {
        id: 'therapeutic-massage',
        title: 'Masaż leczniczy',
        description:
          'Praca z dolegliwościami bólowymi — wywiad, testy i terapia skoncentrowana na przyczynie problemu.',
      },
      {
        id: 'classic-massage',
        title: 'Masaż klasyczny',
        description:
          'Regeneracja całego ciała lub wybranej partii — rozluźnienie mięśni, lepsze dokrwienie i odnowa.',
      },
      {
        id: 'pain-relief',
        title: 'Ulga w bólu',
        description:
          'Trwała ulga w bólu pleców, karku i stawów, nie tylko chwilowe złagodzenie objawów.',
      },
      {
        id: 'prevention',
        title: 'Profilaktyka',
        description:
          'Indywidualne ćwiczenia domowe, które wspierają efekty masażu i zmniejszają ryzyko nawrotu bólu.',
      },
      {
        id: 'sports-massage',
        title: 'Masaż sportowy',
        description:
          'Regeneracja po treningu, przygotowanie do startu i szybszy powrót do formy po przeciążeniach.',
      },
      {
        id: 'deep-tissue',
        title: 'Masaż tkanek głębokich',
        description:
          'Praca z przewlekłymi napięciami i bolesnymi „guzkami” — głębsze rozluźnienie mięśni i powięzi.',
      },
      {
        id: 'back-pain',
        title: 'Ból pleców',
        description:
          'Ulga w dolegliwościach lędźwiowych i napięciach między łopatkami — szukamy przyczyny, nie tylko objawów.',
      },
      {
        id: 'neck-shoulders',
        title: 'Kark i barki',
        description:
          'Rozluźnienie sztywności i bólu po pracy siedzącej oraz długim siedzeniu przed ekranem.',
      },
    ],
  },

  about: {
    eyebrow: 'O MNIE',
    headingLine1: 'Nazywam się',
    headingLine2: 'Kacper Dębek',
    introParagraphs: [
      'Jestem certyfikowanym technikiem masażystą i prowadzę gabinet masażu w Olsztynie.',
      'Specjalizuję się w pracy z dolegliwościami bólowymi i napięciami układu mięśniowo-powięziowego, w szczególności w obrębie kręgosłupa, barków, karku oraz kończyn dolnych.',
      'Pracuję z osobami zgłaszającymi bóle lędźwiowe i szyjne, napięcia między łopatkami, dolegliwości barkowe, objawy rwy kulszowej oraz przeciążenia wynikające z aktywności sportowej.',
      'W zależności od potrzeb wykorzystuję masaż leczniczy, masaż tkanek głębokich, masaż sportowy, masaż klasyczny oraz pinoterapię, łącząc techniki w sposób indywidualny i zgodny z zakresem kompetencji technika masażysty.',
    ],
    credentials: [
      {
        id: 'experience',
        title: 'Doświadczenie',
        description:
          'Certyfikowany technik masażysta z 5-letnią praktyką w gabinecie masażu w Olsztynie.',
      },
      {
        id: 'specializations',
        title: 'Specjalizacje',
        description:
          'Dolegliwości bólowe kręgosłupa, barków, karku i kończyn dolnych — m.in. bóle lędźwiowe i szyjne, napięcia między łopatkami oraz objawy rwy kulszowej.',
      },
      {
        id: 'approach',
        title: 'Podejście',
        description:
          'Masaż leczniczy, klasyczny, tkanek głębokich, sportowy i pinoterapia — techniki dobieram indywidualnie do potrzeb pacjenta.',
      },
    ],
    quote:
      'Największą satysfakcją jest dla mnie moment, kiedy pacjent wraca do aktywności, które kocha.',
    statsTitle: 'W liczbach',
    statsDescription: 'Liczby, które mówią same za siebie.',
    stats: [
      { id: 'clients', value: 1000, suffix: '+', label: 'klientów' },
      { id: 'visits', value: 3000, suffix: '+', label: 'wizyt' },
      ...reviewSources.map((source) => ({
        id: `${source.id}-rating`,
        value: Number.parseFloat(source.ratingValue),
        decimals: 1,
        suffix: '/5',
        label: source.name,
      })),
      { id: 'years', value: 5, suffix: '', label: 'Lat praktyki' },
      { id: 'courses', value: 10, suffix: '+', label: 'Kursów' },
    ],
  },

  aboutGallery: {
    ariaLabel: 'Galeria zdjęć',
    ariaPause: 'Wstrzymaj pokaz slajdów',
    ariaPlay: 'Wznów pokaz slajdów',
    srOnlyPrefix: 'Slajd',
    srOnlySeparator: 'z',
    slides: [
      'Kacper Dębek — Gabinet Masażu',
      'Ćwiczenia domowe',
      'Kacper Dębek w gabinecie',
      'Sesja masażu',
    ],
  },

  offerPanel: {
    eyebrow: 'OFERTA',
    heading: 'Wybierz masaż dopasowany do Twojego problemu',
    subheading:
      'Zobacz ceny i szczegóły każdej usługi — dla siebie lub swojej firmy.',
    ctaPrimary: 'UMÓW WIZYTĘ ONLINE',
    ctaSecondary: 'Zobacz pełen cennik',
    openingHours: {
      title: 'Godziny otwarcia',
      closedLabel: 'Zamknięte',
      days: [
        {
          id: 'monday',
          label: 'Poniedziałek',
          slots: ['13:00 - 21:00'],
        },
        {
          id: 'tuesday',
          label: 'Wtorek',
          slots: ['07:00 - 15:15'],
        },
        {
          id: 'wednesday',
          label: 'Środa',
          slots: ['07:00 - 15:15'],
        },
        {
          id: 'thursday',
          label: 'Czwartek',
          slots: ['07:00 - 15:15', '17:30 - 18:30'],
        },
        { id: 'friday', label: 'Piątek', closed: true, slots: [] },
        { id: 'saturday', label: 'Sobota', closed: true, slots: [] },
        { id: 'sunday', label: 'Niedziela', closed: true, slots: [] },
      ],
    },
  },

  offerWidget: {
    ariaTablist: 'Rodzaj oferty',
    tabs: [
      { id: 'private', label: 'Dla osób prywatnych' },
      { id: 'company', label: 'Dla firm' },
    ],
    ariaExpandPrefix: 'Rozwiń',
    ariaCollapsePrefix: 'Zwiń',
    ctaAllServices: 'Zobacz wszystkie usługi',
    ctaBook: 'Umów wizytę online',
    privateServices: [
      {
        id: 'therapeutic-massage',
        title: 'Masaż leczniczy',
        description:
          'Wizyta skierowana do osób z dolegliwościami bólowymi — wywiad, testy i praca nad przyczyną bólu.',
        price: 'od 80 zł',
        body: [
          'Wizyta na masażu leczniczym w moim gabinecie jest skierowana do osób z dolegliwościami bólowymi. Podczas takiej wizyty za pomocą wywiadu i różnych testów szukam prawdopodobnej przyczyny dolegliwości. Następnie z wykorzystaniem znanych mi metod terapii pracuję z prawdopodobną przyczyną bólu skupiając się na konkretnych strukturach. W celu przyspieszenia procesu naprawy często zalecam konkretne zadanie domowe do wykonywania do następnej wizyty.',
          'Pierwsza wizyta ze względu na wywiad i przeprowadzane testy to wersja 55min.',
          'Podczas kolejnych wizyt kontynuujemy pracę i monitorujemy postępy podczas 30-minutowych spotkań kontynuujących.',
        ],
        variants: [
          {
            id: 'therapeutic-follow-up',
            name: 'Masaż leczniczy wizyta kontynuująca',
            price: '80,00 zł',
            duration: '30 min',
          },
          {
            id: 'therapeutic-first',
            name: 'Masaż leczniczy pierwsza wizyta',
            price: '150,00 zł',
            duration: '55 min',
          },
        ],
      },
      {
        id: 'classic-massage',
        title: 'Masaż klasyczny',
        description:
          'Masaż w celach regeneracyjnych — rozluźnienie mięśni, lepsze dokrwienie i odnowa organizmu.',
        price: 'od 80 zł',
        body: [
          'Masaż klasyczny w celach regeneracyjnych. Zalecany przy ogólnej sztywności, potrzebie regeneracji, przemęczeniu spowodowanym np. treningami. Taki masaż skutkuje lepszym dokrwieniem tkanek, ogólnym rozluźnieniem mięśni, przyspieszeniem regeneracji organizmu. Bardzo dobrze sprawdza się jako regularnie stosowana profilaktyka mająca zmniejszyć ryzyko pojawienia się kontuzji lub dolegliwości bólowych narządu ruchu.',
          'Podczas wizyty 55min masaż dotyczy całego ciała (pleców, nóg, rąk, obręczy barkowej). W 30min opcji masaż dotyczy części ciała np. masaż pleców.',
        ],
        variants: [
          {
            id: 'classic-partial',
            name: 'Masaż klasyczny częściowy',
            price: '80,00 zł',
            duration: '30 min',
          },
          {
            id: 'classic-full',
            name: 'Masaż klasyczny całego ciała',
            price: '150,00 zł',
            duration: '55 min',
          },
        ],
      },
    ],
    companyServices: [
      {
        id: 'office-massage',
        title: 'Masaż biurowy',
        description:
          'Krótkie sesje masażu dla pracowników biurowych — w gabinecie lub u klienta. Łagodzą napięcie po długim siedzeniu i wspierają dobre samopoczucie zespołu.',
        price: 'wycena indywidualna',
        videoUrl: 'https://www.youtube-nocookie.com/embed/nn3lrCW5dgk',
        videoTitle: 'Masaż biurowy dla firm — Kacper Dębek',
        details: [
          'Profilaktyka bólów kręgosłupa i napięć po pracy siedzącej',
          'Krótkie sesje dopasowane do przerw w ciągu dnia pracy',
          'Elastyczny harmonogram i wycena dla firm',
        ],
      },
    ],
  },

  testimonials: {
    eyebrow: 'OPINIE PACJENTÓW',
    heading: 'Zaufanie, które procentuje',
    subheading:
      'Sprawdź, co mówią pacjenci, którzy pokonali ból dzięki masażowi — Ty możesz być następny.',
    sources: reviewSources,
    imageAlt: 'Gabinet masażu',
    items: [
      {
        id: 'marek-w',
        name: 'Marek W.',
        subtitle: 'Ból kręgosłupa',
        initials: 'MW',
        text: 'Bardzo profesjonalne podejście i widoczne efekty już po kilku wizytach. Ból, który towarzyszył mi od dawna, w końcu ustąpił. Polecam każdemu!',
      },
      {
        id: 'agnieszka-n',
        name: 'Agnieszka N.',
        subtitle: 'Masaż leczniczy',
        initials: 'AN',
        text: 'Po serii wizyt masażu leczniczego wróciłam do codziennych aktywności znacznie szybciej, niż zakładałam. Miła atmosfera i naprawdę fachowe podejście.',
      },
      {
        id: 'pawel-d',
        name: 'Paweł D.',
        subtitle: 'Napięcie karku i barków',
        initials: 'PD',
        text: 'Indywidualne podejście do każdego problemu i skuteczne metody pracy. Na każdej wizycie czuję się dobrze zaopiekowany.',
      },
      {
        id: 'karolina-m',
        name: 'Karolina M.',
        subtitle: 'Rwa kulszowa',
        initials: 'KM',
        text: 'Po kilku wizytach ból promieniujący do nogi wyraźnie się zmniejszył. Kacper dokładnie tłumaczy, co robi i dlaczego — to buduje zaufanie.',
      },
      {
        id: 'tomasz-k',
        name: 'Tomasz K.',
        subtitle: 'Regeneracja po treningu',
        initials: 'TK',
        text: 'Regularnie chodzę na masaż klasyczny po treningach. Mięśnie regenerują się szybciej, a sztywność nie wraca tak szybko jak wcześniej.',
      },
      {
        id: 'joanna-s',
        name: 'Joanna S.',
        subtitle: 'Ból lędźwiowy',
        initials: 'JS',
        text: 'Siedząca praca dawała mi się we znaki, ale po serii wizyt i ćwiczeniach domowych wreszcie mogę spokojnie pracować bez ciągłego bólu pleców.',
      },
    ],
  },

  onlineBookingCta: {
    eyebrow: 'REZERWACJA ONLINE',
    headingLine1: 'Umów wizytę online',
    headingLine2: 'w kilka minut',
    subheading:
      'Wybierz termin, który Ci pasuje, i potwierdź wizytę w kilku krokach — bez telefonów i czekania na odpowiedź.',
    features: [
      {
        id: '24-7',
        title: '24/7',
        description: 'Rezerwuj o dowolnej porze dnia i nocy',
      },
      {
        id: 'fast',
        title: 'Szybko',
        description: 'Zarezerwuj termin w mniej niż minutę',
      },
      {
        id: 'safe',
        title: 'Bezpiecznie',
        description: 'Twoje dane osobowe są u nas w pełni chronione',
      },
      {
        id: 'reminders',
        title: 'Przypomnienia',
        description: 'Wyślemy Ci przypomnienie o wizycie SMS-em na czas',
      },
    ],
    bookingSteps: [
      { id: 'service', label: 'Usługa' },
      { id: 'date', label: 'Termin' },
      { id: 'details', label: 'Dane' },
      { id: 'confirmation', label: 'Potwierdzenie' },
    ],
    activeStepId: 'date',
    miniCalendarMonth: 'Czerwiec 2024',
    chooseDateLabel: 'Wybierz termin wizyty',
    availableHoursLabel: 'Dostępne godziny',
    selectedDateLabel: 'Środa, 12 czerwca',
    timeSlots: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'],
    timeSlotsExtended: [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
    ],
    selectedTimeSlot: '10:00',
    finalHeadingLine1: 'Zarezerwuj wizytę',
    finalHeadingLine2: 'już teraz',
    finalCta: 'UMÓW WIZYTĘ ONLINE',
    finalMicrocopy: 'To zajmie tylko chwilę.',
  },

  bookingWidget: {
    heading: 'Umów wizytę',
    subheading:
      'Wybierz termin, który Ci pasuje, i zarezerwuj wizytę online w kilka minut.',
    cta: 'UMÓW WIZYTĘ ONLINE',
    trust: 'Twoje dane są bezpieczne i chronione.',
  },

  footer: {
    brandName: 'Kacper Dębek',
    brandTag: 'masazysta-olsztyn.pl',
    description:
      'Certyfikowany technik masażysta w Olsztynie. Masaż leczniczy i klasyczny oparte na indywidualnym podejściu i 5-letnim doświadczeniu.',
    socialLinks: [
      { id: 'facebook', label: 'Facebook' },
      { id: 'instagram', label: 'Instagram' },
      { id: 'linkedin', label: 'LinkedIn' },
      { id: 'youtube', label: 'YouTube' },
    ],
    linkColumns: [
      {
        id: 'offer',
        title: 'Oferta',
        links: [
          { label: 'Dla osób prywatnych' },
          { label: 'Dla firm' },
          { label: 'Masaż leczniczy' },
          { label: 'Masaż klasyczny' },
          { label: 'Zobacz wszystkie usługi' },
        ],
      },
      {
        id: 'info',
        title: 'Informacje',
        links: [
          { label: 'Cennik' },
          { label: 'Jak wygląda wizyta?' },
          { label: 'Czas trwania zabiegu' },
          { label: 'Przygotowanie do wizyty' },
          { label: 'FAQ – najczęstsze pytania' },
          { label: 'Regulamin', href: '#' },
          { label: 'Polityka prywatności', href: '#' },
        ],
      },
      {
        id: 'about',
        title: 'O mnie',
        links: [
          { label: 'Moja historia' },
          { label: 'Wykształcenie i certyfikaty' },
          { label: 'Doświadczenie' },
          { label: 'Moje podejście' },
          { label: 'Opinie pacjentów' },
        ],
      },
      {
        id: 'business',
        title: 'Dla firm',
        links: [
          { label: 'Masaż biurowy' },
          { label: 'Oferta dla firm' },
          { label: 'Kontakt dla firm' },
        ],
      },
    ],
    contactBlocks: {
      booking: {
        title: 'Umów wizytę',
        description: 'Szybko i wygodnie online',
        linkLabel: 'Umów wizytę',
      },
      email: {
        title: 'Napisz do nas',
        address: 'kontakt@kacperdebek.pl',
        linkLine1: 'Odpowiemy najszybciej',
        linkLine2: 'jak to możliwe',
      },
      phone: {
        title: 'Telefon',
        number: '+48 666 735 220',
      },
      location: {
        title: 'Lokalizacja',
        line1: 'ul. Profesorska 9A',
        line2: '10-080 Olsztyn',
        linkLabel: 'Zobacz na mapie',
      },
    },
    bookingCard: {
      title: 'Umów wizytę online',
      description: 'Zarezerwuj dogodny termin bez wychodzenia z domu.',
      cta: 'UMÓW WIZYTĘ ONLINE',
    },
    copyrightPrefix: '©',
    copyrightSuffix:
      'Kacper Dębek – masaż leczniczy i klasyczny. Wszelkie prawa zastrzeżone.',
    madeWith: 'Tworzone z pasją do zdrowia i człowieka.',
    poweredByAriaLabel: 'Powered by GreenOn Software',
  },
};
