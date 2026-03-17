import { useState } from 'react';

// ─── Nav Bar ────────────────────────────────────────────────────────────────

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-0 border-b border-surface-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="text-sm font-semibold text-text-secondary tracking-wide uppercase">
          Variant 2: Ocean Breeze
        </span>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {Array.from({ length: 26 }, (_, i) => i + 1).map((n) => (
            <a
              key={n}
              href={`/${n}`}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                n === 2
                  ? 'bg-primary-500 text-white'
                  : 'text-text-tertiary hover:bg-surface-100 hover:text-text-primary'
              }`}
            >
              {n}
            </a>
          ))}
        </div>
        <div className="text-xs text-text-tertiary font-medium hidden sm:block">
          Quicksand + Inter
        </div>
      </div>
    </nav>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-500 mb-2">
          {label}
        </p>
        {children}
      </div>
    </section>
  );
}

// ─── Section A: Auth / Login ──────────────────────────────────────────────────

function AuthSection() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Section label="Section A — Auth View">
      <h2 className="text-2xl font-bold text-text-primary mb-8">
        Login Screen
      </h2>
      <div className="flex justify-center">
        <div className="w-full max-w-sm bg-surface-0 rounded-2xl shadow-lg p-8 border border-surface-200">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-3xl mb-3 shadow-sm">
              🌊
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Amoria
            </h1>
            <p className="text-sm text-text-tertiary mt-1 text-center">
              Discover your love language together
            </p>
          </div>

          {/* Google OAuth */}
          <button className="w-full flex items-center justify-center gap-3 border border-surface-200 rounded-lg py-2.5 px-4 text-sm font-medium text-text-secondary hover:bg-surface-50 hover:border-primary-200 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 mb-4">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-surface-200" />
            <span className="mx-3 text-xs text-text-tertiary font-medium">
              or
            </span>
            <div className="flex-grow border-t border-surface-200" />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400 transition-all bg-surface-0"
            />
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400 transition-all bg-surface-0"
            />
          </div>

          {/* Login Button */}
          <button className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm">
            Log in
          </button>

          <p className="text-center text-xs text-text-tertiary mt-5">
            {"Don't have an account?"}{' '}
            <a
              href="#"
              className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </Section>
  );
}

// ─── Section B: Dashboard ────────────────────────────────────────────────────

const recentRooms = [
  {
    title: 'Morning Check-in',
    date: 'Today',
    score: '12–10',
    category: 'Intimacy',
  },
  {
    title: 'Weekend Reflections',
    date: 'Yesterday',
    score: '8–8',
    category: 'Values',
  },
  {
    title: 'Communication Deep Dive',
    date: '2 days ago',
    score: '15–11',
    category: 'Communication',
  },
];

function DashboardSection() {
  const [roomCode, setRoomCode] = useState('');

  return (
    <Section label="Section B — Dashboard View">
      <h2 className="text-2xl font-bold text-text-primary mb-8">Your Space</h2>
      <div className="bg-surface-0 rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 border-2 border-primary-200 flex items-center justify-center text-sm font-bold text-primary-700">
              AK
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary leading-tight">
                Alex & Kim
              </p>
              <p className="text-xs text-text-tertiary">
                Together since Jan 2023
              </p>
            </div>
          </div>
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-text-tertiary hover:bg-surface-50 hover:text-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Vibe Summary Card */}
          <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-1">
                  Romantic Vibe
                </p>
                <h3 className="text-lg font-bold text-text-primary">
                  Deeply Connected
                </h3>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-xl border border-primary-200">
                💙
              </div>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-2xl font-bold text-primary-600">87%</p>
                <p className="text-xs text-text-tertiary">Compatibility</p>
              </div>
              <div className="w-px bg-primary-200" />
              <div>
                <p className="text-2xl font-bold text-secondary-500">24</p>
                <p className="text-xs text-text-tertiary">Sessions</p>
              </div>
              <div className="w-px bg-primary-200" />
              <div>
                <p className="text-2xl font-bold text-primary-600">142</p>
                <p className="text-xs text-text-tertiary">Questions</p>
              </div>
            </div>
          </div>

          {/* Room Actions */}
          <div className="flex gap-3">
            <button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm">
              Create Room
            </button>
            <button className="flex-1 border border-primary-300 text-primary-600 hover:bg-primary-50 rounded-lg py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              Join Room
            </button>
          </div>

          {/* Room Code Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              maxLength={6}
              className="flex-1 font-mono text-center uppercase tracking-widest text-sm rounded-lg border border-surface-200 px-3 py-2.5 text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400 transition-all bg-surface-50"
            />
            <button
              disabled={roomCode.length < 4}
              className="px-4 py-2.5 bg-secondary-500 hover:bg-secondary-600 disabled:bg-surface-200 disabled:text-text-tertiary text-white rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
            >
              Join
            </button>
          </div>

          {/* Recent Games */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-3">
              Recent Sessions
            </p>
            <div className="space-y-2">
              {recentRooms.map((room) => (
                <div
                  key={room.title}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-surface-50 border border-surface-100 hover:border-primary-200 hover:bg-primary-50 transition-all cursor-pointer group"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-primary group-hover:text-primary-700 transition-colors">
                      {room.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-text-tertiary">
                        {room.date}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-surface-200" />
                      <span className="text-xs text-primary-600 font-medium">
                        {room.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-text-secondary font-mono">
                      {room.score}
                    </p>
                    <p className="text-xs text-text-tertiary">Score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── Section C: Game Session — Question View ──────────────────────────────────

const options = [
  'Trust and honesty above all else',
  'Open, empathetic communication',
  'Shared values and life goals',
  'Mutual respect and personal space',
];

function GameSessionSection() {
  const [selected, setSelected] = useState<number | null>(1);
  const timerPct = 62;

  return (
    <Section label="Section C — Game Session">
      <h2 className="text-2xl font-bold text-text-primary mb-8">
        Question View
      </h2>
      <div className="max-w-lg mx-auto bg-surface-0 rounded-2xl shadow-lg border border-surface-200 overflow-hidden">
        {/* Score Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-surface-50 border-b border-surface-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">
              A
            </div>
            <span className="text-sm font-bold text-text-primary">Alex: 7</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-text-tertiary">Q 4</span>
            <span className="text-text-tertiary mx-1">/</span>
            <span className="text-xs text-text-tertiary">10</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text-primary">Kim: 5</span>
            <div className="w-7 h-7 rounded-full bg-secondary-100 flex items-center justify-center text-xs font-bold text-secondary-600">
              K
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-5">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary-100 text-secondary-700">
              Communication
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
              Medium
            </span>
          </div>

          {/* Question */}
          <p className="text-base font-semibold text-text-primary leading-snug mb-5">
            {"What's the most important thing in a relationship?"}
          </p>

          {/* Options */}
          <div className="space-y-2.5 mb-6">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                  selected === i
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-surface-50 border border-surface-200 text-text-secondary hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700'
                }`}
              >
                <span
                  className={`inline-flex w-5 h-5 rounded-full mr-2.5 items-center justify-center text-xs font-bold ${
                    selected === i
                      ? 'bg-white/20 text-white'
                      : 'bg-surface-200 text-text-tertiary'
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            ))}
          </div>

          {/* Timer Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-text-tertiary mb-1.5">
              <span>Time remaining</span>
              <span className="font-mono font-semibold text-primary-600">
                0:{timerPct < 10 ? '0' : ''}
                {Math.floor(timerPct * 0.62)}s
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-400 transition-all"
                style={{ width: `${timerPct}%` }}
              />
            </div>
          </div>

          {/* Hint */}
          <p className="text-center text-xs text-text-tertiary font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-warning mr-1.5 animate-pulse" />
            Waiting for partner to answer…
          </p>
        </div>
      </div>
    </Section>
  );
}

// ─── Section D: Results Reveal ───────────────────────────────────────────────

function ResultsSection() {
  return (
    <Section label="Section D — Results Reveal">
      <h2 className="text-2xl font-bold text-text-primary mb-8">
        Answer Reveal
      </h2>
      <div className="max-w-lg mx-auto space-y-5">
        {/* Answer cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              name: 'Alex',
              initials: 'A',
              answer: 'Open, empathetic communication',
              color: 'primary',
            },
            {
              name: 'Kim',
              initials: 'K',
              answer: 'Open, empathetic communication',
              color: 'secondary',
            },
          ].map(({ name, initials, answer, color }) => (
            <div
              key={name}
              className={`bg-surface-0 rounded-2xl border p-4 shadow-sm ${
                color === 'primary'
                  ? 'border-primary-200'
                  : 'border-secondary-200'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                  color === 'primary'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-secondary-100 text-secondary-600'
                }`}
              >
                {initials}
              </div>
              <p className="text-xs font-semibold text-text-tertiary mb-1">
                {name} answered
              </p>
              <p className="text-sm font-semibold text-text-primary leading-snug">
                {answer}
              </p>
            </div>
          ))}
        </div>

        {/* Match Indicator */}
        <div className="bg-surface-0 rounded-2xl border border-success/30 p-4 shadow-sm flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">
              Perfect Match!
            </p>
            <p className="text-xs text-success font-semibold">+1 point each</p>
          </div>
          <div className="ml-auto text-2xl font-bold text-success">+1</div>
        </div>

        {/* Educational Tip */}
        <div className="bg-secondary-50 border border-secondary-200 rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-600 mb-1.5">
            Did you know?
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            Couples who prioritize open communication report{' '}
            <span className="font-semibold text-secondary-600">
              67% higher relationship satisfaction
            </span>{' '}
            {"than those who don't. Practice active listening daily."}
          </p>
        </div>

        {/* Next button */}
        <button className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-lg py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm flex items-center justify-center gap-2">
          Next Question
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </Section>
  );
}

// ─── Section E: Component Showcase ───────────────────────────────────────────

const colorSwatches = [
  { label: 'primary-50', bg: 'bg-primary-50', text: '#ECFEFF' },
  { label: 'primary-100', bg: 'bg-primary-100', text: '#CFFAFE' },
  { label: 'primary-300', bg: 'bg-primary-300', text: '#67E8F9' },
  { label: 'primary-500', bg: 'bg-primary-500', text: '#06B6D4' },
  { label: 'primary-600', bg: 'bg-primary-600', text: '#0891B2' },
  { label: 'primary-700', bg: 'bg-primary-700', text: '#0E7490' },
  { label: 'secondary-100', bg: 'bg-secondary-100', text: '#E0E7FF' },
  { label: 'secondary-300', bg: 'bg-secondary-300', text: '#A5B4FC' },
  { label: 'secondary-500', bg: 'bg-secondary-500', text: '#6366F1' },
  { label: 'secondary-600', bg: 'bg-secondary-600', text: '#4F46E5' },
  { label: 'surface-50', bg: 'bg-surface-50', text: '#F0FDFA' },
  { label: 'surface-100', bg: 'bg-surface-100', text: '#F0F9FF' },
];

const badges = [
  { label: 'Communication', cls: 'bg-secondary-100 text-secondary-700' },
  { label: 'Intimacy', cls: 'bg-primary-100 text-primary-700' },
  { label: 'Values', cls: 'bg-emerald-100 text-emerald-700' },
  { label: 'Medium', cls: 'bg-amber-100 text-amber-700' },
  {
    label: 'Easy',
    cls: 'bg-primary-50 text-primary-600 border border-primary-200',
  },
  { label: 'Hard', cls: 'bg-red-100 text-red-700' },
];

function ComponentShowcaseSection() {
  const [inputVal, setInputVal] = useState('');

  return (
    <Section label="Section E — Component Showcase">
      <h2 className="text-2xl font-bold text-text-primary mb-8">
        Design System
      </h2>
      <div className="space-y-10">
        {/* Typography */}
        <div className="bg-surface-0 rounded-2xl border border-surface-200 p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-5">
            Typography — Quicksand (headings) + Inter (body)
          </p>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-text-primary">
              H1 — Amoria Together
            </h1>
            <h2 className="text-3xl font-bold text-text-primary">
              H2 — Your Journey
            </h2>
            <h3 className="text-2xl font-bold text-text-primary">
              H3 — Daily Reflections
            </h3>
            <h4 className="text-xl font-bold text-text-primary">
              H4 — Session Overview
            </h4>
            <h5 className="text-lg font-semibold text-text-primary">
              H5 — Question Category
            </h5>
            <h6 className="text-base font-semibold text-text-secondary">
              H6 — Room Details
            </h6>
            <p className="text-sm text-text-secondary leading-relaxed mt-3">
              Body — Open, honest conversations help couples build deeper
              understanding. Share your thoughts freely and listen with empathy
              to strengthen your bond every day.
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              Caption — Session completed · March 2, 2026 · 12 questions
              answered
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-surface-0 rounded-2xl border border-surface-200 p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-5">
            Buttons
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm">
              Primary
            </button>
            <button className="px-5 py-2.5 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 shadow-sm">
              Secondary
            </button>
            <button className="px-5 py-2.5 border-2 border-primary-400 text-primary-600 hover:bg-primary-50 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              Outlined
            </button>
            <button className="px-5 py-2.5 border border-surface-200 text-text-tertiary hover:bg-surface-50 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-surface-200 focus:ring-offset-2">
              Ghost
            </button>
            <button
              disabled
              className="px-5 py-2.5 bg-surface-200 text-text-tertiary rounded-lg text-sm font-semibold cursor-not-allowed opacity-60"
            >
              Disabled
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-surface-0 rounded-2xl border border-surface-200 p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-5">
            Badges
          </p>
          <div className="flex flex-wrap gap-2">
            {badges.map(({ label, cls }) => (
              <span
                key={label}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="bg-surface-0 rounded-2xl border border-surface-200 p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-5">
            Inputs
          </p>
          <div className="max-w-sm space-y-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Default Input
              </label>
              <input
                type="text"
                placeholder="Type something..."
                className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400 transition-all bg-surface-0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                With Value (Focused State)
              </label>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Focus to see ring..."
                className="w-full rounded-lg border border-primary-400 ring-2 ring-primary-500 px-3 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none transition-all bg-surface-0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Error State
              </label>
              <input
                type="text"
                defaultValue="invalid@"
                className="w-full rounded-lg border border-error ring-2 ring-error/30 px-3 py-2.5 text-sm text-text-primary focus:outline-none transition-all bg-surface-0"
              />
              <p className="text-xs text-error mt-1 font-medium">
                Please enter a valid email address
              </p>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="bg-surface-0 rounded-2xl border border-surface-200 p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-5">
            Color Palette
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {colorSwatches.map(({ label, bg, text }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-full aspect-square rounded-xl border border-surface-200 shadow-sm ${bg}`}
                />
                <span className="text-[10px] text-text-tertiary font-medium text-center leading-tight">
                  {label}
                </span>
                <span className="text-[9px] text-text-tertiary font-mono opacity-70">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function SectionDivider() {
  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
    </div>
  );
}

