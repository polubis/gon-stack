/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';

// ─── Section A: Auth / Login ──────────────────────────────────────────────────

function AuthSection() {
  return (
    <section className="py-16 px-4 flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-text-secondary mb-8 font-[var(--font-heading)]">
        A · Auth View
      </h2>
      <div className="w-full max-w-sm bg-surface-0 rounded-xl shadow-lg p-8 flex flex-col gap-5">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center shadow-md">
            <span className="text-2xl select-none">🌅</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Amoria
          </h1>
          <p className="text-sm text-text-tertiary text-center leading-snug">
            Discover your love language together
          </p>
        </div>

        {/* Google OAuth */}
        <button className="w-full flex items-center justify-center gap-3 border border-primary-300 rounded-md py-2.5 px-4 text-sm font-semibold text-text-secondary hover:bg-primary-50 hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-primary-200" />
          <span className="text-xs text-text-tertiary font-medium">or</span>
          <div className="flex-1 h-px bg-primary-200" />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full border border-primary-200 rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary bg-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full border border-primary-200 rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary bg-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>

        {/* Submit */}
        <button className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold rounded-md py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm">
          Log in
        </button>

        <p className="text-xs text-text-tertiary text-center">
          No account?{' '}
          <a
            href="#"
            className="text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-2"
          >
            Sign up free
          </a>
        </p>
      </div>
    </section>
  );
}

// ─── Section B: Dashboard ─────────────────────────────────────────────────────

