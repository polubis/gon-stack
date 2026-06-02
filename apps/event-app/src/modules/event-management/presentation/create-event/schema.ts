import { z } from 'zod';
import { categorySchema } from '@/shared/server-contracts/schemas/create-event';

// ── Constants ──────────────────────────────────────────────────────────────────

type CategoryValue = (typeof categorySchema.options)[number];

const CATEGORY_LABELS: Record<CategoryValue, string> = {
  Concert: 'Koncert',
  Festival: 'Festiwal',
  Sports: 'Sport',
  Culture: 'Kultura',
  Theatre: 'Teatr',
  'Food & Drink': 'Jedzenie i napoje',
};

export const CATEGORIES = categorySchema.options.map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}));

export type Section = {
  id: string;
  label: string;
  num: string;
  optional: boolean;
};

export const SECTIONS: readonly Section[] = [
  { id: 'basic', label: 'Podstawowe info', num: '01', optional: false },
  { id: 'dates', label: 'Termin', num: '02', optional: false },
  { id: 'location', label: 'Lokalizacja', num: '03', optional: false },
  { id: 'details', label: 'Szczegóły', num: '04', optional: true },
  { id: 'keywords', label: 'Słowa kluczowe', num: '05', optional: true },
];

// ── Schema ─────────────────────────────────────────────────────────────────────

export const formSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana'),
  description: z.string().optional(),
  category: categorySchema,
  startDateTime: z.string().min(1, 'Data rozpoczęcia jest wymagana'),
  endDateTime: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Ulica jest wymagana'),
    number: z.string().min(1, 'Numer jest wymagany'),
    postalCode: z.string().min(1, 'Kod pocztowy jest wymagany'),
    city: z.string().min(1, 'Miasto jest wymagane'),
  }),
  externalLink: z
    .union([z.string().url('Podaj prawidłowy URL'), z.literal('')])
    .optional(),
  imageUrl: z
    .union([z.string().url('Podaj prawidłowy URL'), z.literal('')])
    .optional(),
  organizerInfo: z.string().optional(),
});

// ── Types ──────────────────────────────────────────────────────────────────────

export type FormValues = z.infer<typeof formSchema>;
export type GeoStatus = 'idle' | 'loading' | 'success' | 'error';
