import { type UseFormRegister, type FieldErrors } from 'react-hook-form';
import { MapPin, Loader2 } from 'lucide-react';
import { type FormValues, type GeoStatus } from '../schema';
import { Field, inputCls } from '../field';

// ── Types ──────────────────────────────────────────────────────────────────────

type Props = {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  geoStatus: GeoStatus;
  coordinates: { lat: number; lng: number } | null;
  onBlur: () => void;
};

// ── Component ──────────────────────────────────────────────────────────────────

export const LocationSection = ({
  register,
  errors,
  geoStatus,
  coordinates,
  onBlur,
}: Props) => (
  <section id="location" className="flex flex-col gap-6 scroll-mt-20">
    <div className="flex items-baseline gap-3 pb-4 border-b border-hairline">
      <span className="mono-label">03</span>
      <h2 className="subsection-heading text-ink">Lokalizacja</h2>
    </div>

    <div className="grid grid-cols-[1fr_120px] gap-3">
      <Field
        label="Ulica"
        error={errors.address?.street?.message}
        htmlFor="street"
      >
        <input
          id="street"
          type="text"
          placeholder="np. Rynek Główny"
          {...register('address.street')}
          className={inputCls(!!errors.address?.street)}
          onBlur={onBlur}
        />
      </Field>
      <Field
        label="Numer"
        error={errors.address?.number?.message}
        htmlFor="number"
      >
        <input
          id="number"
          type="text"
          placeholder="1"
          {...register('address.number')}
          className={inputCls(!!errors.address?.number)}
          onBlur={onBlur}
        />
      </Field>
    </div>

    <div className="grid grid-cols-[140px_1fr] gap-3">
      <Field
        label="Kod pocztowy"
        error={errors.address?.postalCode?.message}
        htmlFor="postalCode"
      >
        <input
          id="postalCode"
          type="text"
          placeholder="00-000"
          {...register('address.postalCode')}
          className={inputCls(!!errors.address?.postalCode)}
          onBlur={onBlur}
        />
      </Field>
      <Field
        label="Miasto"
        error={errors.address?.city?.message}
        htmlFor="city"
      >
        <input
          id="city"
          type="text"
          placeholder="np. Kraków"
          {...register('address.city')}
          className={inputCls(!!errors.address?.city)}
          onBlur={onBlur}
        />
      </Field>
    </div>

    {geoStatus === 'loading' && (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 size={14} className="animate-spin" />
        Lokalizowanie adresu…
      </div>
    )}
    {geoStatus === 'success' && coordinates && (
      <div className="flex items-center gap-2 text-sm text-[#2d8a4e]">
        <MapPin size={14} />
        Adres zlokalizowany ({coordinates.lat.toFixed(4)},{' '}
        {coordinates.lng.toFixed(4)})
      </div>
    )}
    {geoStatus === 'error' && (
      <div className="flex items-center gap-2 text-sm text-coral">
        <MapPin size={14} />
        Nie znaleziono adresu. Sprawdź dane i spróbuj ponownie.
      </div>
    )}
  </section>
);
