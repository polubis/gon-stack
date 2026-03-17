/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';

const NAV_LINKS = Array.from({ length: 26 }, (_, i) => ({
  label: `/${i + 1}`,
  href: `/${i + 1}`,
}));

// --- Section A: Auth View ---
function AuthView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm bg-surface-50 border border-surface-200 rounded-lg shadow-lg p-8 flex flex-col gap-6">
        {/* Logo + App Name */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl leading-none select-none">✨</div>
          <h1
            className="text-4xl font-semibold tracking-wide text-text-primary"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Amoria
          </h1>
          <p className="text-sm text-text-secondary text-center leading-relaxed">
            Discover your love language together
          </p>
        </div>

        {/* Google OAuth */}
        <button
          className="w-full flex items-center justify-center gap-3 border border-surface-200 rounded-sm px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-50 transition-colors"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <svg
            className="w-5 h-5 shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
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
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-surface-200" />
          <span className="text-xs text-text-tertiary uppercase tracking-widest">
            or
          </span>
          <div className="flex-1 h-px bg-surface-200" />
        </div>

        {/* Email + Password */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium text-text-secondary uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-surface-100 text-text-primary border border-surface-200 rounded-sm px-3 py-2.5 text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              style={{ fontFamily: 'var(--font-sans)' }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium text-text-secondary uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-100 text-text-primary border border-surface-200 rounded-sm px-3 py-2.5 text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              style={{ fontFamily: 'var(--font-sans)' }}
            />
          </div>
        </div>

        {/* Log in button */}
        <button
          className="w-full bg-primary-500 text-surface-0 rounded-sm px-4 py-2.5 text-sm font-semibold uppercase tracking-widest hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-50 transition-colors"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Log in
        </button>

        <p
          className="text-center text-xs text-text-tertiary"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          No account?{' '}
          <a
            href="#"
            className="text-primary-400 hover:text-primary-300 underline underline-offset-2 transition-colors"
          >
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}

// --- Section B: Dashboard View ---
function DashboardView() {
  const [roomCode, setRoomCode] = useState('');

  return (
    <div className="flex flex-col gap-6 px-4">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-surface-50 border border-surface-200 rounded-lg px-5 py-3 shadow-md">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 ring-2 ring-primary-400 ring-offset-2 ring-offset-surface-50 flex items-center justify-center text-surface-0 font-semibold text-sm"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            A
          </div>
          <div>
            <p
              className="text-text-primary font-medium text-sm"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Amelia
            </p>
            <p
              className="text-text-tertiary text-xs"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Connected with James
            </p>
          </div>
        </div>
        <button className="text-text-tertiary hover:text-primary-400 transition-colors p-2 rounded-sm hover:bg-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </button>
      </div>

      {/* Romantic vibe card */}
      <div className="bg-surface-100 border border-primary-400/30 rounded-lg p-5 flex flex-col gap-3 shadow-md">
        <div className="flex items-center justify-between">
          <h3
            className="text-lg text-text-primary"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Tonight's Vibe
          </h3>
          <span
            className="text-xs bg-primary-500/20 text-primary-300 px-2.5 py-1 rounded-full uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Active
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-3xl">🕯️</div>
          <div>
            <p
              className="text-text-primary font-medium text-sm"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Candlelit Intimacy
            </p>
            <p
              className="text-text-tertiary text-xs"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Deep connection · 12 questions remaining
            </p>
          </div>
        </div>
        <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full w-3/5 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #CA8A04, #EAB308, #FBBF24)',
            }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          className="bg-primary-500 text-surface-0 rounded-sm px-4 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-0 transition-colors"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Create Room
        </button>
        <button
          className="border border-primary-500 text-primary-400 rounded-sm px-4 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-primary-500/10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-0 transition-colors"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Join Room
        </button>
      </div>

      {/* Room code input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          placeholder="ENTER CODE"
          maxLength={6}
          className="flex-1 bg-surface-100 border border-surface-200 text-primary-400 rounded-sm px-4 py-2.5 text-sm font-mono tracking-[0.3em] uppercase placeholder:text-text-tertiary placeholder:tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        />
        <button
          className="bg-surface-100 border border-primary-500 text-primary-400 rounded-sm px-4 py-2.5 text-sm font-semibold hover:bg-primary-500/10 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Go
        </button>
      </div>

      {/* Recent games */}
      <div className="flex flex-col gap-3">
        <h3
          className="text-base text-text-secondary uppercase tracking-widest text-xs"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Recent Sessions
        </h3>
        {[
          {
            emoji: '💬',
            title: 'Love Languages Deep Dive',
            date: 'Yesterday',
            score: '8/10',
          },
          {
            emoji: '🌙',
            title: 'Midnight Reflections',
            date: '3 days ago',
            score: '7/10',
          },
        ].map((game) => (
          <div
            key={game.title}
            className="bg-surface-50 border border-surface-200 rounded-lg px-4 py-3 flex items-center justify-between hover:border-primary-400/40 hover:bg-surface-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{game.emoji}</span>
              <div>
                <p
                  className="text-text-primary text-sm font-medium"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {game.title}
                </p>
                <p
                  className="text-text-tertiary text-xs"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {game.date}
                </p>
              </div>
            </div>
            <span
              className="text-primary-400 text-sm font-semibold"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {game.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Section C: Game Session - Question View ---
function QuestionView() {
  const [selected, setSelected] = useState<number | null>(null);

  const options = [
    'Quality time together',
    'Words of affirmation',
    'Physical touch',
    'Acts of service',
  ];

  return (
    <div className="flex flex-col gap-5 px-4">
      {/* Score bar */}
      <div className="bg-surface-50 border border-surface-200 rounded-lg px-5 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-surface-0 text-xs font-bold"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            A
          </div>
          <span
            className="text-primary-400 font-semibold text-sm"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            240
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span
            className="text-text-tertiary text-xs uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Question
          </span>
          <span
            className="text-text-primary font-semibold text-sm"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            4 / 10
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-primary-400 font-semibold text-sm"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            195
          </span>
          <div
            className="w-7 h-7 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white text-xs font-bold"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            J
          </div>
        </div>
      </div>

      {/* Category + difficulty */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs bg-secondary-500/20 text-secondary-300 px-3 py-1 rounded-full uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Love Languages
        </span>
        <span
          className="text-xs bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Intimate
        </span>
      </div>

      {/* Question */}
      <h2
        className="text-2xl leading-snug text-text-primary"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        What makes you feel most loved in your relationship?
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {options.map((option, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={option}
              onClick={() => setSelected(i)}
              className={[
                'w-full text-left px-4 py-3.5 rounded-lg border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-0',
                isSelected
                  ? 'bg-primary-500 border-primary-500 text-surface-0'
                  : 'bg-surface-100 border-surface-200 text-text-primary hover:border-primary-400/50 hover:bg-surface-50',
              ].join(' ')}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <span
                className={`inline-block w-6 h-6 rounded-sm mr-3 text-center text-xs leading-6 font-bold border ${isSelected ? 'bg-surface-0/20 border-surface-0/30 text-surface-0' : 'border-surface-200 text-text-tertiary'}`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Timer bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <span
            className="text-xs text-text-tertiary uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Time remaining
          </span>
          <span
            className="text-xs text-primary-400 font-semibold"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            18s
          </span>
        </div>
        <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full w-3/5 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #CA8A04, #EAB308, #FBBF24)',
            }}
          />
        </div>
      </div>

      {/* Waiting indicator */}
      <div
        className="flex items-center justify-center gap-2 text-text-tertiary text-xs"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary-400 animate-pulse" />
        Waiting for partner...
      </div>
    </div>
  );
}

// --- Section D: Results Reveal ---
function ResultsView() {
  return (
    <div className="flex flex-col gap-6 px-4">
      <div className="text-center">
        <h2
          className="text-3xl text-text-primary"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Results
        </h2>
        <p
          className="text-text-tertiary text-sm mt-1"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Question 4 of 10
        </p>
      </div>

      {/* Two answer cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            name: 'Amelia',
            initial: 'A',
            answer: 'Quality time together',
            gradient: 'from-primary-400 to-primary-600',
            match: true,
          },
          {
            name: 'James',
            initial: 'J',
            answer: 'Quality time together',
            gradient: 'from-secondary-400 to-secondary-600',
            match: true,
          },
        ].map((card) => (
          <div
            key={card.name}
            className={`bg-surface-100 border rounded-lg p-4 flex flex-col gap-3 ${card.match ? 'border-primary-400/40' : 'border-surface-200'}`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {card.initial}
              </div>
              <span
                className="text-text-secondary text-xs font-medium"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {card.name}
              </span>
            </div>
            <p
              className="text-text-primary text-xs leading-relaxed"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {card.answer}
            </p>
          </div>
        ))}
      </div>

      {/* Match indicator */}
      <div className="flex flex-col items-center gap-2 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <span
            className="text-xl font-semibold text-success"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Perfect Match!
          </span>
          <span className="text-2xl">✨</span>
        </div>
        <p
          className="text-text-tertiary text-xs"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          You both chose the same answer
        </p>
        <span
          className="text-primary-400 text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          +100 pts each
        </span>
      </div>

      {/* Tip card */}
      <div className="bg-secondary-500/10 border border-secondary-500/30 rounded-lg p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-secondary-400">💡</span>
          <span
            className="text-secondary-300 text-xs font-semibold uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Insight
          </span>
        </div>
        <p
          className="text-text-secondary text-sm leading-relaxed"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Couples who share quality time as their primary love language often
          report higher satisfaction in long-term relationships.
        </p>
      </div>

      {/* Next button */}
      <button
        className="w-full bg-primary-500 text-surface-0 rounded-sm px-4 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-0 transition-colors"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        Next Question
      </button>
    </div>
  );
}

// --- Section E: Component Showcase ---
function ComponentShowcase() {
  const [inputVal, setInputVal] = useState('');

  const primarySwatches = [
    { label: '50', cls: 'bg-primary-50', textCls: 'text-surface-0' },
    { label: '100', cls: 'bg-primary-100', textCls: 'text-surface-0' },
    { label: '200', cls: 'bg-primary-200', textCls: 'text-surface-0' },
    { label: '300', cls: 'bg-primary-300', textCls: 'text-surface-0' },
    { label: '400', cls: 'bg-primary-400', textCls: 'text-surface-0' },
    { label: '500', cls: 'bg-primary-500', textCls: 'text-surface-0' },
    { label: '600', cls: 'bg-primary-600', textCls: 'text-text-primary' },
    { label: '700', cls: 'bg-primary-700', textCls: 'text-text-primary' },
  ];

  const secondarySwatches = [
    { label: '200', cls: 'bg-secondary-200', textCls: 'text-surface-0' },
    { label: '300', cls: 'bg-secondary-300', textCls: 'text-surface-0' },
    { label: '400', cls: 'bg-secondary-400', textCls: 'text-surface-0' },
    { label: '500', cls: 'bg-secondary-500', textCls: 'text-white' },
    { label: '600', cls: 'bg-secondary-600', textCls: 'text-text-primary' },
    { label: '700', cls: 'bg-secondary-700', textCls: 'text-text-primary' },
  ];

  const surfaceSwatches = [
    {
      label: 'surface-0',
      cls: 'bg-surface-0',
      border: 'border border-surface-200',
    },
    {
      label: 'surface-50',
      cls: 'bg-surface-50',
      border: 'border border-surface-200',
    },
    {
      label: 'surface-100',
      cls: 'bg-surface-100',
      border: 'border border-surface-200',
    },
    { label: 'surface-200', cls: 'bg-surface-200', border: '' },
  ];

  return (
    <div className="flex flex-col gap-8 px-4">
      {/* Typography */}
      <div className="bg-surface-50 border border-surface-200 rounded-lg p-6 flex flex-col gap-4 shadow-md">
        <h3
          className="text-xs text-text-tertiary uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Typography — Cormorant Garamond
        </h3>
        <h1
          className="text-5xl text-text-primary leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Heading One
        </h1>
        <h2
          className="text-4xl text-text-primary leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Heading Two
        </h2>
        <h3
          className="text-3xl text-text-primary leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Heading Three
        </h3>
        <h4
          className="text-2xl text-primary-400 leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Heading Four — Gold
        </h4>
        <h5
          className="text-xl text-secondary-300 leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Heading Five — Lavender
        </h5>
        <h6
          className="text-lg text-text-secondary leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Heading Six
        </h6>
        <div className="h-px bg-surface-200" />
        <p
          className="text-text-primary text-base leading-relaxed"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Body text — Raleway. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit. Sed do eiusmod tempor incididunt.
        </p>
        <p
          className="text-text-secondary text-sm leading-relaxed"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Secondary text — smaller, softer. Used for descriptions, captions, and
          supporting copy.
        </p>
        <p
          className="text-text-tertiary text-xs uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Tertiary text — labels and metadata
        </p>
      </div>

      {/* Buttons */}
      <div className="bg-surface-50 border border-surface-200 rounded-lg p-6 flex flex-col gap-4 shadow-md">
        <h3
          className="text-xs text-text-tertiary uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Buttons
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            className="bg-primary-500 text-surface-0 rounded-sm px-5 py-2.5 text-sm font-semibold uppercase tracking-widest hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-50 transition-colors"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Primary Gold
          </button>
          <button
            className="bg-secondary-500 text-white rounded-sm px-5 py-2.5 text-sm font-semibold uppercase tracking-widest hover:bg-secondary-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:ring-offset-surface-50 transition-colors"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Secondary Purple
          </button>
          <button
            className="border border-primary-500 text-primary-400 rounded-sm px-5 py-2.5 text-sm font-semibold uppercase tracking-widest hover:bg-primary-500/10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-50 transition-colors"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Outlined Gold
          </button>
          <button
            className="border border-surface-200 text-text-tertiary rounded-sm px-5 py-2.5 text-sm font-semibold uppercase tracking-widest cursor-not-allowed opacity-40"
            disabled
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Disabled
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-surface-50 border border-surface-200 rounded-lg p-6 flex flex-col gap-4 shadow-md">
        <h3
          className="text-xs text-text-tertiary uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Badges
        </h3>
        <div className="flex flex-wrap gap-2">
          <span
            className="text-xs bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Gold
          </span>
          <span
            className="text-xs bg-secondary-500/20 text-secondary-300 px-3 py-1 rounded-full uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Purple
          </span>
          <span
            className="text-xs bg-success/20 text-success px-3 py-1 rounded-full uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Success
          </span>
          <span
            className="text-xs bg-warning/20 text-warning px-3 py-1 rounded-full uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Warning
          </span>
          <span
            className="text-xs bg-error/20 text-error px-3 py-1 rounded-full uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Error
          </span>
          <span
            className="text-xs bg-surface-100 text-text-secondary px-3 py-1 rounded-full border border-surface-200 uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Neutral
          </span>
        </div>
      </div>

      {/* Input */}
      <div className="bg-surface-50 border border-surface-200 rounded-lg p-6 flex flex-col gap-4 shadow-md">
        <h3
          className="text-xs text-text-tertiary uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Input
        </h3>
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-medium text-text-secondary uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Focus to see gold ring
          </label>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type something..."
            className="w-full bg-surface-100 text-text-primary border border-surface-200 rounded-sm px-3 py-2.5 text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            style={{ fontFamily: 'var(--font-sans)' }}
          />
        </div>
      </div>

      {/* Color palette */}
      <div className="bg-surface-50 border border-surface-200 rounded-lg p-6 flex flex-col gap-5 shadow-md">
        <h3
          className="text-xs text-text-tertiary uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Color Palette
        </h3>

        <div className="flex flex-col gap-2">
          <p
            className="text-text-tertiary text-xs uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Primary — Gold
          </p>
          <div className="flex rounded-lg overflow-hidden h-10">
            {primarySwatches.map((s) => (
              <div
                key={s.label}
                className={`flex-1 flex items-center justify-center ${s.cls}`}
              >
                <span
                  className={`text-[10px] font-bold ${s.textCls} opacity-70`}
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p
            className="text-text-tertiary text-xs uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Secondary — Purple
          </p>
          <div className="flex rounded-lg overflow-hidden h-10">
            {secondarySwatches.map((s) => (
              <div
                key={s.label}
                className={`flex-1 flex items-center justify-center ${s.cls}`}
              >
                <span
                  className={`text-[10px] font-bold ${s.textCls} opacity-70`}
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p
            className="text-text-tertiary text-xs uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Surface — Dark
          </p>
          <div className="flex gap-2">
            {surfaceSwatches.map((s) => (
              <div
                key={s.label}
                className={`flex-1 h-10 rounded-lg ${s.cls} ${s.border} flex items-end p-1`}
              >
                <span
                  className="text-text-tertiary text-[9px]"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p
            className="text-text-tertiary text-xs uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Status
          </p>
          <div className="flex gap-2">
            {[
              { label: 'Success', cls: 'bg-success' },
              { label: 'Warning', cls: 'bg-warning' },
              { label: 'Error', cls: 'bg-error' },
            ].map((s) => (
              <div
                key={s.label}
                className={`flex-1 h-10 rounded-lg ${s.cls} flex items-end p-1`}
              >
                <span
                  className="text-white text-[9px] font-medium"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Section label header ---
function SectionHeader({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-4 pt-2">
      <p
        className="text-xs text-text-tertiary uppercase tracking-widest"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {label}
      </p>
      <h2
        className="text-xl text-text-primary"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {description}
      </h2>
      <div className="h-px bg-surface-200 mt-3" />
    </div>
  );
}

// --- Main Showcase ---
export default function Showcase() {
  return (
    <div
      className="min-h-screen bg-surface-0 text-text-primary"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-surface-50/90 border-b border-surface-200 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span
              className="text-lg text-primary-400 leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Variant 5: Midnight Luxe
            </span>
            <span
              className="text-text-tertiary text-[10px] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Cormorant Garamond + Raleway
            </span>
          </div>
          <div className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  link.href === '/5'
                    ? 'bg-primary-500 text-surface-0'
                    : 'text-text-tertiary hover:text-primary-400 hover:bg-surface-100'
                }`}
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-4xl mx-auto py-10 flex flex-col gap-12">
        {/* Section A */}
        <section className="flex flex-col gap-6">
          <SectionHeader label="Section A" description="Auth View — Login" />
          <AuthView />
        </section>

        {/* Section B */}
        <section className="flex flex-col gap-6">
          <SectionHeader
            label="Section B"
            description="Dashboard — Rooms & Activity"
          />
          <DashboardView />
        </section>

        {/* Section C */}
        <section className="flex flex-col gap-6">
          <SectionHeader
            label="Section C"
            description="Game Session — Question View"
          />
          <QuestionView />
        </section>

        {/* Section D */}
        <section className="flex flex-col gap-6">
          <SectionHeader label="Section D" description="Results Reveal" />
          <ResultsView />
        </section>

        {/* Section E */}
        <section className="flex flex-col gap-6">
          <SectionHeader
            label="Section E"
            description="Component Showcase — Design System"
          />
          <ComponentShowcase />
        </section>

        <div className="h-12" />
      </main>
    </div>
  );
}
