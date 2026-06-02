import { type UseFormRegister, type FieldErrors } from 'react-hook-form';
import { cn } from '@/libs/ui/cn';
import { type FormValues } from '../schema';
import { Field, inputCls } from '../field';

// ── Types ──────────────────────────────────────────────────────────────────────

type Props = {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
};

// ── Component ──────────────────────────────────────────────────────────────────

export const DetailsSection = ({ register, errors }: Props) => (
  <section id="details" className="flex flex-col gap-6 scroll-mt-20">
    <div className="flex items-baseline gap-3 pb-4 border-b border-hairline">
      <span className="mono-label">04</span>
      <h2 className="subsection-heading text-ink">Szczegóły</h2>
    </div>

    <Field
      label="Link zewnętrzny"
      error={errors.externalLink?.message}
      htmlFor="externalLink"
      optional
    >
      <input
        id="externalLink"
        type="url"
        placeholder="https://..."
        {...register('externalLink')}
        className={inputCls(!!errors.externalLink)}
      />
    </Field>

    <Field
      label="URL grafiki"
      error={errors.imageUrl?.message}
      htmlFor="imageUrl"
      optional
    >
      <input
        id="imageUrl"
        type="url"
        placeholder="https://..."
        {...register('imageUrl')}
        className={inputCls(!!errors.imageUrl)}
      />
    </Field>

    <Field label="Informacje o organizatorze" htmlFor="organizerInfo" optional>
      <textarea
        id="organizerInfo"
        placeholder="Nazwa organizatora, dane kontaktowe…"
        rows={3}
        {...register('organizerInfo')}
        className={cn(inputCls(), 'resize-none')}
      />
    </Field>
  </section>
);
