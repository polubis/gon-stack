import { copy } from './copy';

export const Content = () => (
  <div className="space-y-10">
    {copy.sections.map((section) => (
      <div key={section.id} id={section.id} className="scroll-mt-28">
        <h2 className="font-display text-xl font-bold text-secondary">
          {section.title}
        </h2>
        <div className="mt-3 space-y-3">
          {section.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="text-sm leading-relaxed text-ink-light"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    ))}
  </div>
);