// ─── Root Showcase ────────────────────────────────────────────────────────────

export default function Showcase() {
  return (
    <div
      className="min-h-screen bg-surface-50"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <NavBar />

      {/* Hero header */}
      <div className="pt-14">
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 border border-primary-200 mb-4">
            <span className="text-base">🌊</span>
            <span className="text-xs font-semibold text-primary-700 tracking-wide">
              Ocean Breeze
            </span>
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Variant 2
          </h1>
          <p className="text-base text-text-tertiary max-w-lg">
            Clean, airy and refreshing. A teal-cyan and indigo palette inspired
            by calm coastal mornings — clarity and depth in every interaction.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
              Teal / Cyan
            </span>
            <span className="px-3 py-1 rounded-full bg-secondary-100 text-secondary-700 text-xs font-semibold">
              Indigo
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-100 text-text-secondary text-xs font-semibold border border-surface-200">
              Quicksand
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-100 text-text-secondary text-xs font-semibold border border-surface-200">
              Inter
            </span>
          </div>
        </div>
      </div>

      <SectionDivider />
      <AuthSection />
      <SectionDivider />
      <DashboardSection />
      <SectionDivider />
      <GameSessionSection />
      <SectionDivider />
      <ResultsSection />
      <SectionDivider />
      <ComponentShowcaseSection />

      {/* Footer */}
      <footer className="border-t border-surface-200 bg-surface-0 py-8 mt-8">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-tertiary">
            <span className="text-base">🌊</span>
            <span className="font-semibold text-text-secondary">Amoria</span>
            <span>— Variant 2: Ocean Breeze</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: 26 }, (_, i) => i + 1).map((n) => (
              <a
                key={n}
                href={`/${n}`}
                className={`w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-semibold transition-colors ${
                  n === 2
                    ? 'bg-primary-500 text-white'
                    : 'text-text-tertiary hover:bg-surface-50'
                }`}
              >
                {n}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
