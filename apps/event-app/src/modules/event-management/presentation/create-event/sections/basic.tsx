import { type UseFormRegister, type FieldErrors } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/libs/ui/cn';
import { CATEGORIES, type FormValues } from '../schema';
import { Field, inputCls } from '../field';

// ── Types ──────────────────────────────────────────────────────────────────────

type Props = {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
};

// ── Component ──────────────────────────────────────────────────────────────────

export const BasicSection = ({ register, errors }: Props) => (
  <section id="basic" className="flex flex-col gap-6 scroll-mt-20">
    <div className="flex items-baseline gap-3 pb-4 border-b border-hairline">
      <span className="mono-label">01</span>
      <h2 className="subsection-heading text-ink">Podstawowe informacje</h2>
    </div>

    <Field label="Nazwa wydarzenia" error={errors.name?.message} htmlFor="name">
      <input
        id="name"
        type="text"
        placeholder="np. Jazz na Starówce"
        {...register('name')}
        className={inputCls(!!errors.name)}
      />
    </Field>

    <Field label="Opis" htmlFor="description" optional>
      <textarea
        id="description"
        placeholder="Krótki opis wydarzenia…"
        rows={4}
        {...register('description')}
        className={cn(inputCls(), 'resize-none')}
      />
    </Field>

    <Field
      label="Kategoria"
      error={errors.category?.message}
      htmlFor="category"
    >
      <div className="relative">
        <select
          id="category"
          {...register('category')}
          className={cn(
            inputCls(!!errors.category),
            'appearance-none pr-10 cursor-pointer',
          )}
        >
          <option value="">Wybierz kategorię</option>
          {CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
      </div>
    </Field>
  </section>
);
