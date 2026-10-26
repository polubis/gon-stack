import { useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ClearableInput } from '@/shared/ui/clearable';
import { Field } from '@/shared/ui/controls';

type Fake = {
  onresult: ((e: { results: { transcript: string }[][] }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

let current: Fake | null = null;

const register = (fake: Fake) => {
  current = fake;
};

const installMic = () => {
  class FakeRecognition {
    onresult: Fake['onresult'] = null;
    onerror: Fake['onerror'] = null;
    onend: Fake['onend'] = null;
    lang = '';
    continuous = false;
    interimResults = false;
    constructor() {
      register(this);
    }
    start() {}
    stop() {
      this.onend?.();
    }
    abort() {}
  }
  Object.assign(window, { webkitSpeechRecognition: FakeRecognition });
};

const say = (...phrases: string[]) =>
  act(() =>
    current?.onresult?.({ results: phrases.map((t) => [{ transcript: t }]) }),
  );

const Form = ({ initial = '' }: { initial?: string }) => {
  const [value, setValue] = useState(initial);
  return (
    <Field label="Nazwa">
      <ClearableInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </Field>
  );
};

afterEach(() => {
  Reflect.deleteProperty(window, 'webkitSpeechRecognition');
  current = null;
});

describe('voice dictation into a text field', () => {
  it('has no mic button when the browser cannot recognise speech', () => {
    render(<Form />);

    expect(screen.queryByRole('button', { name: /Dyktuj/ })).toBeNull();
  });

  it('types what was said into the field', async () => {
    installMic();
    render(<Form />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Dyktuj: Nazwa' }),
    );
    say('kup mleko');

    expect(screen.getByLabelText('Nazwa')).toHaveValue('kup mleko');
  });

  it('appends to existing text and follows interim corrections', async () => {
    installMic();
    render(<Form initial="Zakupy:" />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Dyktuj: Nazwa' }),
    );
    say('chleb');
    say('chleb', 'i masło');

    expect(screen.getByLabelText('Nazwa')).toHaveValue('Zakupy: chleb i masło');
  });

  it('shows listening state and stops on second click', async () => {
    installMic();
    render(<Form />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Dyktuj: Nazwa' }),
    );
    const stop = screen.getByRole('button', {
      name: 'Zatrzymaj dyktowanie: Nazwa',
    });
    expect(stop).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(stop);

    expect(
      screen.getByRole('button', { name: 'Dyktuj: Nazwa' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('explains a denied microphone and lets the user retry', async () => {
    installMic();
    render(<Form />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Dyktuj: Nazwa' }),
    );
    act(() => current?.onerror?.({ error: 'not-allowed' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Brak dostępu do mikrofonu',
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'DICTATION_NOT_ALLOWED',
    );
  });
});
