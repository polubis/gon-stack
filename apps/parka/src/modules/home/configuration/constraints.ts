import { Leaf, ScanLine, Pencil, ChartColumn } from 'lucide-react';
import type {
  WalkthroughStep,
  WalkthroughStepId,
} from '@/shared/walkthrough/domain/models';

export const FEATURE_NAME = 'Home';
export const PERSISTENCE_KEY = 'parka:onboarding-walkthrough';

export const ERROR_CODES = {
  render: 'HOME_RENDER',
} as const;

export const STEPS: WalkthroughStep[] = [
  {
    id: 1 as WalkthroughStepId,
    icon: Leaf,
    title: 'Parka',
    body: 'Twoje wydatki pod kontrolą. Prosto, przejrzyście, bez stresu.',
    cta: 'Zacznijmy',
  },
  {
    id: 2 as WalkthroughStepId,
    icon: ScanLine,
    title: 'Skanuj paragony — szybko i wygodnie',
    body: 'Zrób zdjęcie paragonu, a my odczytamy dane i przypiszemy kategorie.',
    cta: 'Dalej',
  },
  {
    id: 3 as WalkthroughStepId,
    icon: Pencil,
    title: 'Edytuj i kategoryzuj wydatki',
    body: 'Popraw dowolną pozycję i przypisz właściwą kategorię w kilka sekund.',
    cta: 'Dalej',
  },
  {
    id: 4 as WalkthroughStepId,
    icon: ChartColumn,
    title: 'Masz pełną kontrolę',
    body: 'Sprawdzaj podsumowania, limity i cele oszczędnościowe w jednym miejscu.',
    cta: 'Zaczynajmy',
  },
];
