import { Lock, MapPin, ShieldCheck, Trash2 } from 'lucide-react';

export const FEATURE_NAME = 'Privacy';

export const ERROR_CODES = {
  render: 'PRIVACY_RENDER',
} as const;

export const POINTS = [
  { icon: MapPin, text: 'Dane przechowywane w Unii Europejskiej.' },
  { icon: Lock, text: 'Szyfrowane w spoczynku i podczas przesyłania.' },
  {
    icon: ShieldCheck,
    text: 'Pełna kontrola nad danymi — zgodność z RODO / GDPR.',
  },
  { icon: Trash2, text: 'Możesz usunąć swoje dane w każdej chwili.' },
];
