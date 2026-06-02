import { CATEGORIES } from './mock-data';

type CategoryChipsProps = {
  value: string;
  onChange: (id: string) => void;
  scrollable?: boolean;
};

export const CategoryChips = ({
  value,
  onChange,
  scrollable = true,
}: CategoryChipsProps) => (
  <div
    className={`flex gap-2 ${scrollable ? 'flex-nowrap overflow-x-auto pb-1' : 'flex-wrap'}`}
  >
    <button
      className={`border rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors ${!value ? 'bg-ink text-canvas border-ink' : 'bg-canvas border-card-border text-ink hover:border-ink'}`}
      onClick={() => onChange('')}
    >
      Wszystkie
    </button>
    {CATEGORIES.map((c) => (
      <button
        key={c.id}
        className={`border rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors ${value === c.id ? 'bg-ink text-canvas border-ink' : 'bg-canvas border-card-border text-ink hover:border-ink'}`}
        onClick={() => onChange(c.id)}
      >
        {c.label}
      </button>
    ))}
  </div>
);
