import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

type Alternative = { transcript: string };
type RecognitionResult = ArrayLike<Alternative>;
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionCtor = new () => Recognition;

export type DictationError = { code: string; denied: boolean };

const IGNORED_ERRORS = ['no-speech', 'aborted'];
const DENIED_ERRORS = ['not-allowed', 'service-not-allowed'];

const subscribeNothing = () => () => {};

const getRecognition = (): RecognitionCtor | null => {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

/**
 * Browser speech-to-text. `onText` receives the whole transcript of the
 * current session (final + interim) each time it changes.
 * `supported` is false on the server and in browsers without the API.
 */
export const useDictation = ({
  lang,
  onText,
  onError,
}: {
  lang: string;
  onText: (transcript: string) => void;
  onError: (error: DictationError) => void;
}) => {
  const supported = useSyncExternalStore(
    subscribeNothing,
    () => getRecognition() !== null,
    () => false,
  );
  const [listening, setListening] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const emitText = useEffectEvent(onText);
  const emitError = useEffectEvent(onError);

  useEffect(() => {
    const Ctor = getRecognition();
    if (!listening || !Ctor) return;
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      emitText(
        Array.from(e.results, (r) => r[0]?.transcript ?? '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim(),
      );
    };
    rec.onerror = (e) => {
      if (IGNORED_ERRORS.includes(e.error)) return;
      emitError({
        code: `DICTATION_${e.error.toUpperCase().replaceAll('-', '_')}`,
        denied: DENIED_ERRORS.includes(e.error),
      });
    };
    rec.onend = () => setListening(false);
    recognition.current = rec;
    rec.start();
    return () => {
      rec.onend = null;
      rec.abort();
      recognition.current = null;
    };
  }, [listening, lang]);

  return {
    supported,
    listening,
    start: () => setListening(true),
    stop: () => {
      recognition.current?.stop();
      setListening(false);
    },
  };
};
