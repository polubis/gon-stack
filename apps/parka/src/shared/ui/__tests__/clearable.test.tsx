import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ClearableInput, ClearableTextarea } from '../clearable';
import { Field, Input, Select } from '../controls';
import { NumberInput } from '../number-input';

const TextForm = ({
  initial = 'Netflix',
  type,
}: {
  initial?: string;
  type?: 'text' | 'email' | 'password' | 'search';
}) => {
  const [value, setValue] = useState(initial);
  return (
    <Field label="Nazwa">
      <ClearableInput
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </Field>
  );
};

const CLEAR = { name: 'Wyczyść: Nazwa' };

describe('clear button on text inputs', () => {
  it('empties the input and focuses it', async () => {
    render(<TextForm />);

    await userEvent.click(screen.getByRole('button', CLEAR));

    expect(screen.getByLabelText('Nazwa')).toHaveValue('');
    expect(screen.getByLabelText('Nazwa')).toHaveFocus();
  });

  it.each(['email', 'password', 'search'] as const)(
    'is shown on a %s input',
    (type) => {
      render(<TextForm type={type} />);

      expect(screen.getByRole('button', CLEAR)).toBeVisible();
    },
  );

  it('hides the button while the input is empty', () => {
    render(<TextForm initial="" />);

    expect(screen.queryByRole('button', { name: /Wyczyść/ })).toBeNull();
  });

  it('shows the button once the input has text', async () => {
    render(<TextForm initial="" />);

    await userEvent.type(screen.getByLabelText('Nazwa'), 'a');

    expect(screen.getByRole('button', CLEAR)).toBeVisible();
  });

  it('is reachable with the keyboard', async () => {
    render(<TextForm />);

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(screen.getByLabelText('Nazwa')).toHaveValue('');
  });

  it('is not shown on a read-only or disabled input', () => {
    render(
      <>
        <ClearableInput aria-label="A" value="x" readOnly />
        <ClearableInput aria-label="B" value="x" disabled onChange={() => {}} />
      </>,
    );

    expect(screen.queryByRole('button', { name: /Wyczyść/ })).toBeNull();
  });
});

describe('controls without a clear button', () => {
  it('has none on number, date and select controls', () => {
    render(
      <>
        <Field label="Kwota">
          <NumberInput value={12} onValueChange={() => {}} />
        </Field>
        <Field label="Data">
          <Input type="date" value="2026-01-01" onChange={() => {}} />
        </Field>
        <Field label="Kategoria">
          <Select
            value="a"
            options={[{ value: 'a', label: 'Alfa' }]}
            onValueChange={() => {}}
          />
        </Field>
        <ClearableInput
          aria-label="Data 2"
          type="date"
          value="2026-01-01"
          onChange={() => {}}
        />
      </>,
    );

    expect(screen.getByLabelText('Kwota')).toHaveValue('12');
    expect(screen.getByLabelText('Data')).toBeVisible();
    expect(screen.getByLabelText('Kategoria')).toHaveTextContent('Alfa');
    expect(screen.queryByRole('button', { name: /Wyczyść/ })).toBeNull();
  });
});

const Fields = () => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  return (
    <>
      <ClearableInput
        aria-label="Linia"
        value={a}
        onChange={(e) => setA(e.target.value)}
      />
      <ClearableTextarea
        aria-label="Opis"
        value={b}
        onChange={(e) => setB(e.target.value)}
      />
    </>
  );
};

describe('textarea mic and clear button', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'webkitSpeechRecognition');
  });

  const stubSpeech = () =>
    Object.assign(window, {
      webkitSpeechRecognition: class {
        start() {}
        stop() {}
        abort() {}
      },
    });

  it('offers the mic and no clear button while the field is empty', () => {
    stubSpeech();

    render(<Fields />);

    expect(screen.queryByRole('button', { name: /Wyczyść/ })).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Dyktuj: Opis' }),
    ).toBeInTheDocument();
  });

  it('keeps the mic available next to the clear button once text is typed', async () => {
    stubSpeech();
    render(<Fields />);

    await userEvent.type(screen.getByLabelText('Opis'), 'tekst');

    expect(screen.getByRole('button', { name: 'Wyczyść: Opis' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Dyktuj: Opis' }),
    ).toBeInTheDocument();
  });

  it('empties the textarea and focuses it', async () => {
    render(<Fields />);
    await userEvent.type(screen.getByLabelText('Opis'), 'tekst');

    await userEvent.click(
      screen.getByRole('button', { name: 'Wyczyść: Opis' }),
    );

    expect(screen.getByLabelText('Opis')).toHaveValue('');
    expect(screen.getByLabelText('Opis')).toHaveFocus();
  });
});

describe('textarea fullscreen button', () => {
  it('is absent without an expand handler', () => {
    render(<Fields />);

    expect(screen.queryByRole('button', { name: /pełnym ekranie/ })).toBeNull();
  });

  it('calls the expand handler on click, with or without a value', async () => {
    const onExpand = vi.fn();
    render(
      <ClearableTextarea
        aria-label="Opis"
        value=""
        onChange={() => {}}
        onExpand={onExpand}
        expandLabel="Edytuj opis na pełnym ekranie"
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Edytuj opis na pełnym ekranie' }),
    );

    expect(onExpand).toHaveBeenCalledTimes(1);
  });
});