function DashboardSection() {
  const [roomCode, setRoomCode] = useState('');

  return (
    <section className="py-16 px-4 flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-text-secondary mb-8 font-[var(--font-heading)]">
        B · Dashboard View
      </h2>
      <div className="w-full max-w-sm flex flex-col gap-4">
        {/* Top bar */}
        <div className="bg-surface-0 rounded-xl shadow-sm px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              S
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary leading-none">
                Sofia
              </p>
              <p className="text-xs text-text-tertiary mt-0.5">Online</p>
            </div>
          </div>
          <button className="w-8 h-8 rounded-md hover:bg-surface-200 flex items-center justify-center text-text-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.764-.384.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </button>
        </div>

        {/* Romantic vibe card */}
        <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">
                Today's Vibe
              </p>
              <p className="text-base font-bold text-text-primary">
                Golden Hour Together
              </p>
              <p className="text-sm text-text-secondary mt-1 leading-snug">
                Share what makes you feel most loved right now
              </p>
            </div>
            <span className="text-2xl ml-2 mt-0.5 select-none">🌅</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-primary-200 overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400" />
            </div>
            <span className="text-xs font-semibold text-primary-600">2/3</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold rounded-xl py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm flex flex-col items-center gap-1">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Create Room
          </button>
          <button className="bg-surface-0 hover:bg-surface-100 border border-primary-200 hover:border-primary-400 text-text-primary font-semibold rounded-xl py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex flex-col items-center gap-1">
            <svg
              className="w-5 h-5 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
              />
            </svg>
            Join Room
          </button>
        </div>

        {/* Room code input */}
        <div className="bg-surface-0 rounded-xl p-4 shadow-sm flex flex-col gap-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            Enter Room Code
          </label>
          <div className="flex gap-2">
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. SUNSET"
              maxLength={8}
              className="flex-1 border border-primary-200 rounded-md px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-tertiary bg-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase tracking-widest transition"
            />
            <button className="bg-secondary-500 hover:bg-secondary-600 text-white font-semibold rounded-md px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-1">
              Join
            </button>
          </div>
        </div>

        {/* Recent games */}
        <div className="bg-surface-0 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-200">
            <p className="text-sm font-semibold text-text-primary">
              Recent Games
            </p>
          </div>
          {[
            {
              title: 'Love Languages',
              date: 'Yesterday',
              score: '8/10',
              match: '92%',
            },
            {
              title: 'Dream Dates',
              date: '2 days ago',
              score: '7/10',
              match: '85%',
            },
          ].map((g) => (
            <div
              key={g.title}
              className="px-4 py-3 flex items-center justify-between hover:bg-surface-50 transition-colors border-b last:border-0 border-surface-100 cursor-pointer"
            >
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {g.title}
                </p>
                <p className="text-xs text-text-tertiary mt-0.5">{g.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary-600">{g.match}</p>
                <p className="text-xs text-text-tertiary">{g.score}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section C: Game Session – Question ──────────────────────────────────────

function GameQuestionSection() {
  const [selected, setSelected] = useState<number | null>(null);
  const options = [
    'Quality time together',
    'Words of affirmation',
    'Physical touch & closeness',
    'Acts of service',
  ];

  return (
    <section className="py-16 px-4 flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-text-secondary mb-8 font-[var(--font-heading)]">
        C · Game Session — Question
      </h2>
      <div className="w-full max-w-sm bg-surface-0 rounded-xl shadow-lg overflow-hidden">
        {/* Score bar */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-xs font-semibold">You</span>
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              240 pts
            </span>
          </div>
          <div className="text-white text-xs font-semibold opacity-80">
            Q 3/10
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              210 pts
            </span>
            <span className="text-white text-xs font-semibold">Partner</span>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Badges */}
          <div className="flex items-center gap-2">
            <span className="bg-secondary-100 text-secondary-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              Love Languages
            </span>
            <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              Medium
            </span>
          </div>

          {/* Question */}
          <h3 className="text-base font-bold text-text-primary leading-snug">
            What makes you feel most appreciated by your partner on a regular
            day?
          </h3>

          {/* Options */}
          <div className="flex flex-col gap-2.5">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                  selected === i
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-surface-200 bg-surface-50 text-text-secondary hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                <span className="font-bold text-text-tertiary mr-2">
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            ))}
          </div>

          {/* Timer bar */}
          <div>
            <div className="flex justify-between text-xs text-text-tertiary mb-1">
              <span>Time remaining</span>
              <span className="font-semibold text-primary-600">18s</span>
            </div>
            <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 transition-all"
                style={{ width: '60%' }}
              />
            </div>
          </div>

          {/* Waiting indicator */}
          <div className="flex items-center justify-center gap-2 py-2 bg-surface-50 rounded-lg">
            <div className="flex gap-1">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce"
                  style={{ animationDelay: `${d * 150}ms` }}
                />
              ))}
            </div>
            <span className="text-xs text-text-tertiary italic">
              Waiting for partner…
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section D: Results Reveal ────────────────────────────────────────────────

function ResultsSection() {
  return (
    <section className="py-16 px-4 flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-text-secondary mb-8 font-[var(--font-heading)]">
        D · Results Reveal
      </h2>
      <div className="w-full max-w-sm bg-surface-0 rounded-xl shadow-lg overflow-hidden">
        {/* Header strip */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-5 py-4 text-white text-center">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-0.5">
            Round Result
          </p>
          <p className="text-lg font-bold">Question 3 of 10</p>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Two answer cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'You',
                answer: 'Quality time together',
                correct: true,
                color: 'primary',
              },
              {
                label: 'Partner',
                answer: 'Quality time together',
                correct: true,
                color: 'secondary',
              },
            ].map((card) => (
              <div
                key={card.label}
                className={`rounded-xl p-3 border-2 flex flex-col gap-1.5 ${
                  card.color === 'primary'
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-secondary-300 bg-secondary-50'
                }`}
              >
                <p
                  className={`text-xs font-bold uppercase tracking-wide ${
                    card.color === 'primary'
                      ? 'text-primary-600'
                      : 'text-secondary-600'
                  }`}
                >
                  {card.label}
                </p>
                <p className="text-xs font-semibold text-text-primary leading-snug">
                  {card.answer}
                </p>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold ${
                    card.correct ? 'text-success' : 'text-error'
                  }`}
                >
                  {card.correct ? '✓ Match' : '✗ Miss'}
                </span>
              </div>
            ))}
          </div>

          {/* Match indicator */}
          <div className="flex flex-col items-center gap-1 py-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
            <span className="text-3xl font-black bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              100%
            </span>
            <p className="text-xs font-semibold text-text-secondary">
              Perfect Match!
            </p>
          </div>

          {/* Points */}
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-text-tertiary">Points earned</span>
            <span className="text-lg font-black text-primary-600">+50 pts</span>
          </div>

          {/* Tip card */}
          <div className="bg-surface-50 rounded-xl p-4 border border-surface-200">
            <p className="text-xs font-bold text-primary-600 mb-1">Tip</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Spending intentional quality time strengthens emotional bonds.
              Plan a sunset walk this week!
            </p>
          </div>

          {/* Next Question */}
          <button className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-bold rounded-xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all shadow-md">
            Next Question →
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Section E: Component Showcase ───────────────────────────────────────────

function ComponentShowcase() {
  return (
    <section className="py-16 px-4 flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-text-secondary mb-8 font-[var(--font-heading)]">
        E · Component Showcase
      </h2>
      <div className="w-full max-w-2xl flex flex-col gap-8">
        {/* Typography */}
        <div className="bg-surface-0 rounded-xl shadow-sm p-6 flex flex-col gap-3">
          <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-1">
            Typography — Outfit + Source Sans 3
          </p>
          <h1 className="text-4xl font-black text-text-primary leading-tight">
            H1 — Love Language
          </h1>
          <h2 className="text-3xl font-bold text-text-primary">
            H2 — Sunset Together
          </h2>
          <h3 className="text-2xl font-bold text-text-primary">
            H3 — Golden Warmth
          </h3>
          <h4 className="text-xl font-semibold text-text-primary">
            H4 — Quiet Moments
          </h4>
          <h5 className="text-lg font-semibold text-text-secondary">
            H5 — Body warmth & care
          </h5>
          <h6 className="text-base font-semibold text-text-secondary">
            H6 — Small acts of love
          </h6>
          <p className="text-sm text-text-secondary leading-relaxed mt-1">
            Body — Source Sans 3. Warm, inviting copy that feels like the golden
            hour before sunset. Comfortable, readable, and full of life.
          </p>
          <p className="text-xs text-text-tertiary">
            Caption · Supporting text and metadata in tertiary stone
          </p>
        </div>

        {/* Buttons */}
        <div className="bg-surface-0 rounded-xl shadow-sm p-6">
          <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-4">
            Buttons
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <button className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold rounded-md px-5 py-2.5 text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              Primary (Orange)
            </button>
            <button className="bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700 text-white font-semibold rounded-md px-5 py-2.5 text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2">
              Secondary (Rose)
            </button>
            <button className="border-2 border-primary-400 hover:border-primary-500 hover:bg-primary-50 text-primary-600 font-semibold rounded-md px-5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              Outlined
            </button>
            <button className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold rounded-md px-5 py-2.5 text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              Gradient
            </button>
            <button
              disabled
              className="bg-surface-200 text-text-tertiary font-semibold rounded-md px-5 py-2.5 text-sm cursor-not-allowed opacity-60"
            >
              Disabled
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-surface-0 rounded-xl shadow-sm p-6">
          <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-4">
            Badges
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full">
              Primary
            </span>
            <span className="bg-secondary-100 text-secondary-700 text-xs font-semibold px-3 py-1 rounded-full">
              Secondary
            </span>
            <span className="bg-surface-200 text-text-secondary text-xs font-semibold px-3 py-1 rounded-full">
              Neutral
            </span>
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              Success
            </span>
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
              Warning
            </span>
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
              Error
            </span>
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              Gradient
            </span>
          </div>
        </div>

        {/* Input */}
        <div className="bg-surface-0 rounded-xl shadow-sm p-6 flex flex-col gap-3">
          <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-1">
            Input Fields
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Default
            </label>
            <input
              placeholder="Warm placeholder text…"
              className="w-full border border-primary-200 rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary bg-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-secondary-600 uppercase tracking-wide">
              Error state
            </label>
            <input
              defaultValue="invalid@"
              className="w-full border-2 border-error rounded-md px-3 py-2.5 text-sm text-text-primary bg-red-50 focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent transition"
            />
            <p className="text-xs text-error font-medium">
              Please enter a valid email address.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Disabled
            </label>
            <input
              disabled
              defaultValue="Cannot edit this"
              className="w-full border border-surface-200 rounded-md px-3 py-2.5 text-sm text-text-tertiary bg-surface-100 cursor-not-allowed opacity-60"
            />
          </div>
        </div>

        {/* Color swatches */}
        <div className="bg-surface-0 rounded-xl shadow-sm p-6">
          <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-4">
            Color Palette
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold text-text-tertiary mb-2">
                Primary — Coral Orange
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { cls: 'bg-primary-50', label: '50' },
                  { cls: 'bg-primary-100', label: '100' },
                  { cls: 'bg-primary-200', label: '200' },
                  { cls: 'bg-primary-300', label: '300' },
                  { cls: 'bg-primary-400', label: '400' },
                  { cls: 'bg-primary-500', label: '500' },
                  { cls: 'bg-primary-600', label: '600' },
                  { cls: 'bg-primary-700', label: '700' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg ${s.cls} border border-black/5 shadow-sm`}
                    />
                    <span className="text-[10px] text-text-tertiary font-medium">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-text-tertiary mb-2">
                Secondary — Rose Red
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { cls: 'bg-secondary-50', label: '50' },
                  { cls: 'bg-secondary-100', label: '100' },
                  { cls: 'bg-secondary-200', label: '200' },
                  { cls: 'bg-secondary-300', label: '300' },
                  { cls: 'bg-secondary-400', label: '400' },
                  { cls: 'bg-secondary-500', label: '500' },
                  { cls: 'bg-secondary-600', label: '600' },
                  { cls: 'bg-secondary-700', label: '700' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg ${s.cls} border border-black/5 shadow-sm`}
                    />
                    <span className="text-[10px] text-text-tertiary font-medium">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-text-tertiary mb-2">
                Surface — Warm Cream
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { cls: 'bg-surface-0', label: '0' },
                  { cls: 'bg-surface-50', label: '50' },
                  { cls: 'bg-surface-100', label: '100' },
                  { cls: 'bg-surface-200', label: '200' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg ${s.cls} border border-black/10 shadow-sm`}
                    />
                    <span className="text-[10px] text-text-tertiary font-medium">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Navigation Bar ───────────────────────────────────────────────────────────

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 bg-surface-0/90 backdrop-blur-md border-b border-primary-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-text-primary leading-none">
            Variant 3: Sunset Warmth
          </span>
          <span className="text-xs text-text-tertiary mt-0.5">
            Outfit + Source Sans 3
          </span>
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {Array.from({ length: 26 }, (_, i) => i + 1).map((n) => (
            <a
              key={n}
              href={`/${n}`}
              className={`w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                n === 3
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-text-tertiary hover:bg-surface-100 hover:text-text-primary'
              }`}
            >
              /{n}
            </a>
          ))}
        </div>
      </div>
    </nav>
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

      {/* Hero strip */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 py-8 px-4 text-center text-white">
        <h1
          className="text-3xl font-black tracking-tight mb-1"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Sunset Warmth
        </h1>
        <p className="text-sm opacity-80 font-medium">
          Coral Orange · Rose Red · Warm Cream · Outfit · Source Sans 3
        </p>
      </div>

      {/* Sections */}
      <AuthSection />
      <div className="h-px bg-surface-200 mx-6" />
      <DashboardSection />
      <div className="h-px bg-surface-200 mx-6" />
      <GameQuestionSection />
      <div className="h-px bg-surface-200 mx-6" />
      <ResultsSection />
      <div className="h-px bg-surface-200 mx-6" />
      <ComponentShowcase />

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-text-tertiary border-t border-surface-200 mt-4">
        Amoria Design System · Variant 3 Sunset Warmth · Tailwind CSS v4
      </footer>
    </div>
  );
}
