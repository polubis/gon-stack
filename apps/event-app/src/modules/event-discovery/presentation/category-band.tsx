import { IconArrow } from './icons';
import { CATEGORIES, EVENTS } from './mock-data';
import { Text } from '@/libs/ui/text';

type CategoryBandProps = {
  onPick: (categoryId: string) => void;
};

export const CategoryBand = ({ onPick }: CategoryBandProps) => (
  <section className="px-8 pb-12 max-w-360 mx-auto">
    <div className="flex justify-between items-end gap-8 mt-18 mb-7">
      <div>
        <Text.MonoLabel>KATEGORIE</Text.MonoLabel>
        <Text.SectionHeading className="mt-2 max-w-180">
          Wybierz, co lubisz najbardziej.
        </Text.SectionHeading>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {CATEGORIES.map((c) => {
        const count = EVENTS.filter((e) => e.category === c.id).length;
        return (
          <button
            key={c.id}
            className="group relative bg-card-bg border border-card-border-c rounded-[14px] p-5 text-left text-ink flex flex-col gap-2 min-h-32.5 transition-colors hover:bg-primary hover:text-on-primary"
            onClick={() => onPick(c.id)}
          >
            <Text.MonoLabel className="text-coral">{c.mono}</Text.MonoLabel>
            <Text.CategoryHeading as="div">{c.label}</Text.CategoryHeading>
            <div className="text-muted text-sm group-hover:text-on-primary/70 transition-colors">
              {count} wydarzeń
            </div>
            <div className="absolute top-5 right-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-[transform,opacity]">
              <IconArrow size={18} />
            </div>
          </button>
        );
      })}
    </div>
  </section>
);
