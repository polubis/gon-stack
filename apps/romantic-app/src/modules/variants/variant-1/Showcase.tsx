import { useState } from 'react';

// ---------------------------------------------------------------------------
// Nav bar — links to all 26 variants
// ---------------------------------------------------------------------------
const TOTAL_VARIANTS = 26;
function VariantNav() {
  return (
    <nav className="sticky top-0 z-50 bg-surface-0 border-b border-surface-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
          Variants 1–26
        </span>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {Array.from({ length: TOTAL_VARIANTS }, (_, i) => i + 1).map((n) => (
            <a
              key={n}
              href={`/${n}`}
              className={`
                px-2 py-1 rounded-full text-xs font-semibold transition-colors
                ${
                  n === 1
                    ? 'bg-primary-500 text-white'
                    : 'text-text-secondary hover:bg-primary-50 hover:text-primary-600'
                }
              `}
            >
              {n}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-12">
      <div className="mb-8 flex items-center gap-4">
        <span className="h-px flex-1 bg-surface-200" />
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary whitespace-nowrap">
          {label}
        </span>
        <span className="h-px flex-1 bg-surface-200" />
      </div>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// A — Auth / Login View
// ---------------------------------------------------------------------------
function AuthView() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-sm bg-surface-0 rounded-xl shadow-lg p-8 space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
            <span
              className="text-3xl leading-none"
              role="img"
              aria-label="heart"
            >
              &#10084;&#65039;
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Amoria
          </h1>
          <p className="text-sm text-text-tertiary text-center leading-snug">
            Discover your love language together
          </p>
        </div>

        {/* Google OAuth */}
        <button className="w-full flex items-center justify-center gap-3 border border-surface-200 rounded-md px-4 py-2.5 text-sm font-semibold text-text-secondary bg-surface-0 hover:bg-surface-50 transition-colors shadow-sm">
          {/* Simple G SVG */}
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615Z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332Z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58Z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-surface-200" />
          <span className="text-xs font-medium text-text-tertiary">or</span>
          <span className="h-px flex-1 bg-surface-200" />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-secondary">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-md border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            readOnly
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-secondary">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full rounded-md border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            readOnly
          />
        </div>

        {/* Log in button */}
        <button className="w-full rounded-md bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold py-2.5 transition-colors shadow-sm active:scale-95">
          Log in
        </button>

        {/* Sign up link */}
        <p className="text-center text-xs text-text-tertiary">
          {"Don't have an account?"}{' '}
          <a
            href="#"
            className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// B — Dashboard View
// ---------------------------------------------------------------------------
function DashboardView() {
  const recentGames = [
    { date: 'Feb 28', partner: 'Kim', score: '7 – 5', result: 'win' },
    { date: 'Feb 25', partner: 'Kim', score: '4 – 6', result: 'loss' },
    { date: 'Feb 20', partner: 'Kim', score: '8 – 8', result: 'draw' },
  ];

  return (
    <div className="max-w-sm mx-auto space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-surface-0 rounded-xl shadow-md px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center">
            <span className="text-sm font-bold text-primary-700">AK</span>
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary leading-tight">
              Alex &amp; Kim
            </p>
            <p className="text-xs text-text-tertiary">Together 2y 4m</p>
          </div>
        </div>
        {/* Gear icon */}
        <button
          className="text-text-tertiary hover:text-text-secondary transition-colors"
          aria-label="Settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </button>
      </div>

      {/* Romantic vibe summary */}
      <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
        <div className="flex items-start gap-3">
          <span className="text-2xl" role="img" aria-label="sparkles">
            &#10024;
          </span>
          <div>
            <h3 className="text-sm font-bold text-primary-700 mb-1">
              Your Romantic Vibe
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              You and Kim align beautifully on{' '}
              <strong>words of affirmation</strong> and{' '}
              <strong>quality time</strong>. Keep exploring new ways to connect
              — your compatibility score is{' '}
              <span className="text-primary-600 font-bold">87%</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Create room */}
      <button className="w-full rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-base font-bold py-3.5 transition-colors shadow-md active:scale-95">
        &#43; Create Room
      </button>

      {/* Join room */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-tertiary text-center">
          or enter a room code
        </p>
        <input
          type="text"
          placeholder="A1B2C3"
          maxLength={6}
          className="w-full text-center font-mono tracking-widest text-lg rounded-xl border-2 border-primary-200 bg-surface-0 py-3 px-4 text-text-primary placeholder:text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase transition"
          readOnly
        />
        <button className="w-full rounded-xl border-2 border-primary-500 text-primary-500 hover:bg-primary-50 text-sm font-bold py-2.5 transition-colors">
          Join Room
        </button>
      </div>

      {/* Recent games */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-tertiary mb-3">
          Recent Games
        </h3>
        <div className="space-y-2">
          {recentGames.map((g) => (
            <div
              key={g.date}
              className="flex items-center justify-between bg-surface-0 rounded-xl px-4 py-3 shadow-sm border border-surface-100"
            >
              <div>
                <p className="text-xs text-text-tertiary">{g.date}</p>
                <p className="text-sm font-semibold text-text-primary">
                  vs {g.partner}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold font-mono text-text-primary">
                  {g.score}
                </p>
                <p
                  className={`text-xs font-semibold ${
                    g.result === 'win'
                      ? 'text-success'
                      : g.result === 'loss'
                        ? 'text-error'
                        : 'text-warning'
                  }`}
                >
                  {g.result === 'win'
                    ? 'Win'
                    : g.result === 'loss'
                      ? 'Loss'
                      : 'Draw'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// C — Game Session / Question View
// ---------------------------------------------------------------------------
function GameQuestionView() {
  const [selected, setSelected] = useState<number | null>(2);

  const options = [
    'Open communication',
    'Physical affection',
    'Trust',
    'Shared values',
  ];

  return (
    <div className="max-w-sm mx-auto space-y-5">
      {/* Score bar */}
      <div className="grid grid-cols-2 rounded-xl overflow-hidden shadow-md text-center text-sm font-bold">
        <div className="bg-primary-100 text-primary-700 py-3">Alex: 7</div>
        <div className="bg-secondary-100 text-secondary-700 py-3">Kim: 5</div>
      </div>

      {/* Question card */}
      <div className="bg-surface-0 rounded-xl shadow-md p-6 space-y-4">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-secondary-100 text-secondary-700 text-xs font-semibold rounded-full px-3 py-1">
            Communication
          </span>
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold rounded-full px-3 py-1">
            Medium
          </span>
          <span className="ml-auto text-xs text-text-tertiary font-mono">
            Q 3 / 10
          </span>
        </div>

        {/* Question */}
        <h2 className="text-base font-bold text-text-primary leading-snug">
          {"What's the most important thing in a relationship?"}
        </h2>

        {/* Options */}
        <div className="space-y-2.5">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`
                w-full text-left rounded-md px-4 py-3 text-sm font-semibold transition-all border-2
                ${
                  selected === i
                    ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                    : 'bg-surface-50 text-text-secondary border-surface-200 hover:border-primary-300 hover:bg-primary-50'
                }
              `}
            >
              <span
                className={`inline-block w-5 h-5 rounded-full text-xs text-center leading-5 mr-2 font-bold ${
                  selected === i
                    ? 'bg-white text-primary-600'
                    : 'bg-surface-200 text-text-tertiary'
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>

        {/* Waiting hint */}
        {selected !== null && (
          <div className="flex items-center justify-center gap-2 text-xs text-text-tertiary bg-surface-50 rounded-md py-2.5">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            Waiting for partner...
          </div>
        )}
      </div>

      {/* Timer bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-text-tertiary">
          <span>Time remaining</span>
          <span className="font-mono font-semibold text-primary-600">0:18</span>
        </div>
        <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all"
            style={{ width: '45%' }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// D — Results Reveal
// ---------------------------------------------------------------------------
function ResultsRevealView() {
  const [learnMore, setLearnMore] = useState(false);

  return (
    <div className="max-w-sm mx-auto space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-text-primary">
          Answers Revealed!
        </h2>
        <p className="text-sm text-text-tertiary">You both answered the same</p>
      </div>

      {/* Answer cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Player 1 */}
        <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 text-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center mx-auto">
            <span className="text-xs font-bold text-primary-700">A</span>
          </div>
          <p className="text-xs text-text-tertiary font-medium">Alex</p>
          <p className="text-sm font-bold text-text-primary">Trust</p>
        </div>

        {/* Player 2 */}
        <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 text-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-secondary-200 flex items-center justify-center mx-auto">
            <span className="text-xs font-bold text-secondary-700">K</span>
          </div>
          <p className="text-xs text-text-tertiary font-medium">Kim</p>
          <p className="text-sm font-bold text-text-primary">Trust</p>
        </div>
      </div>

      {/* Match indicator */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-base font-bold text-success">+1 point!</p>
        <p className="text-xs text-text-tertiary">Perfect match</p>
      </div>

      {/* Educational tip card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-lg" role="img" aria-label="lightbulb">
            &#128161;
          </span>
          <div className="flex-1">
            <p className="text-xs font-bold text-blue-700 mb-1">
              Did you know?
            </p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Trust is consistently ranked as the #1 foundation in healthy
              long-term relationships across every culture studied.
            </p>
            {learnMore && (
              <p className="text-xs text-blue-600 leading-relaxed mt-2">
                Research from the Gottman Institute shows that couples who score
                high on trust and commitment are 89% more likely to report
                relationship satisfaction over 10 years.
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setLearnMore(!learnMore)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          {learnMore ? 'Show less ↑' : 'Learn more ↓'}
        </button>
      </div>

      {/* Next question */}
      <button className="w-full rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold py-3 transition-colors shadow-md active:scale-95">
        Next Question &#8594;
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// E — Component Showcase
// ---------------------------------------------------------------------------
function ComponentShowcase() {
  return (
    <div className="max-w-2xl mx-auto space-y-10">
      {/* Typography */}
      <div className="bg-surface-0 rounded-xl shadow-md p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-tertiary">
          Typography
        </h3>
        <h1 className="text-4xl font-extrabold text-text-primary">Heading 1</h1>
        <h2 className="text-3xl font-bold text-text-primary">Heading 2</h2>
        <h3 className="text-2xl font-bold text-text-primary">Heading 3</h3>
        <h4 className="text-xl font-semibold text-text-primary">Heading 4</h4>
        <h5 className="text-lg font-semibold text-text-primary">Heading 5</h5>
        <h6 className="text-base font-semibold text-text-primary">Heading 6</h6>
        <p className="text-base text-text-secondary">
          Body text — DM Sans at 1rem. Use for main content, descriptions, and
          supportive copy that guides the user through the experience.
        </p>
        <p className="text-sm text-text-tertiary">
          Caption — DM Sans at 0.875rem. Metadata, timestamps, and helper
          labels.
        </p>
      </div>

      {/* Buttons */}
      <div className="bg-surface-0 rounded-xl shadow-md p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-tertiary">
          Buttons
        </h3>
        <div className="flex flex-wrap gap-3 items-center">
          <button className="px-5 py-2.5 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-colors shadow-sm">
            Primary
          </button>
          <button className="px-5 py-2.5 rounded-md bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-semibold transition-colors shadow-sm">
            Secondary
          </button>
          <button className="px-5 py-2.5 rounded-md border-2 border-primary-500 text-primary-500 hover:bg-primary-50 text-sm font-semibold transition-colors">
            Outlined
          </button>
          <button
            disabled
            className="px-5 py-2.5 rounded-md bg-surface-200 text-text-tertiary text-sm font-semibold cursor-not-allowed"
          >
            Disabled
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-surface-0 rounded-xl shadow-md p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-tertiary">
          Badges
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="bg-primary-100 text-primary-700 text-xs font-semibold rounded-full px-3 py-1">
            Love Language
          </span>
          <span className="bg-secondary-100 text-secondary-700 text-xs font-semibold rounded-full px-3 py-1">
            Communication
          </span>
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold rounded-full px-3 py-1">
            Medium
          </span>
          <span className="bg-green-100 text-green-700 text-xs font-semibold rounded-full px-3 py-1">
            Easy
          </span>
          <span className="bg-red-100 text-red-700 text-xs font-semibold rounded-full px-3 py-1">
            Hard
          </span>
          <span className="bg-surface-200 text-text-tertiary text-xs font-semibold rounded-full px-3 py-1">
            Neutral
          </span>
        </div>
      </div>

      {/* Input */}
      <div className="bg-surface-0 rounded-xl shadow-md p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-tertiary">
          Input Fields
        </h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">
              Default state
            </label>
            <input
              type="text"
              placeholder="Placeholder text"
              className="w-full rounded-md border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              readOnly
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">
              Focus state (ring-2 ring-primary-500)
            </label>
            <input
              type="text"
              defaultValue="Active input"
              className="w-full rounded-md border border-transparent bg-surface-50 px-3 py-2.5 text-sm text-text-primary ring-2 ring-primary-500 focus:outline-none transition"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Color palette */}
      <div className="bg-surface-0 rounded-xl shadow-md p-6 space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-tertiary">
          Color Palette
        </h3>

        {/* Primary */}
        <div>
          <p className="text-xs font-semibold text-text-tertiary mb-2">
            Primary — Pink
          </p>
          <div className="flex gap-1">
            {[
              ['bg-primary-50', '50'],
              ['bg-primary-100', '100'],
              ['bg-primary-200', '200'],
              ['bg-primary-300', '300'],
              ['bg-primary-400', '400'],
              ['bg-primary-500', '500'],
              ['bg-primary-600', '600'],
              ['bg-primary-700', '700'],
            ].map(([cls, label]) => (
              <div key={label} className="flex-1 space-y-1">
                <div className={`${cls} h-10 rounded`} />
                <p className="text-center text-[10px] text-text-tertiary font-mono">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary */}
        <div>
          <p className="text-xs font-semibold text-text-tertiary mb-2">
            Secondary — Violet
          </p>
          <div className="flex gap-1">
            {[
              ['bg-secondary-50', '50'],
              ['bg-secondary-100', '100'],
              ['bg-secondary-200', '200'],
              ['bg-secondary-300', '300'],
              ['bg-secondary-400', '400'],
              ['bg-secondary-500', '500'],
              ['bg-secondary-600', '600'],
              ['bg-secondary-700', '700'],
            ].map(([cls, label]) => (
              <div key={label} className="flex-1 space-y-1">
                <div className={`${cls} h-10 rounded`} />
                <p className="text-center text-[10px] text-text-tertiary font-mono">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Semantic */}
        <div>
          <p className="text-xs font-semibold text-text-tertiary mb-2">
            Semantic
          </p>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <div className="h-10 rounded bg-success" />
              <p className="text-center text-[10px] text-text-tertiary font-mono">
                Success
              </p>
            </div>
            <div className="flex-1 space-y-1">
              <div className="h-10 rounded bg-warning" />
              <p className="text-center text-[10px] text-text-tertiary font-mono">
                Warning
              </p>
            </div>
            <div className="flex-1 space-y-1">
              <div className="h-10 rounded bg-error" />
              <p className="text-center text-[10px] text-text-tertiary font-mono">
                Error
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Showcase export
// ---------------------------------------------------------------------------
export default function Showcase() {
  return (
    <div className="min-h-screen bg-surface-50 font-sans">
      <VariantNav />

      {/* Page header */}
      <div className="bg-gradient-to-br from-primary-50 via-surface-0 to-secondary-50 border-b border-surface-200 py-10">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-500">
            Design System
          </p>
          <h1 className="text-4xl font-extrabold text-text-primary">
            Variant 1: Soft Rose
          </h1>
          <p className="text-sm text-text-tertiary">
            <span className="font-semibold text-text-secondary">Nunito</span>{' '}
            headings &nbsp;·&nbsp;
            <span className="font-semibold text-text-secondary">
              DM Sans
            </span>{' '}
            body &nbsp;·&nbsp; Pink primary &amp; Violet secondary
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 divide-y divide-surface-200">
        <Section label="View A — Auth · Login">
          <AuthView />
        </Section>

        <Section label="View B — Dashboard">
          <DashboardView />
        </Section>

        <Section label="View C — Game Session · Question">
          <GameQuestionView />
        </Section>

        <Section label="View D — Results Reveal">
          <ResultsRevealView />
        </Section>

        <Section label="View E — Component Showcase">
          <ComponentShowcase />
        </Section>
      </main>

      <footer className="text-center py-10 text-xs text-text-tertiary">
        Amoria Design System &mdash; Variant 1 Soft Rose
      </footer>
    </div>
  );
}
