import { APP_ROUTER } from '@/shared/router/routes';

export type TimeKind = 'day' | 'week' | 'month' | 'year';

export const TIME_KINDS: readonly {
  kind: TimeKind;
  href: string;
  label: string;
}[] = [
  { kind: 'day', href: APP_ROUTER.time(), label: 'Dzień' },
  { kind: 'week', href: APP_ROUTER.timeWeek(), label: 'Tydzień' },
  { kind: 'month', href: APP_ROUTER.timeMonth(), label: 'Miesiąc' },
  { kind: 'year', href: APP_ROUTER.timeYear(), label: 'Rok' },
];

export const PERIOD_TITLES: Record<TimeKind, string> = {
  day: 'wtorek, 20 października 2026',
  week: '19 – 25 października 2026',
  month: 'październik 2026',
  year: '2026',
};

/** Tone maps to the `device-N` tint + ink token pairs. */
export type TimeTone = 'work' | 'home' | 'health' | 'learn' | 'rest';

export const TONE_CLASS: Record<TimeTone, string> = {
  work: 'bg-device-1 text-on-device-1',
  home: 'bg-device-4 text-on-device-4',
  health: 'bg-device-5 text-on-device-5',
  learn: 'bg-device-2 text-on-device-2',
  rest: 'bg-device-6 text-on-device-6',
};

export const TONE_DOT_CLASS: Record<TimeTone, string> = {
  work: 'bg-on-device-1',
  home: 'bg-on-device-4',
  health: 'bg-on-device-5',
  learn: 'bg-on-device-2',
  rest: 'bg-on-device-6',
};

/** A task is pinned to an hour (`HH:00`) or lasts the whole day. */
export type Slot = { kind: 'timed'; at: string } | { kind: 'allDay' };

export type Task = {
  title: string;
  tone: TimeTone;
  done: boolean;
  slot: Slot;
};

export type TimedTask = Task & { slot: { kind: 'timed'; at: string } };

const timed = (at: string): Slot => ({ kind: 'timed', at });
const allDay: Slot = { kind: 'allDay' };

/** Hardcoded "current" time; `now` row, line and offsets all derive from it. */
export const NOW_TIME = '13:40';
export const NOW_HOUR_LABEL = `${NOW_TIME.slice(0, 2)}:00`;
/** Share of the hour row already elapsed at `NOW_TIME`. */
export const NOW_HOUR_OFFSET = `${Math.round((Number(NOW_TIME.slice(3)) / 60) * 100)}%`;

export const ALL_DAY_LABEL = 'Cały dzień';

export const DAY_TASKS: readonly Task[] = [
  { slot: timed('07:00'), title: 'Bieganie', tone: 'health', done: true },
  {
    slot: timed('09:00'),
    title: 'Raport miesięczny',
    tone: 'work',
    done: true,
  },
  {
    slot: timed('11:00'),
    title: 'Spotkanie zespołu',
    tone: 'work',
    done: true,
  },
  { slot: timed('13:00'), title: 'Obiad i spacer', tone: 'rest', done: false },
  {
    slot: timed('15:00'),
    title: 'Kurs angielskiego',
    tone: 'learn',
    done: false,
  },
  {
    slot: timed('18:00'),
    title: 'Zakupy i porządki',
    tone: 'home',
    done: false,
  },
  {
    slot: allDay,
    title: 'Zapłacić rachunek za internet',
    tone: 'home',
    done: false,
  },
  {
    slot: allDay,
    title: 'Umówić wizytę u dentysty',
    tone: 'health',
    done: false,
  },
];

