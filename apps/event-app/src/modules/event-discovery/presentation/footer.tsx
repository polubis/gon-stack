import { Text } from '@/libs/ui/text';

const DISCOVER_LINKS = [
  'Koncerty',
  'Festiwale',
  'Sport',
  'Teatr i opera',
  'Wystawy',
  'Stand-up',
  'Kluby',
];
const CITY_LINKS = [
  'Warszawa',
  'Kraków',
  'Wrocław',
  'Poznań',
  'Gdańsk',
  'Łódź',
  'Katowice',
];
const ORG_LINKS = [
  'Dodaj wydarzenie',
  'Panel organizatora',
  'Kalendarz publiczny',
  'API · pl',
  'Pomoc',
];

type FooterColProps = {
  heading: string;
  items: string[];
};

const FooterCol = ({ heading, items }: FooterColProps) => (
  <div className="flex flex-col gap-3">
    <Text.MonoLabel className="text-white/50">{heading}</Text.MonoLabel>
    <ul className="list-none p-0 m-0 flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="text-sm opacity-75 cursor-pointer hover:opacity-100 hover:text-coral transition-[opacity,color]"
        >
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export const Footer = () => (
  <footer className="bg-primary text-on-primary pt-20 px-8 pb-8 mt-16">
    <div className="max-w-360 mx-auto grid gap-12 grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-3">
        <Text.FooterBrand as="div">
          Afisz<span className="text-coral">.</span>
        </Text.FooterBrand>
        <p className="text-white/70 text-sm max-w-[32ch] m-0">
          Cała Polska na żywo. Promocja wydarzeń, nie sprzedaż biletów.
        </p>
        <Text.MonoLabel className="text-white/40">
          WYD. 2026 · WERSJA ALPHA
        </Text.MonoLabel>
      </div>
      <FooterCol heading="ODKRYWAJ" items={DISCOVER_LINKS} />
      <FooterCol heading="MIASTA" items={CITY_LINKS} />
      <FooterCol heading="ORGANIZATORZY" items={ORG_LINKS} />
    </div>
    <div className="max-w-360 mx-auto mt-14 pt-6 border-t border-white/15 flex justify-between gap-6 text-xs opacity-60">
      <span>© 2026 Afisz · Polska</span>
      <span>Regulamin · Prywatność · Cookies · Kontakt</span>
    </div>
  </footer>
);
