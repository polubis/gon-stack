type Tone = 'open' | 'close';

const NOTES: Record<Tone, [from: number, to: number]> = {
  open: [520, 880],
  close: [660, 392],
};

let audio: AudioContext | null = null;

/** Soft synthesized blip (no asset). Silent where Web Audio is missing. */
export const playTone = (tone: Tone) => {
  if (typeof AudioContext === 'undefined') return;
  audio ??= new AudioContext();
  const [from, to] = NOTES[tone];
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(from, now);
  osc.frequency.exponentialRampToValueAtTime(to, now + 0.09);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.15);
};

export type { Tone };
