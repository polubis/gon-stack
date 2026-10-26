import { copy } from './copy';

const Paragraph = ({
  parts,
}: {
  parts: (typeof copy.sections)[number]['paragraphs'][number];
}) =>
  typeof parts === 'string'
    ? parts
    : parts.map((part) =>
        typeof part === 'string' ? (
          part
        ) : (
          <a
            key={part.href}
            href={part.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline"
          >
            {part.label}
          </a>
        ),
      );

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
              key={typeof paragraph === 'string' ? paragraph : paragraph.join()}
              className="text-sm leading-relaxed text-ink-light"
            >
              <Paragraph parts={paragraph} />
            </p>
          ))}
        </div>
      </div>
    ))}
  </div>
);
