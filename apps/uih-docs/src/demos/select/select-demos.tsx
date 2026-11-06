import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { Minus, Plus, Volume2, VolumeX } from 'lucide-react';
import { createSelect, Select, type SelectRootProps } from '@repo/uih/select';
import { selectStream, type SelectEvent } from '@repo/uih/select-stream';
import { syncSelectsWithUrl } from '@/integration/select-url';

const FRUITS = ['Apple', 'Banana', 'Blueberry', 'Cherry', 'Mango', 'Peach'];

const COUNTRIES = [
  'Argentina',
  'Australia',
  'Austria',
  'Belgium',
  'Brazil',
  'Canada',
  'Chile',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Germany',
  'Iceland',
  'Japan',
  'Norway',
  'Poland',
  'Portugal',
  'Spain',
  'Sweden',
];

const NEW_TAGS = ['Urgent', 'Home', 'Work', 'Errands', 'Health', 'Travel'];

type Person = { id: string; name: string; role: string };

const PEOPLE: Person[] = [
  { id: 'p1', name: 'Ada Lovelace', role: 'Analyst' },
  { id: 'p2', name: 'Grace Hopper', role: 'Admiral' },
  { id: 'p3', name: 'Linus Torvalds', role: 'Maintainer' },
  { id: 'p4', name: 'Margaret Hamilton', role: 'Director' },
];

const PersonSelect = createSelect<Person>();

type PickerProps = Omit<SelectRootProps<string>, 'children'> & {
  label: string;
  items: readonly string[];
  search?: boolean;
  footer?: ReactNode;
};

/** Standard composition of the parts, reused by most demos. */
const Picker = ({ label, items, search, footer, ...root }: PickerProps) => {
  const [query, setQuery] = useState('');
  const phrase = query.trim().toLowerCase();
  const shown = items.filter((item) => item.toLowerCase().includes(phrase));
  return (
    <Select.Root {...root} onQueryChange={setQuery}>
      <Select.Label>{label}</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.Value placeholder={`Choose ${label.toLowerCase()}`} />
        </Select.Trigger>
        <Select.Clear aria-label={`Clear ${label.toLowerCase()}`} />
        <Select.Icon />
      </Select.Control>
      <Select.Content title={label}>
        {search ? (
          <Select.Search placeholder={`Search ${label.toLowerCase()}`} />
        ) : null}
        <Select.List items={shown}>
          {(item) => (
            <Select.Item value={item}>
              {item}
              <Select.ItemIndicator />
            </Select.Item>
          )}
        </Select.List>
        <Select.Empty>
          {query.trim() === ''
            ? 'Nothing to pick yet'
            : `No results for "${query.trim()}"`}
        </Select.Empty>
        {footer}
      </Select.Content>
    </Select.Root>
  );
};

export const BasicDemo = () => (
  <Picker
    id="fruit"
    data-e2e="select-demo:basic"
    label="Fruit"
    items={FRUITS}
    defaultValue="Cherry"
  />
);

export const SearchDemo = () => (
  <Picker
    id="country"
    data-e2e="select-demo:search"
    label="Country"
    items={COUNTRIES}
    search
  />
);

