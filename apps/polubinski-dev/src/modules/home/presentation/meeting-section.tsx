import { useEffect, useState } from 'react';
import type { PlanType } from '../domain/models';
import { appConfig } from '../configuration/constraints';
import { Testimonial } from './testimonial';
import { useContext } from './context';
import { Select } from '@/libs/ui/select';

const paths: Record<
  PlanType,
  { href: string; label: string; target?: '_blank' }
> = {
  cvMastering: {
    href: appConfig.contactSection.calendarLink,
    target: '_blank',
    label: 'Umów spotkanie',
  },
  introductoryMeeting: {
    href: appConfig.contactSection.calendarLink,
    target: '_blank',
    label: 'Umów spotkanie',
  },
  seniorInYear: {
    href: appConfig.contactSection.calendarLink,
    target: '_blank',
    label: 'Umów spotkanie',
  },
  mockedTechInterview: {
    href: appConfig.contactSection.calendarLink,
    target: '_blank',
    label: 'Umów spotkanie',
  },
  quickCall: {
    href: appConfig.contactSection.calendarLink,
    target: '_blank',
    label: 'Umów spotkanie',
  },
  custom: {
    href: appConfig.contactSection.linkedInLink,
    target: '_blank',
    label: 'Dogadajmy się',
  },
  default: {
    href: appConfig.contactSection.linkedInLink,
    target: '_blank',
    label: 'Dowiedz się więcej',
  },
};

const defaultSelectedPlan: PlanType = 'default';
const ROTATE_INTERVAL_MS = 5000;

const MeetingSection = () => {
  const { testimonials } = useContext();
  const [selectedPlan, setSelectedPlan] =
    useState<PlanType>(defaultSelectedPlan);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const id = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % testimonials.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [testimonials.length]);

  const currentTestimonial =
    testimonials.length > 0
      ? (testimonials[currentIndex % testimonials.length] ?? null)
      : null;

  return (
    <section
      className="fluid page-section flex justify-between max-w-xl dsp:max-w-6xl gap-6 dsp:gap-12 flex-col dsp:flex-row dsp:items-center"
      aria-labelledby="meeting-title"
      aria-describedby="meeting-description"
      id={appConfig.contactSection.id}
    >
      <div className="w-full">
        <h2 id="meeting-title" className="text-h2 font-500">
          Umów spotkanie
        </h2>
        <p id="meeting-description" className="text-regular font-300 mt-8">
          Wspólnie opracujemy plan działania, który przybliży Cię do Twoich
          celów.
        </p>
        <div className="mt-8 min-h-[14rem]" aria-live="polite">
          {currentTestimonial && (
            <div key={currentIndex} className="testimonial-slide-in">
              <Testimonial
                content={currentTestimonial.content}
                avatar={currentTestimonial.avatar}
                name={currentTestimonial.name}
                contentClassName="line-clamp-4"
              />
            </div>
          )}
        </div>
      </div>

      <section
        aria-labelledby="meeting-form-title"
        aria-describedby="meeting-form-description"
        className="w-full"
      >
        <h3 id="meeting-form-title" className="text-h3 font-500">
          Wybierz plan
        </h3>
        <p
          id="meeting-form-description"
          className="text-regular font-300 mt-8 mb-8"
        >
          Wybierz plan, który najbardziej odpowiada Twoim potrzebom. Po
          kliknięciu w przycisk{' '}
          <strong className="font-500">Zarezerwuj spotkanie</strong>, zostaniesz
          przekierowany do{' '}
          <strong className="font-500">kalendarza Google</strong>, gdzie możesz
          wybrać datę i czas spotkania.
        </p>
        <Select.Root
          value={selectedPlan}
          onValueChange={(value) => setSelectedPlan(value as PlanType)}
        >
          <Select.Trigger
            aria-label="Pokaż plany"
            className="max-w-[320px] mt-8"
          >
            <Select.Value placeholder="Wybierz plan" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={defaultSelectedPlan}>Wybierz plan</Select.Item>
            {Object.entries(appConfig.plansSection.plans).map(([key, plan]) => (
              <Select.Item key={key} value={key}>
                {plan.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <p className="text-regular mt-3 font-300 text-foreground-secondary">
          Po rezerwacji terminu po prostu dołącz do spotkania w wybranym dniu i
          godzinie. Komunikacja będzie odbywać się mailowo.
        </p>
        <a
          className="primary-button px-6 py-2.5 mt-8 w-fit block"
          href={paths[selectedPlan].href}
          target={paths[selectedPlan].target}
          rel="noopener noreferrer"
          aria-label="Zarezerwuj spotkanie"
          title="Zarezerwuj spotkanie"
        >
          {paths[selectedPlan].label}
        </a>
      </section>
    </section>
  );
};

export { MeetingSection };