export const WEEK_DAYS: readonly {
  day: string;
  name: string;
  date: string;
  today: boolean;
  tasks: readonly Task[];
}[] = [
  {
    day: 'Pn',
    name: 'poniedziałek',
    date: '19',
    today: false,
    tasks: [
      { slot: allDay, title: 'Urlop Anny', tone: 'rest', done: true },
      { slot: timed('09:00'), title: 'Projekt', tone: 'work', done: true },
      { slot: timed('18:00'), title: 'Siłownia', tone: 'health', done: true },
    ],
  },
  {
    day: 'Wt',
    name: 'wtorek',
    date: '20',
    today: true,
    tasks: [
      { slot: timed('09:00'), title: 'Raport', tone: 'work', done: true },
      { slot: timed('15:00'), title: 'Angielski', tone: 'learn', done: false },
      { slot: timed('18:00'), title: 'Zakupy', tone: 'home', done: false },
    ],
  },
  {
    day: 'Śr',
    name: 'środa',
    date: '21',
    today: false,
    tasks: [
      { slot: allDay, title: 'Konferencja online', tone: 'work', done: false },
      { slot: timed('11:00'), title: 'Spotkania', tone: 'work', done: false },
      { slot: timed('13:00'), title: 'Spacer', tone: 'rest', done: false },
    ],
  },
  {
    day: 'Cz',
    name: 'czwartek',
    date: '22',
    today: false,
    tasks: [
      { slot: timed('10:00'), title: 'Kurs', tone: 'learn', done: false },
      { slot: timed('14:00'), title: 'Projekt', tone: 'work', done: false },
    ],
  },
  {
    day: 'Pt',
    name: 'piątek',
    date: '23',
    today: false,
    tasks: [
      {
        slot: allDay,
        title: 'Opłacić ubezpieczenie',
        tone: 'home',
        done: false,
      },
      { slot: timed('12:00'), title: 'Przegląd', tone: 'work', done: false },
      { slot: timed('17:00'), title: 'Porządki', tone: 'home', done: false },
    ],
  },
  {
    day: 'So',
    name: 'sobota',
    date: '24',
    today: false,
    tasks: [
      { slot: allDay, title: 'Wyjazd za miasto', tone: 'rest', done: false },
      { slot: timed('10:00'), title: 'Rower', tone: 'health', done: false },
    ],
  },
  {
    day: 'Nd',
    name: 'niedziela',
    date: '25',
    today: false,
    tasks: [
      { slot: allDay, title: 'Dzień bez planów', tone: 'rest', done: false },
    ],
  },
];

const timedHours = WEEK_DAYS.flatMap((day) =>
  day.tasks.flatMap((task) =>
    task.slot.kind === 'timed' ? [Number(task.slot.at.slice(0, 2))] : [],
  ),
);

/** 08:00-20:00, widened when a task falls outside it. */
export const WEEK_HOURS = Array.from(
  {
    length: Math.max(20, ...timedHours) - Math.min(8, ...timedHours) + 1,
  },
  (_, i) => Math.min(8, ...timedHours) + i,
);

export const WEEKDAY_SHORT = [
  'Pn',
  'Wt',
  'Śr',
  'Cz',
  'Pt',
  'So',
  'Nd',
] as const;

/** October 2026 starts on Thursday: three empty cells lead the grid. */
export const MONTH_LEADING_BLANKS = 3;
export const MONTH_TODAY = 20;
export const MONTH_DAYS = 31;
/** Zero-based month and year of the month grid. */
export const MONTH_INDEX = 9;
export const MONTH_YEAR = 2026;

export const MONTH_MARKS: Record<number, readonly TimeTone[]> = {
  1: ['work'],
  2: ['work', 'health'],
  5: ['work', 'learn'],
  6: ['work'],
  7: ['learn', 'home'],
  8: ['work'],
  9: ['health', 'rest'],
  12: ['work'],
  13: ['work', 'learn', 'home'],
  14: ['work'],
  15: ['learn'],
  16: ['work', 'health'],
  19: ['work', 'health'],
  20: ['work', 'learn', 'home'],
  21: ['work', 'rest'],
  22: ['learn', 'work'],
  23: ['work', 'home'],
  24: ['health'],
  26: ['work'],
  27: ['work', 'learn'],
  28: ['home'],
  29: ['work', 'rest'],
  30: ['health'],
};

export const YEAR_MONTHS: readonly { name: string; count: number }[] = [
  { name: 'Styczeń', count: 42 },
  { name: 'Luty', count: 38 },
  { name: 'Marzec', count: 51 },
  { name: 'Kwiecień', count: 47 },
  { name: 'Maj', count: 33 },
  { name: 'Czerwiec', count: 29 },
  { name: 'Lipiec', count: 18 },
  { name: 'Sierpień', count: 14 },
  { name: 'Wrzesień', count: 44 },
  { name: 'Październik', count: 36 },
  { name: 'Listopad', count: 12 },
  { name: 'Grudzień', count: 8 },
];
