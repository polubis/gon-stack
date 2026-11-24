import type {
  WalkthroughStep,
  WalkthroughStepId,
} from '@/shared/walkthrough/domain/models';
import {
  CategoriesIllustration,
  LimitsIllustration,
  RecurringIllustration,
  ReportsIllustration,
  ScanIllustration,
  SummaryIllustration,
} from './illustrations';

export const STEPS: WalkthroughStep[] = [
  {
    id: 1 as WalkthroughStepId,
    illustration: SummaryIllustration,
    title: 'Witaj w Parce',
    body: 'Na start widzisz wydatki miesiąca, średnią dzienną i to, ile zostało do limitu.',
    cta: 'Pokaż więcej',
  },
  {
    id: 2 as WalkthroughStepId,
    illustration: ScanIllustration,
    title: 'Paragon zamiast przepisywania',
    body: 'Wgraj plik lub zrób zdjęcie. Sklep, kwotę i produkty odczytamy za Ciebie.',
    cta: 'Dalej',
  },
  {
    id: 3 as WalkthroughStepId,
    illustration: CategoriesIllustration,
    title: 'Kategorie mówią, gdzie znikają pieniądze',
    body: 'Wykres pokazuje udział każdej kategorii, a filtry zawężają listę wydatków.',
    cta: 'Dalej',
  },
  {
    id: 4 as WalkthroughStepId,
    illustration: LimitsIllustration,
    title: 'Limity, które pilnują budżetu',
    body: 'Ustaw limit miesięczny i limity kategorii. Paski pokażą, ile już wykorzystano.',
    cta: 'Dalej',
  },
  {
    id: 5 as WalkthroughStepId,
    illustration: RecurringIllustration,
    title: 'Stałe płatności same się dopiszą',
    body: 'Dodaj wydatek cykliczny, a Parka pokaże nadchodzące obciążenia i doliczy je w terminie.',
    cta: 'Dalej',
  },
  {
    id: 6 as WalkthroughStepId,
    illustration: ReportsIllustration,
    title: 'Raport w jednym kliknięciu',
    body: 'Podsumowanie miesiąca pobierzesz jako CSV albo pełny raport.',
    cta: 'Zaczynamy',
  },
];
