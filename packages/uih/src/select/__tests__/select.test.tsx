import { useState, type ReactNode } from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { createSelect, Select, type SelectOptions } from '../select.js';
import { selectStream, type SelectEvent } from '../select-stream.js';

const FRUITS = ['Apple', 'Banana', 'Blueberry', 'Cherry', 'Date'];

type FruitsProps = Omit<SelectOptions<string>, 'query'> & {
  items?: readonly string[];
  search?: boolean;
  disabledItem?: string;
  title?: ReactNode;
  after?: ReactNode;
};

const Fruits = ({
  items = FRUITS,
  search = false,
  disabledItem,
  title,
  after,
  ...options
}: FruitsProps) => {
  const [query, setQuery] = useState('');
  const shown = items.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Select.Root {...options} onQueryChange={setQuery}>
        <Select.Label>Fruit</Select.Label>
        <Select.Control>
          <Select.Trigger>
            <Select.Value placeholder="Pick a fruit" />
          </Select.Trigger>
          <Select.Clear />
          <Select.Icon />
        </Select.Control>
        <Select.Content title={title}>
          {search ? <Select.Search placeholder="Search fruit" /> : null}
          <Select.List items={shown}>
            {(item) => (
              <Select.Item value={item} disabled={item === disabledItem}>
                {item}
                <Select.ItemIndicator />
              </Select.Item>
            )}
          </Select.List>
          <Select.Empty>{(q) => `No results for "${q}"`}</Select.Empty>
        </Select.Content>
      </Select.Root>
      <button type="button">Outside</button>
      {after}
    </>
  );
};

const trigger = () => screen.getByRole('combobox', { name: /Fruit/ });
const listbox = () => screen.getByRole('listbox');
const active = () =>
  document.getElementById(
    (document.activeElement as HTMLElement).getAttribute(
      'aria-activedescendant',
    ) ?? '',
  )?.textContent;

const mediaMatching = (matches: boolean) => {
  window.matchMedia = (query: string) =>
    ({
      matches,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }) as unknown as MediaQueryList;
};

