import { Text } from '@/libs/ui/text';

export const ManifestBand = () => (
  <section className="bg-deep-green text-on-primary py-20 px-8 rounded-lg mx-8 mt-8 mb-0">
    <div className="max-w-7xl mx-auto">
      <Text.MonoLabel className="text-coral">AFISZ · MANIFEST</Text.MonoLabel>
      <Text.ManifestHeading className="mt-4 mb-14 max-w-[14ch]">
        Nie sprzedajemy biletów.
        <br />
        Pomagamy je <em className="italic text-coral">znaleźć</em>.
      </Text.ManifestHeading>
      <div className="grid grid-cols-1 gap-8 border-t border-white/20 pt-8 lg:grid-cols-3">
        <div className="flex flex-col gap-2.5">
          <Text.MonoLabel className="text-coral">01 · OTWARTOŚĆ</Text.MonoLabel>
          <p className="text-white/80 text-base leading-relaxed m-0">
            Każde wydarzenie w Polsce — duże i małe, klubowe i stadionowe — w
            jednym miejscu, bez priorytetu dla płacących.
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <Text.MonoLabel className="text-coral">02 · LOKALNOŚĆ</Text.MonoLabel>
          <p className="text-white/80 text-base leading-relaxed m-0">
            Filtrujesz po mieście, dzielnicy, dniu tygodnia. Afisz pokaże ci, co
            dzieje się dziś za rogiem i w sąsiednim województwie.
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <Text.MonoLabel className="text-coral">
            03 · BEZ POŚREDNIKÓW
          </Text.MonoLabel>
          <p className="text-white/80 text-base leading-relaxed m-0">
            Klikasz &quot;Idę&quot;, organizator widzi zainteresowanie. Sprzedaż
            biletów odbywa się u źródła — nie u nas.
          </p>
        </div>
      </div>
    </div>
  </section>
);
