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

const mic = () => screen.getByRole('button', { name: 'Dyktuj: Nazwa' });
const preview = () =>
  screen.getByRole('textbox', { name: 'Podgląd dyktowania' });
const field = () => screen.getByLabelText('Nazwa');

const Note = ({ initial = '', max }: { initial?: string; max?: number }) => {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <>
      <textarea
        ref={ref}
        aria-label="Treść"
        maxLength={max}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <DictationButton target={ref} label="Treść" />
    </>
  );
};

describe('voice dictation into a text field', () => {
  it('has no mic button when the browser cannot recognise speech', () => {
    render(<Form />);

    expect(screen.queryByRole('button', { name: /Dyktuj/ })).toBeNull();
  });

  it('previews live speech without touching the field', async () => {
    installMic();
    render(<Form initial="Zakupy:" />);

    await userEvent.click(mic());
    say('kup');
    say('kup mleko');

    expect(preview()).toHaveValue('kup mleko');
    expect(field()).toHaveValue('Zakupy:');
  });

  it('inserts the previewed text once on accept', async () => {
    installMic();
    render(<Form initial="Zakupy:" />);

    await userEvent.click(mic());
    say('chleb');
    say('chleb', 'i masło');
    await userEvent.click(screen.getByRole('button', { name: 'Wstaw' }));

    expect(field()).toHaveValue('Zakupy: chleb i masło');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('inserts into a textarea too', async () => {
    installMic();
    render(<Note initial="Notatka" />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Dyktuj: Treść' }),
    );
    say('jutro rano');
    await userEvent.click(screen.getByRole('button', { name: 'Wstaw' }));

    expect(screen.getByLabelText('Treść')).toHaveValue('Notatka jutro rano');
  });

  const dictateRepeats = async () => {
    installMic();
    render(<Form />);
    await userEvent.click(mic());
    say('kup mleko');
    say('kup mleko', 'kup mleko');
    say('kup mleko', 'kup mleko jutro');
    say('kup mleko', 'kup mleko jutro');
    say('kup mleko', 'kup mleko jutro', 'kup mleko jutro');
  };

  it('shows repeated or re-delivered results only once', async () => {
    await dictateRepeats();

    expect(preview()).toHaveValue('kup mleko jutro');
  });

  it('inserts repeated results only once', async () => {
    await dictateRepeats();

    await userEvent.click(screen.getByRole('button', { name: 'Wstaw' }));

    expect(field()).toHaveValue('kup mleko jutro');
  });

  it('writes nothing on cancel', async () => {
    installMic();
    render(<Form initial="Zakupy:" />);

    await userEvent.click(mic());
    say('kup mleko');
    await userEvent.click(screen.getByRole('button', { name: 'Anuluj' }));

    expect(field()).toHaveValue('Zakupy:');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('starts a fresh take after a cancelled one', async () => {
    installMic();
    render(<Form />);

    await userEvent.click(mic());
    say('stary tekst');
    await userEvent.click(screen.getByRole('button', { name: 'Anuluj' }));
    await userEvent.click(mic());
    say('nowy');
    await userEvent.click(screen.getByRole('button', { name: 'Wstaw' }));

    expect(field()).toHaveValue('nowy');
  });

  it('writes nothing on Escape', async () => {
    installMic();
    render(<Form />);

    await userEvent.click(mic());
    say('kup mleko');
    await userEvent.keyboard('{Escape}');

    expect(field()).toHaveValue('');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps the newest speech in view as it arrives', async () => {
    installMic();
    render(<Form />);

    await userEvent.click(mic());
    const area = preview();
    let scrollTop = 0;
    Object.defineProperties(area, {
      scrollHeight: { configurable: true, value: 480 },
      scrollTop: {
        configurable: true,
        get: () => scrollTop,
        set: (v: number) => {
          scrollTop = v;
        },
      },
    });
    say('kup mleko');
    say('kup mleko', 'i chleb');

    expect(scrollTop).toBe(480);
  });

  const dictateIntoScrollableArea = async () => {
    installMic();
    render(<Form />);
    await userEvent.click(mic());
    const area = preview();
    let scrollTop = 0;
    Object.defineProperties(area, {
      scrollHeight: { configurable: true, value: 480 },
      scrollTop: {
        configurable: true,
        get: () => scrollTop,
        set: (v: number) => {
          scrollTop = v;
        },
      },
    });
    say('kup mleko');
    return {
      area,
      reset: () => {
        scrollTop = 0;
      },
      scrolled: () => scrollTop,
    };
  };

  it('follows the speech to the end of the preview', async () => {
    const view = await dictateIntoScrollableArea();

    expect(view.scrolled()).toBe(480);
  });

  it('does not pull the view back to the end while the user edits', async () => {
    const view = await dictateIntoScrollableArea();
    view.reset();

    await userEvent.type(view.area, 'x');

    expect(view.scrolled()).toBe(0);
  });

  it('cannot accept before anything was said', async () => {
    installMic();
    render(<Form />);

    await userEvent.click(mic());

    expect(screen.getByRole('button', { name: 'Wstaw' })).toBeDisabled();
  });

  const stopListening = async () => {
    installMic();
    render(<Form />);
    await userEvent.click(mic());
    say('kup mleko');
    await userEvent.click(
      screen.getByRole('button', { name: 'Zakończ dyktowanie' }),
    );
  };

  it('keeps the preview after listening stops', async () => {
    await stopListening();

    expect(preview()).toHaveValue('kup mleko');
    expect(field()).toHaveValue('');
  });

  it('continues dictating after listening stopped', async () => {
    await stopListening();

    await userEvent.click(screen.getByRole('button', { name: 'Dyktuj dalej' }));
    say('i chleb');
    await userEvent.click(screen.getByRole('button', { name: 'Wstaw' }));

    expect(field()).toHaveValue('kup mleko i chleb');
  });

  it('respects the field max length', async () => {
    installMic();
    render(<Note initial="abc" max={8} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Dyktuj: Treść' }),
    );
    say('defghijkl');
    await userEvent.click(screen.getByRole('button', { name: 'Wstaw' }));

    expect(screen.getByLabelText('Treść')).toHaveValue('abc defg');
  });

  it('blocks the page while dictating', async () => {
    installMic();
    render(<Form />);

    await userEvent.click(mic());

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Zatrzymaj dyktowanie: Nazwa' }),
    ).toBeDisabled();
  });

  it('explains a denied microphone', async () => {
    installMic();
    render(<Form />);

    await userEvent.click(mic());
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
    expect(preview()).toHaveValue('kup chleb');
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
    expect(preview()).toHaveValue('kup chleb');
  });
});

describe('resuming after a pause on a phone', () => {
  it('does not repeat words the phone delivers again after a restart', async () => {
    installMic();
    render(<Form />);

    await userEvent.click(mic());
    say('kup');
    say('kup', 'mleko');
    say('kup', 'mleko', 'prawda');
    await userEvent.click(
      screen.getByRole('button', { name: 'Zakończ dyktowanie' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dyktuj dalej' }));
    say('kup', 'mleko', 'prawda', 'ale');
    await userEvent.click(screen.getByRole('button', { name: 'Wstaw' }));

    expect(field()).toHaveValue('kup mleko prawda ale');
  });

  it('keeps a word the user repeats after a pause', async () => {
    installMic();
    render(<Form />);

    await userEvent.click(mic());
    say('kup', 'mleko', 'prawda');
    await userEvent.click(
      screen.getByRole('button', { name: 'Zakończ dyktowanie' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dyktuj dalej' }));
    say('prawda');
    await userEvent.click(screen.getByRole('button', { name: 'Wstaw' }));

    expect(field()).toHaveValue('kup mleko prawda prawda');
  });
});

describe('editing while dictating', () => {
  it('lets the preview be edited while speech keeps coming', async () => {
    installMic();
    render(<Form />);

    await userEvent.click(mic());
    say('kup');
    await userEvent.type(preview(), ' mleko');
    say('kup', 'i chleb');
    await userEvent.click(screen.getByRole('button', { name: 'Wstaw' }));

    expect(field()).toHaveValue('kup mleko i chleb');
  });

  it('keeps typed text when a new take starts after stopping', async () => {
    installMic();
    render(<Form />);

    await userEvent.click(mic());
    say('kup');
    await userEvent.clear(preview());
    await userEvent.type(preview(), 'mleko');
    await userEvent.click(
      screen.getByRole('button', { name: 'Zakończ dyktowanie' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dyktuj dalej' }));
    say('chleb');

    expect(preview()).toHaveValue('mleko chleb');
  });
});

describe('screen while dictating', () => {
  const dictateWithWakeLock = async () => {
    installMic();
    const release = vi.fn(() => Promise.resolve());
    const request = vi.fn(() =>
      Promise.resolve({ release, addEventListener: vi.fn() }),
    );
    vi.stubGlobal('navigator', { ...navigator, wakeLock: { request } });
    render(<Form />);
    await userEvent.click(mic());
    say('kup chleb');
    return { release, request };
  };

  it('keeps the screen awake while dictating', async () => {
    const { request, release } = await dictateWithWakeLock();

    expect(request).toHaveBeenCalledWith('screen');
    expect(release).not.toHaveBeenCalled();
  });

  it('lets the screen sleep once the dictation is accepted', async () => {
    const { release } = await dictateWithWakeLock();

    await userEvent.click(screen.getByRole('button', { name: 'Wstaw' }));

    expect(release).toHaveBeenCalledTimes(1);
  });

  it('takes the screen again when the page comes back to the foreground', async () => {
    installMic();
    const releaseListeners: (() => void)[] = [];
    const request = vi.fn(() =>
      Promise.resolve({
        release: vi.fn(() => Promise.resolve()),
        addEventListener: (_: 'release', listener: () => void) => {
          releaseListeners.push(listener);
        },
      }),
    );
    vi.stubGlobal('navigator', { ...navigator, wakeLock: { request } });
    const setVisibility = (state: 'visible' | 'hidden') => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => state,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    };
    render(<Form />);

    await userEvent.click(mic());
    expect(request).toHaveBeenCalledTimes(1);

    setVisibility('hidden');
    releaseListeners.at(-1)?.();
    setVisibility('visible');

    expect(request).toHaveBeenCalledTimes(2);
    Reflect.deleteProperty(document, 'visibilityState');
  });

  it('releases the screen when the dictation is cancelled', async () => {
    installMic();
    const release = vi.fn(() => Promise.resolve());
    const request = vi.fn(() =>
      Promise.resolve({ release, addEventListener: vi.fn() }),
    );
    vi.stubGlobal('navigator', { ...navigator, wakeLock: { request } });
    render(<Form />);

    await userEvent.click(mic());
    await userEvent.click(screen.getByRole('button', { name: 'Anuluj' }));

    expect(release).toHaveBeenCalledTimes(1);
  });

  it('still dictates when the screen cannot be kept awake', async () => {
    installMic();
    const request = vi.fn(() => Promise.reject(new Error('NotAllowedError')));
    vi.stubGlobal('navigator', { ...navigator, wakeLock: { request } });
    render(<Form />);

    await userEvent.click(mic());
    say('kup chleb');

    expect(request).toHaveBeenCalled();
    expect(preview()).toHaveValue('kup chleb');
  });
});
