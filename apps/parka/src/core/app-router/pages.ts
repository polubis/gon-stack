import { APP_ROUTER, type PageUrl } from '@/shared/router/routes';

export type AppPage = {
  url: PageUrl;
  title: string;
  description: string;
};

export const APP_PAGES: readonly AppPage[] = [
  {
    url: APP_ROUTER.dashboard(),
    title: 'Podsumowanie | Parka',
    description: 'Twoje wydatki w wybranym miesiącu.',
  },
  {
    url: APP_ROUTER.settings(),
    title: 'Ustawienia | Parka',
    description: 'Konto, powiadomienia i prywatność.',
  },
  {
    url: APP_ROUTER.categories(),
    title: 'Kategorie | Parka',
    description: 'Zarządzaj kategoriami wydatków.',
  },
  {
    url: APP_ROUTER.categoryNew(),
    title: 'Nowa kategoria | Parka',
    description: 'Dodaj kategorię wydatków.',
  },
  {
    url: APP_ROUTER.categoryEdit(),
    title: 'Edycja kategorii | Parka',
    description: 'Zmień lub usuń kategorię wydatków.',
  },
  {
    url: APP_ROUTER.reports(),
    title: 'Raport | Parka',
    description: 'Miesięczny raport wydatków.',
  },
  {
    url: APP_ROUTER.notifications(),
    title: 'Powiadomienia | Parka',
    description: 'Alerty o limitach i paragonach.',
  },
  {
    url: APP_ROUTER.privacy(),
    title: 'RODO i prywatność | Parka',
    description: 'Jak Parka chroni Twoje dane.',
  },
  {
    url: APP_ROUTER.aiInfo(),
    title: 'AI — jak to działa | Parka',
    description: 'Transparentne wyjaśnienie działania AI.',
  },
  {
    url: APP_ROUTER.dataExport(),
    title: 'Eksport danych | Parka',
    description: 'Pobierz swoje dane w CSV lub PDF.',
  },
  {
    url: APP_ROUTER.newExpense(),
    title: 'Nowy wydatek | Parka',
    description: 'Dodaj wydatek, wgraj paragon lub dodaj wydatek cykliczny.',
  },
];
