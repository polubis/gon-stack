import { useEffect, useCallback } from 'react';
import { useForm, useWatch, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast, Toaster } from 'sonner';
import { Logo } from '@/libs/ui/logo';
import { formSchema, type FormValues } from './create-event/schema';
import { useContext } from './context';
import { FormSidebar } from './create-event/sidebar';
import { BasicSection } from './create-event/sections/basic';
import { DatesSection } from './create-event/sections/dates';
import { LocationSection } from './create-event/sections/location';
import { DetailsSection } from './create-event/sections/details';
import { KeywordsSection } from './create-event/sections/keywords';

export const CreateEventForm = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  const {
    control,
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = methods;

  const {
    $coordinates,
    $geoStatus,
    $keywords,
    $isSubmitting,
    $submitError,
    $submitSuccess,
    trigger,
  } = useContext();
  const coordinates = $coordinates.use();
  const geoStatus = $geoStatus.use();
  const isSubmitting = $isSubmitting.use();
  const submitError = $submitError.use();
  const submitSuccess = $submitSuccess.use();

  const handleGeocode = useCallback(() => {
    const { street, number, postalCode, city } = getValues('address');
    if (!street || !number || !city) return;
    trigger('[TRIGGER]_GEOCODE_ADDRESS', {
      query: `${street} ${number}, ${postalCode} ${city}`,
    });
  }, [getValues, trigger]);

  const name = useWatch({ control, name: 'name' });
  const category = useWatch({ control, name: 'category' });
  const startDateTime = useWatch({ control, name: 'startDateTime' });

  const sectionDone: Record<string, boolean> = {
    basic: !!(name && category),
    dates: !!startDateTime,
    location: geoStatus === 'success',
    details: true,
    keywords: true,
  };

  useEffect(() => {
    if (submitSuccess) {
      toast.success(submitSuccess);
      window.location.assign('/');
    }
  }, [submitSuccess]);

  useEffect(() => {
    if (submitError) toast.error(submitError);
  }, [submitError]);

  const onSubmit = (data: FormValues) => {
    if (!coordinates) {
      toast.error('Uzupełnij adres — lokalizacja jest wymagana.');
      return;
    }
    trigger('[TRIGGER]_SUBMIT_CREATE_EVENT', {
      data: {
        name: data.name,
        description: data.description || undefined,
        category: data.category,
        startDateTime: new Date(data.startDateTime).toISOString(),
        endDateTime: data.endDateTime
          ? new Date(data.endDateTime).toISOString()
          : undefined,
        address: data.address,
        coordinates,
        externalLink: data.externalLink || undefined,
        imageUrl: data.imageUrl || undefined,
        keywords: $keywords.get(),
        organizerInfo: data.organizerInfo || undefined,
      },
    });
  };

  return (
    <>
      <Toaster richColors position="top-right" />

      <div className="min-h-screen bg-canvas">
        <header className="sticky top-0 z-20 border-b border-hairline bg-canvas/90 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Logo href="/" />
            <a
              href="/"
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              ← Wróć
            </a>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-16 items-start">
            <FormSidebar sectionDone={sectionDone} />

            <div>
              <div className="mb-10">
                <h1 className="section-heading text-ink">Dodaj wydarzenie</h1>
                <p className="text-body-muted text-sm mt-2">
                  Opublikuj wydarzenie — będzie widoczne dla wszystkich
                  użytkowników Afisz.
                </p>
              </div>

              <FormProvider {...methods}>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-14"
                >
                  <BasicSection register={register} errors={errors} />
                  <DatesSection control={control} errors={errors} />
                  <LocationSection
                    register={register}
                    errors={errors}
                    geoStatus={geoStatus}
                    coordinates={coordinates}
                    onBlur={handleGeocode}
                  />
                  <DetailsSection register={register} errors={errors} />
                  <KeywordsSection />

                  <div className="pt-8 border-t border-hairline flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-pill bg-primary py-3 px-8 text-sm font-medium text-on-primary hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isSubmitting ? 'Publikowanie…' : 'Opublikuj wydarzenie'}
                    </button>
                    <p className="text-sm text-body-muted">
                      Wydarzenie zostanie opublikowane natychmiast i będzie
                      widoczne publicznie.
                    </p>
                  </div>
                </form>
              </FormProvider>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
