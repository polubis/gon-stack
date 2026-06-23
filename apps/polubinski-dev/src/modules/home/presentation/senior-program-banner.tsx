import { appConfig } from '../configuration/constraints';

const SeniorProgramBanner = () => (
  <div
    className="bg-gradient-to-r relative from-[#111311] via-[#08140f] to-[#010F09]"
    role="banner"
    aria-label="Informacja o kursie senior w rok"
  >
    <p className="fluid text-center py-3 text-regular font-300">
      Chcesz awansować na <strong className="font-500">Seniora</strong> w rok?{' '}
      <br className="md:hidden" />
      <a
        href={`#${appConfig.plansSection.id}`}
        className="underline"
        aria-label="Przejdź do sekcji z programem senior w rok"
      >
        Sprawdź program
      </a>
    </p>
  </div>
);

export { SeniorProgramBanner };