export const ObjectDemo = () => {
  const [owner, setOwner] = useState<Person | null>(PEOPLE[1]!);
  return (
    <PersonSelect.Root
      id="owner"
      data-e2e="select-demo:owner"
      value={owner}
      onValueChange={setOwner}
      itemKey={(person) => person.id}
      name="owner"
    >
      <PersonSelect.Label>Owner</PersonSelect.Label>
      <PersonSelect.Control>
        <PersonSelect.Trigger>
          <PersonSelect.Value placeholder="Nobody assigned">
            {(person) => `${person.name} - ${person.role}`}
          </PersonSelect.Value>
        </PersonSelect.Trigger>
        <PersonSelect.Clear aria-label="Clear owner" />
        <PersonSelect.Icon />
      </PersonSelect.Control>
      <PersonSelect.Content title="Owner">
        <PersonSelect.List items={PEOPLE}>
          {(person) => (
            <PersonSelect.Item value={person} className="gap-3">
              <span
                aria-hidden="true"
                className="bg-brand-soft text-brand-ink grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold"
              >
                {person.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{person.name}</span>
                <span className="text-ink-soft text-xs font-normal">
                  {person.role}
                </span>
              </span>
              <PersonSelect.ItemIndicator />
            </PersonSelect.Item>
          )}
        </PersonSelect.List>
      </PersonSelect.Content>
    </PersonSelect.Root>
  );
};

const FOOTER_BUTTON =
  'border-line text-ink hover:bg-brand-soft focus-visible:outline-brand inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export const LiveDemo = () => {
  const [tags, setTags] = useState(['Inbox', 'Later']);
  const next = NEW_TAGS.find((tag) => !tags.includes(tag));
  return (
    <Picker
      id="tag"
      data-e2e="select-demo:live"
      label="Tag"
      items={tags}
      footer={
        <div className="border-line flex gap-2 border-t pt-2">
          <button
            type="button"
            data-e2e="select-demo:live-add"
            className={FOOTER_BUTTON}
            disabled={!next}
            onClick={() => next && setTags([next, ...tags])}
          >
            <Plus aria-hidden="true" className="size-4" /> Add tag
          </button>
          <button
            type="button"
            data-e2e="select-demo:live-remove"
            className={FOOTER_BUTTON}
            disabled={tags.length === 0}
            onClick={() => setTags(tags.slice(1))}
          >
            <Minus aria-hidden="true" className="size-4" /> Remove first
          </button>
        </div>
      }
    />
  );
};

export const SoundDemo = () => {
  const [sound, setSound] = useState(true);
  const Icon = sound ? Volume2 : VolumeX;
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={sound}
        data-e2e="select-demo:sound-toggle"
        onClick={() => setSound(!sound)}
        className="border-line text-ink hover:bg-brand-soft focus-visible:outline-brand inline-flex min-h-11 items-center gap-2 self-start rounded-full border px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Icon aria-hidden="true" className="size-4" />
        Sound effects {sound ? 'on' : 'off'}
      </button>
      <Picker
        id="sound"
        data-e2e="select-demo:sound"
        label="Drink"
        items={['Coffee', 'Tea', 'Matcha', 'Water']}
        sound={sound}
      />
    </div>
  );
};

export const ModalDemo = () => (
  <Picker
    id="size"
    data-e2e="select-demo:modal"
    label="Size"
    items={['Small', 'Medium', 'Large', 'Extra large']}
    mode="modal"
    search
  />
);

export const DarkDemo = () => (
  <div data-theme="dark" className="bg-page rounded-2xl p-4">
    <Picker
      id="dark"
      data-e2e="select-demo:dark"
      label="Fruit"
      items={FRUITS}
      defaultValue="Mango"
    />
  </div>
);

export const DisabledDemo = () => (
  <Picker
    id="locked"
    data-e2e="select-demo:disabled"
    label="Plan"
    items={['Free', 'Pro']}
    defaultValue="Pro"
    disabled
  />
);

/** Same parts, no theme import: proof the component is headless. */
export const HeadlessDemo = () => (
  <Picker
    id="raw"
    data-e2e="select-demo:headless"
    label="Fruit"
    items={FRUITS}
    search
  />
);

const read = (() => {
  let last: SelectEvent | null = null;
  const listeners = new Set<() => void>();
  selectStream.subscribe((event) => {
    last = event;
    listeners.forEach((notify) => notify());
  });
  return {
    subscribe: (notify: () => void) => {
      listeners.add(notify);
      return () => listeners.delete(notify);
    },
    get: () => last,
  };
})();

/** Live view of the global stream + app-side URL sync (`?select=`). */
export const StreamPanel = () => {
  const last = useSyncExternalStore(read.subscribe, read.get, () => null);
  useEffect(() => syncSelectsWithUrl(), []);
  const open = last?.open ?? [];
  return (
    <div className="border-line bg-card sticky top-2 z-(--ds-z-raised) flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border px-4 py-3 text-sm shadow-sm">
      <span>
        Open now:{' '}
        <strong data-e2e="select-demo:stream-count">{open.length}</strong>
      </span>
      <span
        aria-live="polite"
        data-e2e="select-demo:stream-log"
        className="text-ink-soft"
      >
        {last ? `Last: ${last.type} "${last.id}"` : 'Waiting for events'}
      </span>
      <code className="text-ink-soft ml-auto text-xs">
        ?select={open.join(',') || '-'}
      </code>
    </div>
  );
};
