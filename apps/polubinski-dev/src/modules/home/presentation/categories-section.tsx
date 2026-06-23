import { appConfig } from '../configuration/constraints';

const categories = [
  { label: 'Frontend', delay: '4s' },
  { label: 'Backend', delay: '11s' },
  { label: 'AI', delay: '22s' },
  { label: 'Software Development', delay: '13s' },
  { label: 'Soft Skills', delay: '5s' },
  { label: 'Fullstack', delay: '2s' },
  { label: 'DevOps', delay: '15s' },
  { label: 'Q&A', delay: '30s' },
  { label: 'Bazy danych', delay: '2s' },
  { label: 'Algorytmy i struktury danych', delay: '4s' },
];

const CategoriesSection = () => (
  <section
    className="fluid page-section flex flex-col justify-center items-center text-center"
    aria-labelledby="progress-title"
    id={appConfig.specializationsSection.id}
  >
    <h2 id="progress-title" className="text-h2 font-500 max-w-xl">
      Stoisz w miejscu i nie wiesz, jak zrobić kolejny krok?
    </h2>
    <p className="text-regular font-300 mt-8 mb-13">
      Pomogę Ci rozwinąć umiejętności i poszerzyć wiedzę w wielu dziedzinach IT.
    </p>
    <div className="relative">
      <div
        className="absolute bg-[rgba(21,214,131,0.08)] blur-3xl w-full h-full"
        aria-hidden="true"
      />
      <ul
        aria-label="Kategorie specjalizacji"
        className="flex flex-wrap justify-center gap-6 max-w-[600px] relative"
      >
        {categories.map(({ label, delay }) => (
          <li
            key={label}
            className="before:animate-fade-in-out before:opacity-0 text-regular-bold font-500 px-4 py-2 rounded-xl relative border border-[#212923] bg-black/2 before:absolute before:top-[-1px] before:mx-auto before:left-0 before:right-0 before:w-6 before:h-[1px] before:bg-gradient-to-r before:from-[#373838] before:via-[#0CC776] before:to-[#383838]"
            style={{ ['--tw-animate-delay' as string]: delay }}
          >
            {label}
          </li>
        ))}
      </ul>
    </div>

    <div className="flex justify-center mt-12">
      <a
        className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-[#091610] rounded-full text-regular-bold font-500 shadow-[0_0_16px_2px_rgba(1,120,70,0.6)] hover:shadow-[0_0_20px_4px_rgba(1,120,70,0.8)] transition-shadow"
        href={appConfig.specializationsSection.technologiesLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Zobacz pełną listę technologii i obszarów wsparcia"
        title="Zobacz pełną listę technologii i obszarów wsparcia"
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
        <span>Sprawdź moją wiedzę</span>
      </a>
    </div>
  </section>
);

export { CategoriesSection };
