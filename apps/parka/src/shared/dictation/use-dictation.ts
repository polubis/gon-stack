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
 * Appends one recognition segment to `text` without repeats: a segment that
 * extends the text so far replaces it (cumulative results), one already
 * present at the end is dropped (re-delivered results). `text` itself is kept
 * verbatim, so edits (spaces, line breaks) survive.
 */
const extend = (text: string, raw: string) => {
  const seg = raw.replace(/\s+/g, ' ').trim();
  const head = text.trimEnd();
  if (seg === '' || head === seg) return text;
  if (seg.includes(' ') && head.endsWith(` ${seg}`)) return text;
  if (head !== '' && seg.startsWith(head)) return seg;
  if (head === '') return seg;
  return /\s$/.test(text) ? `${text}${seg}` : `${text} ${seg}`;
};

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
  /** Text the live session continues from (previous takes or user edits). */
  const base = useRef('');
  /** Results of the live session already folded into `base` by an edit. */
  const consumed = useRef(0);
  /** Results the live session has delivered so far. */
  const delivered = useRef(0);
  /** Segment texts the live session delivered last (kept after it stops). */
  const session = useRef<string[]>([]);
  /** Segment texts of the previous session, still in `base` after a resume. */
  const carried = useRef<string[]>([]);
  /** Whether the live session has shown whether it re-delivers `carried`. */
  const settled = useRef(false);
  const emitError = useEffectEvent(onError);

  useEffect(() => {
    const Ctor = getRecognition();
    if (!listening || !Ctor) return;
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    consumed.current = 0;
    delivered.current = 0;
    session.current = [];
    settled.current = false;
    rec.onresult = (e) => {
      const texts = Array.from(e.results, (r) => r[0]?.transcript ?? '');
      delivered.current = texts.length;
      session.current = texts;
      const old = carried.current;
      if (!settled.current) {
        // Phones restart a resumed session by re-delivering the segments the
        // previous one already put into `base`; they must not be folded again.
        const same = old.slice(0, texts.length).every((t, i) => t === texts[i]);
        if (same && texts.length < old.length) return;
        settled.current = true;
        consumed.current = same && texts.length >= old.length ? old.length : 0;
      }
      setTranscript(
        texts
          .slice(consumed.current)
          .reduce((text, t) => extend(text, t), base.current),
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
      carried.current = session.current;
    };
  }, [listening, lang]);

  return {
    supported,
    listening,
    transcript,
    /** `resume` keeps the text so far; otherwise a fresh take starts. */
    start: (resume = false) => {
      base.current = resume ? transcript : '';
      if (!resume) {
        carried.current = [];
        setTranscript('');
      }
      setListening(true);
    },
    /** Replaces the previewed text (user edit). Speech after it continues from it. */
    edit: (text: string) => {
      base.current = text;
      consumed.current = delivered.current;
      setTranscript(text);
    },
    reset: () => {
      base.current = '';
      carried.current = [];
      setTranscript('');
    },
    stop: () => {
      recognition.current?.stop();
      setListening(false);
    },
  };
};
