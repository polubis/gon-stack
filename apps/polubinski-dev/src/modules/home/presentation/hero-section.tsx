import { useEffect, useRef } from 'react';
import { appConfig } from '../configuration/constraints';
import { createMilkyWay } from './milky-way';
import { Planet } from './planet';
import { Glass } from './glass';

const HeroSection = () => {
  const milkyWayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (milkyWayRef.current) {
      createMilkyWay(`#hero-milky-way`);
    }
  }, []);

  return (
    <section
      className="relative fluid page-section grid items-center gap-12 grid-rows-[auto_auto] justify-center ltp:grid-cols-2 ltp:grid-rows-1"
      aria-labelledby="hero-title"
    >
      <div>
        <div
          id="hero-milky-way"
          ref={milkyWayRef}
          className="absolute inset-0 size-full overflow-hidden rounded-full -z-1"
          aria-hidden="true"
        />
        <h1
          id="hero-title"
          className="text-h1 font-500 max-w-lg mbl:max-w-xl tbt:max-w-2xl"
        >
          Zagubiony w świecie IT? Naprawmy to!
          <span
            className="bg-primary-500 h-1.5 w-7 inline-block"
            aria-hidden="true"
          />
        </h1>
        <p className="text-regular mt-6 font-300 sbl:max-w-xl">
          Utknąłeś w IT? Skorzystaj z konsultacji i mentoringu, który pomoże Ci
          awansować na poziom <strong className="font-500">Juniora</strong>,{' '}
          <strong className="font-500">Mida</strong> lub{' '}
          <strong className="font-500">Seniora</strong>. Pomogę Ci również
          rozwinąć umiejętności miękkie – kluczowe w każdej roli.
        </p>
        <p className="text-regular mt-2 font-300 sbl:max-w-xl">
          Oferuję mentoring w różnych formach i technologiach –{' '}
          <strong className="font-500">React</strong>,{' '}
          <strong className="font-500">Angular</strong>,{' '}
          <strong className="font-500">TypeScript</strong>,{' '}
          <strong className="font-500">Node.js</strong>,{' '}
          <strong className="font-500">Google Cloud</strong> i nie tylko.
          Wspólnie zmierzymy się z każdym wyzwaniem.
        </p>
        <a
          className="relative flex items-center pl-13.5 pr-6.5 w-fit h-11 group mt-7"
          href={`#${appConfig.plansSection.id}`}
          aria-label="Wybierz ścieżkę rozwoju"
        >
          <div
            className="absolute left-0 top-0 bottom-0 my-auto bg-primary-500 size-11 rounded-full border border-primary-400 transition-all shadow-[0_0_16px_2px_rgba(1,120,70,0.6)] group-hover:w-full group-hover:shadow-[0_0_16px_2px_rgba(1,120,70,0.9)]"
            aria-hidden="true"
          />
          <div
            className="absolute transition-transform flex justify-center items-center left-0 top-0 bottom-0 my-auto size-11 text-[#091610] text-regular-bold font-500 group-hover:translate-x-3.5"
            aria-hidden="true"
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
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
          <span className="text-regular-bold font-500 drop-shadow-[0_0_11.9px_rgba(0,131,74,0.9)] transition-colors group-hover:text-[#091610]">
            Wybierz plan
          </span>
        </a>
      </div>

      <div className="relative aspect-square mx-4" aria-hidden="true">
        <div className="nova-boom absolute opacity-0 inset-0 m-auto size-full rounded-full" />
        <div className="nova-pulse absolute opacity-0 inset-0 m-auto size-full rounded-full" />
        <Planet className="absolute inset-0 m-auto size-[70%] move-eclipse" />
        <Glass className="absolute inset-0 m-auto size-[90%]" />
      </div>
    </section>
  );
};

export { HeroSection };
