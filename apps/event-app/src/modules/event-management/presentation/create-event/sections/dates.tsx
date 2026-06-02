import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { type FormValues } from '../schema';
import { Field } from '../field';
import { DateTimePicker } from '../date-time-picker';

// ── Types ──────────────────────────────────────────────────────────────────────

type Props = {
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
};

// ── Component ──────────────────────────────────────────────────────────────────

export const DatesSection = ({ control, errors }: Props) => (
  <section id="dates" className="flex flex-col gap-6 scroll-mt-20">
    <div className="flex items-baseline gap-3 pb-4 border-b border-hairline">
      <span className="mono-label">02</span>
      <h2 className="subsection-heading text-ink">Termin</h2>
    </div>

    <Field
      label="Data i godzina rozpoczęcia"
      error={errors.startDateTime?.message}
      htmlFor="startDateTime"
    >
      <Controller
        name="startDateTime"
        control={control}
        render={({ field }) => (
          <DateTimePicker
            id="startDateTime"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            hasError={!!errors.startDateTime}
          />
        )}
      />
    </Field>

    <Field label="Data i godzina zakończenia" htmlFor="endDateTime" optional>
      <Controller
        name="endDateTime"
        control={control}
        render={({ field }) => (
          <DateTimePicker
            id="endDateTime"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
    </Field>
  </section>
);
