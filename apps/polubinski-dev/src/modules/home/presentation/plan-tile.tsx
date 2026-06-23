import type { ReactNode } from 'react';

type PlanTileProps = {
  button: {
    label: string;
    href: string;
    title: string;
    target?: '_blank';
  };
  price: {
    label: string;
    description:
      | string
      | {
          label: string;
          href: string;
          title?: string;
          target?: '_blank';
        };
    id: string;
  };
  heading: {
    title: { label: string; id: string };
    description: { label: string; id: string };
  };
  benefits: {
    title: string;
    items: string[];
  };
  flare?: ReactNode;
  icon?: ReactNode;
};

const PlanTile = ({
  button,
  price,
  heading,
  benefits,
  flare,
  icon,
}: PlanTileProps) => (
  <article
    className="p-[1px] max-w-[400px] rounded-xl bg-gradient-to-r relative from-[#111311] via-[#08140f] to-[#010F09] before:rounded-full before:absolute before:top-[-1px] before:mx-auto before:left-0 before:right-0 before:w-[30%] before:h-[1px] before:bg-gradient-to-r before:from-[#191A19] before:via-[#0CC776] before:to-[#191A19]"
    aria-labelledby={heading.title.id}
    aria-describedby={heading.description.id}
  >
    <div className="flex h-full overflow-hidden flex-col items-center px-6 pt-8 pb-6 bg-[#060807] rounded-xl relative">
      {flare}

      <header className="flex flex-col items-center z-1">
        <figure>{icon}</figure>
        <h3
          id={heading.title.id}
          className="text-h4 font-500 mt-2 mb-2 uppercase"
        >
          {heading.title.label}
        </h3>
        <p
          id={heading.description.id}
          className="text-small font-400 text-foreground-secondary"
        >
          {heading.description.label}
        </p>
      </header>

      <ul
        aria-label={benefits.title}
        className="mt-6 flex flex-col gap-2 mb-14 z-1"
      >
        {benefits.items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-left">
            <span aria-hidden="true">•</span>
            <span className="text-regular font-400">{item}</span>
          </li>
        ))}
      </ul>

      <footer className="flex flex-col justify-center mt-auto z-1">
        <div aria-labelledby={price.id}>
          <p>
            <strong id={price.id} className="text-h4 font-500">
              {price.label}
            </strong>
          </p>
          <p
            aria-describedby={price.id}
            className="text-small font-400 mt-2 mb-6"
          >
            {typeof price.description === 'string' ? (
              price.description
            ) : (
              <a
                href={price.description.href}
                className="text-foreground-secondary underline underline-offset-4"
                title={price.description.title ?? price.description.label}
                target={price.description.target}
                rel={
                  price.description.target === '_blank'
                    ? 'noopener noreferrer'
                    : undefined
                }
              >
                {price.description.label}
              </a>
            )}
          </p>
          <a
            href={button.href}
            className="primary-button block text-center px-6 py-2.5"
            title={button.title}
            target={button.target}
            rel="noopener noreferrer"
          >
            {button.label}
          </a>
        </div>
      </footer>
    </div>
  </article>
);

export { PlanTile };
export type { PlanTileProps };
