import { appConfig } from '../configuration/constraints';
import { MATERIALS_MOCK } from '../integration/repository';

const MaterialsSection = () => (
  <section
    className="fluid page-section flex flex-col justify-center"
    id={appConfig.materialsSection.id}
    aria-labelledby="materials-heading"
  >
    <header className="flex gap-4 flex-col mbl:flex-row mbl:justify-between mbl:items-end mb-13">
      <h2 id="materials-heading" className="text-h2 font-500">
        Materiały
      </h2>
      <a
        href={appConfig.materialsSection.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-regular-bold text-left font-500 cursor-pointer hover:text-white transition-colors duration-300 ease-in-out"
      >
        Wszystkie materiały
      </a>
    </header>

    <ol
      aria-label="Lista dostępnych materiałów"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr"
    >
      {MATERIALS_MOCK.map((material, index) => {
        const isGoldenTile = material.id === 'senior-in-year-mindmap';
        return (
          <li
            key={material.id}
            className={`p-[1px] relative rounded-xl ${isGoldenTile ? 'golden-tile-border' : 'bg-gradient-to-r from-[#111311] via-[#08140f] to-[#010F09]'}`}
          >
            <a
              href={material.url}
              className="p-6 flex flex-col h-full overflow-hidden rounded-xl bg-background relative"
              target="_blank"
              rel="noopener noreferrer"
              aria-describedby={`description-${material.id}`}
            >
              <div
                className={`size-30 ${isGoldenTile ? '' : 'radial-flare'}`}
                style={{
                  top: `${((index * 25) % 75) + 10}%`,
                  right: `${((index * 30) % 70) + 15}%`,
                  ...(isGoldenTile
                    ? {
                        position: 'absolute',
                        borderRadius: '9999px',
                        filter: 'blur(48px)',
                        backgroundColor: '#d4af3755',
                      }
                    : {}),
                }}
                aria-hidden="true"
              />
              <article
                aria-labelledby={`material-title-${material.id}`}
                className="flex flex-col h-full"
              >
                <header className="mb-4">
                  <h3
                    id={`material-title-${material.id}`}
                    className={`mb-2 text-h4 font-500 ${isGoldenTile ? 'text-[#d4af37]' : ''}`}
                  >
                    {material.title}
                  </h3>
                  <p
                    id={`description-${material.id}`}
                    className="text-regular font-300"
                  >
                    {material.description}
                  </p>
                </header>
                <footer className="mt-auto pt-6">
                  <p
                    className={`text-h5 font-500 ${isGoldenTile ? 'text-[#d4af37]' : ''}`}
                  >
                    {material.price}
                  </p>
                </footer>
              </article>
            </a>
          </li>
        );
      })}
    </ol>
  </section>
);

export { MaterialsSection };
