export const copy = {
  banner: {
    title: 'Twoja prywatność ma znaczenie',
    description:
      'Klikając „Akceptuj”, wyrażasz zgodę na wykorzystanie plików cookie zgodnie z naszą polityką prywatności. Cookies pomagają nam zapewnić poprawne działanie strony, analizować ruch oraz dostosowywać treści.',
    policyLinkLabel: 'Przeczytaj naszą politykę prywatności',
    customize: 'Dostosuj',
    accept: 'Akceptuj',
  },

  preferences: {
    title: 'Zarządzaj preferencjami cookies',
    description: 'Włącz lub wyłącz poszczególne kategorie plików cookie.',
    back: 'Wstecz',
    accept: 'Akceptuj',
    categories: {
      necessary: {
        title: 'Niezbędne',
        description:
          'Te pliki cookie są konieczne do prawidłowego działania strony i nie można ich wyłączyć.',
      },
      performance: {
        title: 'Wydajnościowe',
        description:
          'Pozwalają liczyć odwiedziny i źródła ruchu, dzięki czemu możemy mierzyć i poprawiać wydajność strony.',
      },
      functional: {
        title: 'Funkcjonalne',
        description:
          'Umożliwiają rozszerzoną funkcjonalność strony i zapamiętywanie Twoich preferencji.',
      },
      marketing: {
        title: 'Marketingowe',
        description:
          'Mogą być wykorzystywane, aby dopasować treści marketingowe do Twoich zainteresowań.',
      },
    },
  },

  reopenTrigger: {
    ariaLabel: 'Ustawienia plików cookie',
  },
} as const;
