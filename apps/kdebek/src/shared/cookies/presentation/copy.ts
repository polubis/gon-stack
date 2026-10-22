export const copy = {
  banner: {
    title: 'Twoja prywatność ma znaczenie',
    description:
      'Używamy niezbędnych plików cookie i pamięci przeglądarki. Za Twoją zgodą korzystamy też z analityki ruchu (Cloudflare Web Analytics). Możesz zaakceptować lub odrzucić analitykę — odmowa nie ogranicza działania strony.',
    policyLinkLabel: 'Przeczytaj naszą politykę prywatności',
    customize: 'Dostosuj',
    reject: 'Odrzuć',
    accept: 'Akceptuj',
  },

  preferences: {
    title: 'Zarządzaj preferencjami cookies',
    description: 'Włącz lub wyłącz poszczególne kategorie plików cookie.',
    back: 'Wstecz',
    accept: 'Zapisz wybór',
    categories: {
      necessary: {
        title: 'Niezbędne',
        description:
          'Konieczne do działania strony, np. zapamiętanie Twojego wyboru zgód (localStorage: kdebek:cookie-consent, do 12 miesięcy). Nie można ich wyłączyć.',
      },
      performance: {
        title: 'Wydajnościowe',
        description:
          'Cloudflare Web Analytics (Cloudflare, Inc.) — statystyki odwiedzin i źródeł ruchu, ładowane wyłącznie po Twojej zgodzie.',
      },
    },
  },

  reopenTrigger: {
    ariaLabel: 'Ustawienia plików cookie',
  },
} as const;
