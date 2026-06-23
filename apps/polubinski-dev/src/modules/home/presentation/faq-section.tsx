import { Accordion } from '@/libs/ui/accordion';
import { appConfig } from '../configuration/constraints';

const FaqSection = () => {
  return (
    <section
      className="fluid page-section flex justify-between max-w-xl dsp:max-w-6xl gap-12 flex-col dsp:flex-row dsp:items-center"
      aria-labelledby="faq-title"
      id={appConfig.faqSection.id}
      aria-describedby="faq-description"
    >
      <div className="w-full">
        <h2 id="faq-title" className="text-h2 font-500">
          FAQ
        </h2>
        <p id="faq-description" className="text-regular font-300 mt-8 mb-8">
          Jeśli nie znajdziesz tu odpowiedzi na swoje pytanie, śmiało skontaktuj
          się ze mną.
        </p>
        <a
          href={appConfig.contactSection.linkedInLink}
          target="_blank"
          rel="noreferrer"
          title="Skontaktuj się ze mną"
          aria-label="Skontaktuj się ze mną"
          className="block mt-12 w-fit bg-background border-foreground border rounded-full px-6 py-2.5 transition-all hover:shadow-[0_0_16px_2px_rgba(255,255,255,0.3)]"
        >
          Skontaktuj się
        </a>
      </div>

      <div className="w-full">
        <Accordion.Root type="single" collapsible className="w-full">
          <Accordion.Item value="item-1">
            <Accordion.Trigger>
              Na jakim etapie kariery programisty najlepiej rozpocząć mentoring?
            </Accordion.Trigger>
            <Accordion.Content>
              Mentoring można rozpocząć na każdym etapie kariery. Dla
              początkujących będzie wsparciem w zdobywaniu fundamentalnej
              wiedzy, dla średniozaawansowanych pomoże w specjalizacji, a dla
              doświadczonych w rozwoju umiejętności liderskich i technicznych.
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="item-2">
            <Accordion.Trigger>
              Jak długo trwa typowy proces mentoringowy, aby osiągnąć konkretne
              cele?
            </Accordion.Trigger>
            <Accordion.Content>
              <span>
                Czas trwania procesu mentoringowego zależy od wybranego planu i
                Twoich preferencji. Jeżeli Twoja sytuacja tego wymaga, chętnie
                dostosujemy plan do Twoich indywidualnych potrzeb.
              </span>
              <a
                href={appConfig.contactSection.linkedInLink}
                target="_blank"
                rel="noreferrer"
                title="Skontaktuj się ze mną"
                aria-label="Skontaktuj się ze mną"
                className="block mt-6 w-fit bg-background border-foreground border rounded-full px-6 py-2.5"
              >
                Zapraszam do kontaktu
              </a>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="item-3">
            <Accordion.Trigger>
              Jakie techniki używasz, aby pomóc w budowaniu pewności siebie
              programistów?
            </Accordion.Trigger>
            <Accordion.Content>
              <span className="block">
                Stosuję podejście oparte na małych sukcesach, code review z
                konstruktywną informacją zwrotną, praktyczne zadania dostosowane
                do poziomu umiejętności oraz regularne retrospektywy postępów.
                Kluczowe jest stworzenie bezpiecznej przestrzeni do
                eksperymentowania i nauki na błędach.
              </span>
              <span className="block my-2">
                Dodatkowo, wykorzystujemy naukowo potwierdzone metody wspólnej
                nauki i priorytetyzacji zadań (jak tablica Eisenhowera,
                &bdquo;Świadomy dzień&rdquo;, planowanie strategiczne i
                taktyczne), aby osiągnąć efekty jak najszybciej. Więcej o tym,
                jak działamy w mentoringu możesz przeczytać w artykule:
              </span>
              <a
                href="https://4markdown.com/how-to-be-productive-as-a-software-engineer/"
                className="underline block"
                target="_blank"
                rel="noreferrer"
              >
                How to be productive as a software engineer
              </a>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="item-4">
            <Accordion.Trigger>
              Czy mentoring jest dostosowany do indywidualnych potrzeb, czy
              obejmuje standardowy plan nauki?
            </Accordion.Trigger>
            <Accordion.Content>
              Mentoring jest zawsze dostosowany do indywidualnych potrzeb. Na
              początku definiujemy cele i oczekiwania, na podstawie których
              tworzony jest spersonalizowany plan rozwoju. Podążamy za Twoimi
              priorytetami, jednocześnie dbając o całościowy rozwój
              umiejętności.
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="item-5">
            <Accordion.Trigger>
              Jakie są Twoje metody oceny, czy mentoring jest skuteczny i
              przynosi oczekiwane rezultaty?
            </Accordion.Trigger>
            <Accordion.Content>
              Regularnie mierzymy postępy względem ustalonych celów, stosujemy
              cykliczne retrospektywy, zbieramy metryki wydajności (jeśli to
              możliwe) oraz oceniamy jakościowe zmiany w podejściu do
              rozwiązywania problemów. Ważnym elementem jest również samoocena
              podopiecznego i informacja zwrotna z jego środowiska pracy.
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
        <a
          href="https://4markdown.com/document-preview/?id=feb23856-363e-4f61-9cfe-4f490dfed0de"
          target="_blank"
          rel="noreferrer"
          className="underline block mt-8"
          title="Zobacz wszystkie pytania"
        >
          Zobacz wszystkie pytania
        </a>
      </div>
    </section>
  );
};

export { FaqSection };
