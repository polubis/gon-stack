import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DictationButton } from '@/shared/dictation/dictation-button';
import { ClearableInput } from '@/shared/ui/clearable';
import { Field } from '@/shared/ui/controls';

type Fake = {
  onresult: ((e: { results: { transcript: string }[][] }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

let current: Fake | null = null;
let started = 0;

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
    start() {
      started += 1;
    }
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
  started = 0;
  vi.unstubAllGlobals();
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

  it('blocks the page while listening and stops from the popup', async () => {
    installMic();
    render(<Form />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Dyktuj: Nazwa' }),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Zatrzymaj dyktowanie: Nazwa' }),
    ).toBeDisabled();

    await userEvent.click(
      screen.getByRole('button', { name: 'Zakończ dyktowanie' }),
    );

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Dyktuj: Nazwa' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('stops listening on Escape', async () => {
    installMic();
    render(<Form />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Dyktuj: Nazwa' }),
    );
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
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

const NoteDialog = () => {
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Portal>
        <Dialog.Content aria-describedby={undefined}>
          <Dialog.Title>Notatka</Dialog.Title>
          <textarea ref={ref} aria-label="Treść" />
          <DictationButton target={ref} label="Treść" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

describe('voice popup details', () => {
  it('starts only one recording however often the mic is pressed', async () => {
    installMic();
    render(<Form />);
    const mic = screen.getByRole('button', { name: 'Dyktuj: Nazwa' });

    await userEvent.click(mic);
    await userEvent.click(mic);

    expect(started).toBe(1);
    expect(
      screen.getByRole('button', { name: 'Zatrzymaj dyktowanie: Nazwa' }),
    ).toBeDisabled();
  });

  it('closes only the popup on Escape inside a dialog', async () => {
    installMic();
    render(<NoteDialog />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Dyktuj: Treść' }),
    );
    await userEvent.keyboard('{Escape}');

    expect(
      screen.queryByRole('dialog', { name: 'Dyktowanie: Treść' }),
    ).toBeNull();
    expect(screen.getByRole('dialog', { name: 'Notatka' })).toBeVisible();
    expect(screen.getByLabelText('Treść')).toHaveFocus();
  });

  it('still dictates when the microphone level is unavailable', async () => {
    installMic();
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaDevices: {
        getUserMedia: () => Promise.reject(new Error('denied')),
      },
    });
    render(<Form />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Dyktuj: Nazwa' }),
    );
    say('kup chleb');

    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByLabelText('Nazwa')).toHaveValue('kup chleb');
  });

  it('leaves the microphone to speech recognition on a phone', async () => {
    installMic();
    const getUserMedia = vi.fn(() => Promise.reject(new Error('busy')));
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36',
      maxTouchPoints: 5,
      mediaDevices: { getUserMedia },
    });
    render(<Form />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Dyktuj: Nazwa' }),
    );
    say('kup chleb');

    expect(getUserMedia).not.toHaveBeenCalled();
    expect(started).toBe(1);
    expect(screen.getByLabelText('Nazwa')).toHaveValue('kup chleb');
  });
});
