import { appConfig } from '../configuration/constraints';

const steps = [
  {
    num: 1,
    title: 'Spotkanie zapoznawcze',
    desc: 'Poznajemy Twoje cele i obecny poziom, aby wyznaczyć właściwy kierunek rozwoju.',
    glass: {
      backgroundColor: 'rgba(11, 27, 18, 0.72)',
      backdropFilter: 'blur(6px)',
    },
  },
  {
    num: 2,
    title: 'Wybór planu',
    desc: 'Dobieramy plan, tempo i zasady działania, które Ci odpowiadają.',
    glass: {
      backgroundColor: 'rgba(11, 27, 18, 0.62)',
      backdropFilter: 'blur(8px)',
    },
  },
  {
    num: 3,
    title: 'Określenie celów',
    desc: 'Ustalamy cele krótko- i długoterminowe oraz mierniki postępu.',
    glass: {
      backgroundColor: 'rgba(11, 27, 18, 0.78)',
      backdropFilter: 'blur(5px)',
    },
  },
  {
    num: 4,
    title: 'Wspólna nauka i materiały',
    desc: 'Uczymy się razem, pracujemy nad projektem i korzystamy z materiałów.',
    glass: {
      backgroundColor: 'rgba(11, 27, 18, 0.66)',
      backdropFilter: 'blur(9px)',
    },
  },
] as const;

const LearningProcessSection = () => (
  <section
    className="fluid page-section"
    aria-labelledby="learning-process-title"
    id={appConfig.learningProcessSection.id}
  >
    <div className="text-center">
      <h2 className="text-h2 font-500" id="learning-process-title">
        Jak wygląda proces współpracy?
      </h2>
      <p className="text-regular font-300 text-foreground-secondary mt-6 max-w-2xl mx-auto">
        Przejrzysty proces, który prowadzi Cię krok po kroku od pierwszej
        rozmowy do realnych efektów.
      </p>
    </div>

    <div className="relative mt-16">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="radial-flare size-56 -top-10 left-[8%] ltp:top-[10%] ltp:left-[2%]" />
        <div className="radial-flare size-64 -bottom-12 right-[4%] ltp:bottom-[5%] ltp:right-[6%]" />
      </div>
      <div
        className="absolute left-[12.5%] right-[12.5%] top-[3.25rem] h-px bg-gradient-to-r from-foreground-secondary via-primary-400 to-foreground-secondary hidden ltp:block"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-foreground-secondary via-primary-400 to-foreground-secondary ltp:hidden"
        aria-hidden="true"
      />

      <ol
        className="relative flex flex-col gap-6 ltp:grid ltp:grid-cols-4 ltp:gap-6"
        aria-label="Proces współpracy krok po kroku"
      >
        {steps.map(({ num, title, desc, glass }) => (
          <li
            key={num}
            className="relative flex items-start gap-4 ltp:flex-col ltp:items-center ltp:text-center rounded-xl p-[1px] bg-gradient-to-b from-background via-primary-500/20 to-background ltp:bg-gradient-to-r w-full max-w-[420px] mx-auto max-h-[240px] ltp:max-h-none ltp:max-w-none ltp:mx-0"
          >
            <div
              className="flex flex-col items-center text-center gap-4 rounded-xl px-5 py-6 h-full"
              style={glass}
            >
              <div
                className="relative z-1 flex items-center justify-center size-14 rounded-full border border-primary-400 text-h4 font-500 text-primary-500"
                aria-hidden="true"
              >
                {num}
              </div>
              <div className="relative z-1">
                <h3 className="text-h5 font-500">{title}</h3>
                <p className="text-regular font-300 text-foreground-secondary mt-2">
                  {desc}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>

    <div className="flex justify-center mt-12">
      <a
        className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-[#091610] rounded-full text-regular-bold font-500 shadow-[0_0_16px_2px_rgba(1,120,70,0.6)] hover:shadow-[0_0_20px_4px_rgba(1,120,70,0.8)] transition-shadow"
        href={appConfig.contactSection.calendarLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Umów pierwsze spotkanie zapoznawcze"
        title="Umów pierwsze spotkanie zapoznawcze"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="text-[#091610]"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
        <span>Poznajmy się!</span>
      </a>
    </div>
  </section>
);

export { LearningProcessSection };
