import { ScanLine, ShieldCheck, Tags, TrendingUp } from 'lucide-react';

export const FEATURE_NAME = 'AiInfo';

export const ERROR_CODES = {
  render: 'AI_INFO_RENDER',
} as const;

export const STEPS = [
  {
    icon: ScanLine,
    title: 'Analiza treści paragonów',
    body: 'Model odczytuje nazwę sklepu, datę zakupu oraz listę pozycji z Twojego zdjęcia paragonu.',
  },
  {
    icon: Tags,
    title: 'Propozycje kategorii',
    body: 'Każdej pozycji przypisywana jest sugerowana kategoria. Zawsze możesz ją poprawić przed zapisaniem.',
  },
  {
    icon: TrendingUp,
    title: 'Wykrywanie anomalii',
    body: 'Parka porównuje bieżące wydatki z historią i oznacza nietypowe kwoty oraz nagłe zmiany w kategoriach.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparentny AI',
    body: 'Bez manipulacyjnych praktyk. Zgodnie z AI Act — decyzje podejmujesz Ty, AI tylko podpowiada.',
  },
];
