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

/**
 * Folds recognition segments into one text without repeats: a segment that
 * extends everything so far replaces it (cumulative results), one already
 * present at the end is dropped (re-delivered results).
 */
const mergeSegments = (segments: string[]) =>
  segments.reduce((acc, raw) => {
    const seg = raw.replace(/\s+/g, ' ').trim();
    if (seg === '' || acc === seg) return acc;
    if (acc !== '' && seg.startsWith(acc)) return seg;
    if (acc.endsWith(` ${seg}`) && seg.includes(' ')) return acc;
    return acc === '' ? seg : `${acc} ${seg}`;
  }, '');

const subscribeNothing = () => () => {};

const getRecognition = (): RecognitionCtor | null => {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

/**
 * Browser speech-to-text. `transcript` is the de-duplicated text so far
 * (final + interim, kept across restarts until `reset`); nothing is written
 * anywhere. `supported` is false on the server and in browsers without the API.
 */
export const useDictation = ({
  lang,
  onError,
}: {
  lang: string;
  onError: (error: DictationError) => void;
}) => {
  const supported = useSyncExternalStore(
    subscribeNothing,
    () => getRecognition() !== null,
    () => false,
  );
  const [listening, setListening] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const [transcript, setTranscript] = useState('');
  const carry = useRef('');
  const emitError = useEffectEvent(onError);

  useEffect(() => {
    const Ctor = getRecognition();
    if (!listening || !Ctor) return;
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      setTranscript(
        mergeSegments([
          carry.current,
          mergeSegments(Array.from(e.results, (r) => r[0]?.transcript ?? '')),
        ]),
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
    transcript,
    /** `resume` keeps the text so far; otherwise a fresh take starts. */
    start: (resume = false) => {
      carry.current = resume ? transcript : '';
      if (!resume) setTranscript('');
      setListening(true);
    },
    reset: () => {
      carry.current = '';
      setTranscript('');
    },
    stop: () => {
      recognition.current?.stop();
      setListening(false);
    },
  };
};
