const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

type ArticleTileProps = {
  cdate: string;
  name: string;
  url: string;
  id: string;
};

const ArticleTile = ({ name, cdate, url }: ArticleTileProps) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-[1px] rounded-xl bg-gradient-to-r from-[#111311] via-[#08140f] to-[#010F09] block"
    >
      <article
        className="flex flex-col rounded-xl p-4 mbl:p-6 bg-[#060807]"
        aria-label={`Przeczytaj publikację: ${name}`}
      >
        <header className="flex flex-col gap-2">
          <time
            className="text-small text-foreground-secondary"
            dateTime={cdate}
          >
            {formatDate(cdate)}
          </time>
          <h3 className="text-h5 font-500 line-clamp-2">{name}</h3>
        </header>
      </article>
    </a>
  );
};

export type { ArticleTileProps };
export { ArticleTile };