describe('select works when', () => {
  const user = userEvent.setup();

  afterEach(() => {
    mediaMatching(false);
    window.history.replaceState(null, '');
  });

  it('shows placeholder and opens a labelled listbox on click', async () => {
    render(<Fruits />);
    expect(trigger()).toHaveTextContent('Pick a fruit');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger());
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox', { name: 'Fruit' })).toHaveFocus();
    expect(screen.getAllByRole('option')).toHaveLength(5);
  });

  it('opens from its label', async () => {
    render(<Fruits />);
    await user.click(screen.getByText('Fruit'));
    expect(listbox()).toBeInTheDocument();
  });

  it('picks an option by click, closes and returns focus', async () => {
    const onValueChange = vi.fn();
    render(<Fruits onValueChange={onValueChange} />);
    await user.click(trigger());
    await user.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(onValueChange).toHaveBeenCalledWith('Cherry');
    expect(trigger()).toHaveTextContent('Cherry');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('marks the chosen option as selected on reopen', async () => {
    render(<Fruits defaultValue="Banana" />);
    await user.click(trigger());
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(active()).toBe('Banana');
  });

  it('toggles closed by clicking the trigger again', async () => {
    render(<Fruits />);
    await user.click(trigger());
    await user.click(trigger());
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it.each(['{ArrowDown}', '{ArrowUp}'])(
    'opens with %s from the trigger',
    async (key) => {
      render(<Fruits />);
      await user.tab();
      await user.keyboard('{Shift>}x{/Shift}');
      await user.keyboard(key);
      expect(listbox()).toHaveFocus();
    },
  );

  it('moves through options with arrows, Home, End and pages', async () => {
    render(<Fruits />);
    await user.click(trigger());
    expect(active()).toBe('Apple');
    await user.keyboard('{ArrowUp}');
    expect(active()).toBe('Apple');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(active()).toBe('Blueberry');
    await user.keyboard('{End}');
    expect(active()).toBe('Date');
    await user.keyboard('{ArrowDown}');
    expect(active()).toBe('Date');
    await user.keyboard('{Home}');
    expect(active()).toBe('Apple');
    await user.keyboard('{PageDown}');
    expect(active()).toBe('Date');
    await user.keyboard('{PageUp}');
    expect(active()).toBe('Apple');
  });

  it.each(['{Enter}', ' '])('picks the active option with %j', async (key) => {
    render(<Fruits />);
    await user.click(trigger());
    await user.keyboard('{ArrowDown}');
    await user.keyboard(key);
    expect(trigger()).toHaveTextContent('Banana');
  });

  it('skips disabled options and ignores clicks on them', async () => {
    render(<Fruits disabledItem="Banana" />);
    await user.click(trigger());
    await user.keyboard('{ArrowDown}');
    expect(active()).toBe('Blueberry');
    const banana = screen.getByRole('option', { name: 'Banana' });
    expect(banana).toHaveAttribute('aria-disabled', 'true');
    await user.hover(banana);
    expect(active()).toBe('Blueberry');
    await user.click(banana);
    expect(listbox()).toBeInTheDocument();
  });

  it('follows the pointer', async () => {
    render(<Fruits />);
    await user.click(trigger());
    await user.hover(screen.getByRole('option', { name: 'Date' }));
    await user.hover(screen.getByRole('option', { name: 'Date' }));
    expect(active()).toBe('Date');
  });

  it('jumps by typed letters', async () => {
    render(<Fruits />);
    await user.click(trigger());
    await user.keyboard('bl');
    expect(active()).toBe('Blueberry');
    await new Promise((done) => setTimeout(done, 550));
    await user.keyboard('c');
    expect(active()).toBe('Cherry');
    await user.keyboard('z');
    expect(active()).toBe('Cherry');
    await user.keyboard('{Control>}d{/Control}');
    expect(active()).toBe('Cherry');
  });

  it('closes on Escape and returns focus', async () => {
    const onKeyDown = vi.fn();
    render(
      <div onKeyDown={onKeyDown}>
        <Fruits />
      </div>,
    );
    await user.click(trigger());
    onKeyDown.mockClear();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it('closes on outside click without stealing focus', async () => {
    render(<Fruits />);
    await user.click(trigger());
    await user.click(listbox());
    expect(listbox()).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
  });

  it('closes when Tab leaves the popover', async () => {
    render(<Fruits />);
    await user.click(trigger());
    await user.tab();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('clears the value with the x button and refocuses the trigger', async () => {
    const onValueChange = vi.fn();
    render(<Fruits defaultValue="Date" onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(trigger()).toHaveTextContent('Pick a fruit');
    expect(trigger()).toHaveFocus();
    expect(
      screen.queryByRole('button', { name: 'Clear selection' }),
    ).not.toBeInTheDocument();
  });

  it('is fully disabled', async () => {
    render(<Fruits disabled id="off" defaultValue="Date" />);
    expect(trigger()).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Clear selection' }),
    ).not.toBeInTheDocument();
    act(() => selectStream.open('off'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders closed popover markup on the server', () => {
    const html = renderToString(<Fruits defaultValue="Date" />);
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-mode="popover"');
    expect(html).toContain('Date');
  });

  it('exposes required state', () => {
    render(<Fruits required />);
    expect(trigger()).toHaveAttribute('aria-required', 'true');
  });

  it('supports controlled value and open state', async () => {
    const onOpenChange = vi.fn();
    const Controlled = () => {
      const [value, setValue] = useState<string | null>('Apple');
      return (
        <Fruits
          value={value}
          onValueChange={setValue}
          open
          onOpenChange={onOpenChange}
        />
      );
    };
    render(<Controlled />);
    expect(listbox()).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Date' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(listbox()).toBeInTheDocument();
    expect(trigger()).toHaveTextContent('Date');
  });
});

describe('select search works when', () => {
  const user = userEvent.setup();

  it('focuses search on open and filters with active option', async () => {
    render(<Fruits search />);
    await user.click(trigger());
    const search = screen.getByRole('combobox', { name: 'Search' });
    expect(search).toHaveFocus();
    await user.type(search, 'b');
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(active()).toBe('Banana');
    await user.keyboard('{ArrowDown}{End}{Home}');
    expect(active()).toBe('Blueberry');
    await user.keyboard('{Enter}');
    expect(trigger()).toHaveTextContent('Blueberry');
  });

  it('shows empty status with the normalized phrase', async () => {
    render(<Fruits search />);
    await user.click(trigger());
    await user.keyboard('kiwi');
    expect(screen.getByRole('status')).toHaveTextContent(
      'No results for "kiwi"',
    );
    await user.keyboard('{Enter}{ArrowDown}');
    expect(listbox()).toBeInTheDocument();
  });

  it('clears the phrase with its x button and keeps focus', async () => {
    render(<Fruits search />);
    await user.click(trigger());
    await user.keyboard('ch');
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    const search = screen.getByRole('combobox', { name: 'Search' });
    expect(search).toHaveValue('');
    expect(search).toHaveFocus();
    expect(screen.getAllByRole('option')).toHaveLength(5);
  });

  it('starts with an empty phrase after reopening', async () => {
    render(<Fruits search />);
    await user.click(trigger());
    await user.keyboard('ch{Escape}');
    await user.click(trigger());
    expect(screen.getByRole('combobox', { name: 'Search' })).toHaveValue('');
  });

  it('keeps consumer change handler and labels', async () => {
    const onChange = vi.fn();
    render(
      <Select.Root defaultOpen>
        <Select.Content>
          <Select.Search
            aria-label="Find"
            clearLabel="Wipe"
            onChange={onChange}
          />
        </Select.Content>
      </Select.Root>,
    );
    await user.keyboard('a');
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Wipe' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Find' })).toHaveFocus();
  });
});

describe('select modal works when', () => {
  const user = userEvent.setup();

  afterEach(() => {
    mediaMatching(false);
    window.history.replaceState(null, '');
  });

  const popped = () =>
    new Promise((done) =>
      window.addEventListener('popstate', done, { once: true }),
    );

  it('becomes a full screen dialog on narrow screens', async () => {
    mediaMatching(true);
    render(<Fruits title="Choose fruit" />);
    await user.click(trigger());
    const dialog = screen.getByRole('dialog', { name: 'Choose fruit' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(document.body.style.overflow).toBe('hidden');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(document.body.style.overflow).toBe('');
    expect(trigger()).toHaveFocus();
  });

  it('is named by the label without a title', async () => {
    render(<Fruits mode="modal" />);
    await user.click(trigger());
    expect(screen.getByRole('dialog', { name: 'Fruit' })).toBeInTheDocument();
  });

  it('closes on native Back', async () => {
    render(<Fruits mode="modal" id="back" />);
    await user.click(trigger());
    const back = popped();
    window.history.back();
    await back;
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('picks by stepping Back off its own history entry', async () => {
    render(<Fruits mode="modal" id="pick" />);
    await user.click(trigger());
    const length = window.history.length;
    await user.click(screen.getByRole('option', { name: 'Date' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(window.history.length).toBe(length);
    expect(trigger()).toHaveTextContent('Date');
  });

  it('ignores unrelated history steps', async () => {
    render(<Fruits mode="modal" id="stay" />);
    await user.click(trigger());
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('reuses a restored history entry', async () => {
    window.history.replaceState({ dsSelect: 'restored' }, '');
    const length = window.history.length;
    render(<Fruits mode="modal" id="restored" />);
    await user.click(trigger());
    expect(window.history.length).toBe(length);
  });

  it('closes directly without history when Back is off', async () => {
    render(<Fruits mode="modal" closeOnBack={false} />);
    await user.click(trigger());
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('traps Tab inside the dialog', async () => {
    render(<Fruits mode="modal" closeOnBack={false} search />);
    await user.click(trigger());
    const close = screen.getByRole('button', { name: 'Close' });
    const search = screen.getByRole('combobox', { name: 'Search' });
    expect(search).toHaveFocus();
    await user.tab({ shift: true });
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(search).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
  });

  it('honours an explicit popover mode on narrow screens', async () => {
    mediaMatching(true);
    render(<Fruits mode="popover" />);
    await user.click(trigger());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('select stream works when', () => {
  it('reports every open and close with the open count', () => {
    const events: SelectEvent[] = [];
    const stop = selectStream.subscribe((event) => events.push(event));
    render(
      <>
        <Fruits id="a" />
        <Fruits id="b" />
      </>,
    );
    act(() => selectStream.open('a'));
    act(() => selectStream.open('b'));
    expect(selectStream.getOpen()).toEqual(['a', 'b']);
    act(() => selectStream.close('a'));
    stop();
    act(() => selectStream.close('b'));
    expect(events).toEqual([
      { type: 'open', id: 'a', open: ['a'] },
      { type: 'open', id: 'b', open: ['a', 'b'] },
      { type: 'close', id: 'a', open: ['b'] },
    ]);
    expect(selectStream.getOpen()).toEqual([]);
    expect(document.body).toHaveFocus();
  });

  it('opens a select asked for before it mounted', () => {
    act(() => selectStream.open('later'));
    render(<Fruits id="later" />);
    expect(listbox()).toBeInTheDocument();
  });

  it('drops a queued open that was closed again', () => {
    act(() => selectStream.open('dropped'));
    act(() => selectStream.close('dropped'));
    render(<Fruits id="dropped" />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('ignores repeated commands', () => {
    render(<Fruits id="same" />);
    act(() => selectStream.close('same'));
    act(() => selectStream.open('same'));
    act(() => selectStream.open('same'));
    expect(selectStream.getOpen()).toEqual(['same']);
  });

  it('keeps the newest select when two share an id', () => {
    const { rerender } = render(
      <>
        <Fruits id="twin" key="first" />
        <Fruits id="twin" key="second" />
      </>,
    );
    rerender(<Fruits id="twin" key="second" />);
    act(() => selectStream.open('twin'));
    expect(listbox()).toBeInTheDocument();
  });

  it('reports close when an open select unmounts', () => {
    const { unmount } = render(<Fruits id="gone" defaultOpen />);
    expect(selectStream.getOpen()).toContain('gone');
    unmount();
    expect(selectStream.getOpen()).not.toContain('gone');
  });
});

describe('select animations work when', () => {
  const user = userEvent.setup();

  const animated = () => {
    let finish = () => {};
    const finished = new Promise<void>((done) => {
      finish = done;
    });
    const spy = vi
      .spyOn(Element.prototype, 'getAnimations')
      .mockReturnValue([{ finished } as unknown as Animation]);
    return {
      finish: async () => {
        spy.mockRestore();
        await act(async () => finish());
      },
    };
  };

  it('keeps the popup until its exit animation ends', async () => {
    render(<Fruits />);
    await user.click(trigger());
    const exit = animated();
    await user.keyboard('{Escape}');
    expect(screen.getByText('Apple')).toBeInTheDocument();
    await exit.finish();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('animates removed options out and new ones in', async () => {
    const { rerender } = render(<Fruits defaultOpen />);
    const exit = animated();
    rerender(<Fruits defaultOpen items={['Fig', 'Apple', 'Cherry', 'Date']} />);
    expect(screen.getByRole('option', { name: 'Fig' })).toHaveAttribute(
      'data-presence',
      'enter',
    );
    expect(screen.getByText('Banana')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('option', { name: 'Banana' })).toBeNull();
    await exit.finish();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('brings a leaving option back when re-added', async () => {
    const { rerender } = render(<Fruits defaultOpen items={['A', 'B']} />);
    const exit = animated();
    rerender(<Fruits defaultOpen items={['A']} />);
    rerender(<Fruits defaultOpen items={['A', 'B']} />);
    await exit.finish();
    expect(screen.getByRole('option', { name: 'B' })).toBeInTheDocument();
  });

  it('moves the active option off a removed one', async () => {
    const { rerender } = render(<Fruits defaultOpen items={['A', 'B']} />);
    await user.keyboard('{ArrowDown}');
    expect(active()).toBe('B');
    rerender(<Fruits defaultOpen items={['A']} />);
    expect(active()).toBe('A');
    rerender(<Fruits defaultOpen items={[]} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('select sound works when', () => {
  const user = userEvent.setup();

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('plays a tone on open and close only when enabled', async () => {
    const start = vi.fn();
    const node = () => ({
      connect: (next: unknown) => next ?? node(),
      start,
      stop: () => {},
      frequency: {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      gain: {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
    });
    vi.stubGlobal(
      'AudioContext',
      class {
        currentTime = 0;
        destination = {};
        createOscillator = node;
        createGain = node;
      },
    );
    render(
      <>
        <Fruits sound />
        <Select.Root defaultOpen>
          <Select.Content />
        </Select.Root>
      </>,
    );
    await user.click(trigger());
    await user.keyboard('{Escape}');
    expect(start).toHaveBeenCalledTimes(2);
  });

  it('stays silent without Web Audio', async () => {
    vi.stubGlobal('AudioContext', undefined);
    render(<Fruits sound />);
    await user.click(trigger());
    expect(listbox()).toBeInTheDocument();
  });
});

describe('select customization works when', () => {
  const user = userEvent.setup();

  type User = { id: number; name: string };
  const USERS: User[] = [
    { id: 1, name: 'Ada' },
    { id: 2, name: 'Linus' },
  ];
  const UserSelect = createSelect<User>();

  it('selects typed objects by key and posts the key in forms', async () => {
    const onValueChange = vi.fn<(user: User | null) => void>();
    render(
      <form aria-label="Team">
        <UserSelect.Root
          name="owner"
          itemKey={(item) => String(item.id)}
          defaultValue={{ id: 2, name: 'Linus' }}
          onValueChange={onValueChange}
          className="mine"
        >
          <UserSelect.Label>Owner</UserSelect.Label>
          <UserSelect.Trigger>
            <UserSelect.Value>{(item) => item.name}</UserSelect.Value>
          </UserSelect.Trigger>
          <UserSelect.Content>
            <UserSelect.List items={USERS}>
              {(item) => (
                <UserSelect.Item value={item}>
                  {item.name}
                  <UserSelect.ItemIndicator>*</UserSelect.ItemIndicator>
                </UserSelect.Item>
              )}
            </UserSelect.List>
          </UserSelect.Content>
        </UserSelect.Root>
      </form>,
    );
    const form = screen.getByRole('form', { name: 'Team' });
    expect(new FormData(form as HTMLFormElement).get('owner')).toBe('2');
    expect(screen.getByRole('combobox', { name: /Owner/ })).toHaveTextContent(
      'Linus',
    );
    await user.click(screen.getByRole('combobox', { name: /Owner/ }));
    expect(screen.getByRole('option', { name: 'Linus' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await user.click(screen.getByRole('option', { name: 'Ada' }));
    expect(onValueChange).toHaveBeenCalledWith({ id: 1, name: 'Ada' });
    expect(new FormData(form as HTMLFormElement).get('owner')).toBe('1');
  });

  it('posts an empty value when nothing is chosen', () => {
    render(
      <form aria-label="Pick">
        <Select.Root name="fruit">
          <Select.Trigger aria-label="Fruit" />
        </Select.Root>
      </form>,
    );
    const form = screen.getByRole('form', { name: 'Pick' }) as HTMLFormElement;
    expect(new FormData(form).get('fruit')).toBe('');
  });

  it('lets consumer handlers cancel built-in behaviour', async () => {
    render(
      <Select.Root defaultValue="Apple">
        <Select.Control>
          <Select.Trigger
            aria-label="Fruit"
            onClick={(event) => event.preventDefault()}
            onKeyDown={(event) => event.preventDefault()}
          >
            <Select.Value />
          </Select.Trigger>
          <Select.Clear
            aria-label="Reset"
            onClick={(event) => event.preventDefault()}
          >
            reset
          </Select.Clear>
          <Select.Icon>v</Select.Icon>
        </Select.Control>
      </Select.Root>,
    );
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveTextContent(
      'Apple',
    );
  });

  it('lets consumer keys and item clicks cancel built-in behaviour', async () => {
    render(
      <Select.Root defaultOpen>
        <Select.Trigger aria-label="Fruit" />
        <Select.Content onKeyDown={(event) => event.preventDefault()}>
          <Select.List items={['Apple']}>
            {(item) => (
              <Select.Item
                value={item}
                onClick={(event) => event.preventDefault()}
                onPointerMove={() => {}}
              >
                {item}
              </Select.Item>
            )}
          </Select.List>
          <Select.Empty>Nothing</Select.Empty>
        </Select.Content>
      </Select.Root>,
    );
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('option', { name: 'Apple' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.queryByText('Nothing')).not.toBeInTheDocument();
  });

  it('renders static empty content and survives a popup without list', async () => {
    render(
      <Select.Root defaultOpen>
        <Select.Content>
          <Select.Empty>Nothing here</Select.Empty>
        </Select.Content>
      </Select.Root>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Nothing here');
    fireEvent.keyDown(screen.getByRole('status'), { key: 'ArrowDown' });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders values with String by default', () => {
    render(
      <Select.Root defaultValue="Kiwi">
        <Select.Trigger aria-label="Fruit">
          <Select.Value />
        </Select.Trigger>
      </Select.Root>,
    );
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveTextContent(
      'Kiwi',
    );
  });

  it('throws when a part is used outside Root', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Select.Trigger />)).toThrow(/SelectProvider/);
  });
});
