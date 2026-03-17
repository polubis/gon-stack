import { useState } from 'react';

// ─── Section A: Auth / Login ──────────────────────────────────────────────────
function AuthSection() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-sm bg-[#FEFDFB] rounded-2xl shadow-lg p-8 border border-[#E2E2DA]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] flex items-center justify-center text-3xl mb-3 shadow-sm border border-[#A7F3D0]">
            🌿
          </div>
          <h1
            className="text-3xl font-bold text-[#1A2E1A] tracking-wide"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Amoria
          </h1>
          <p
            className="text-sm text-[#6B7B6B] mt-1 italic"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Discover your love language together
          </p>
        </div>

        {/* Google OAuth */}
        <button className="w-full flex items-center justify-center gap-3 border-2 border-[#E2E2DA] rounded-2xl py-3 px-4 text-[#374737] font-medium hover:border-[#10B981] hover:bg-[#ECFDF5] transition-all duration-200 mb-4">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#E2E2DA]" />
          <span className="text-xs text-[#6B7B6B] font-medium">or</span>
          <div className="flex-1 h-px bg-[#E2E2DA]" />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-[#374737] mb-1.5 uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-[#E2E2DA] rounded-2xl px-4 py-3 text-sm text-[#1A2E1A] placeholder-[#6B7B6B] bg-[#FEFDFB] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-[#374737] mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-[#E2E2DA] rounded-2xl px-4 py-3 text-sm text-[#1A2E1A] placeholder-[#6B7B6B] bg-[#FEFDFB] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
          />
        </div>

        {/* Login button */}
        <button className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-2xl py-3 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]">
          Log in
        </button>

        <p className="text-center text-xs text-[#6B7B6B] mt-4">
          {"Don't have an account?"}{' '}
          <span className="text-[#10B981] font-semibold cursor-pointer hover:text-[#047857]">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

// ─── Section B: Dashboard ─────────────────────────────────────────────────────
function DashboardSection() {
  const [roomCode, setRoomCode] = useState('');

  const recentGames = [
    {
      title: 'Love Languages',
      score: '8/10',
      date: 'Yesterday',
      badge: 'Romance',
    },
    {
      title: 'Dream Destinations',
      score: '7/10',
      date: '2 days ago',
      badge: 'Adventure',
    },
    {
      title: 'Future Plans',
      score: '9/10',
      date: 'Last week',
      badge: 'Growth',
    },
  ];

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-[#FEFDFB] rounded-2xl px-5 py-4 shadow border border-[#E2E2DA]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D1FAE5] flex items-center justify-center text-lg font-bold text-[#047857]">
            S
          </div>
          <div>
            <p
              className="font-semibold text-[#1A2E1A] text-sm"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Sofia & Marco
            </p>
            <p className="text-xs text-[#6B7B6B]">Together since 2 years</p>
          </div>
        </div>
        <button className="w-9 h-9 rounded-xl bg-[#ECECE5] flex items-center justify-center text-[#374737] hover:bg-[#E2E2DA] transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      {/* Romantic vibe card */}
      <div className="bg-[#ECFDF5] rounded-2xl p-5 border border-[#A7F3D0]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-1">
              {"Today's Vibe"}
            </p>
            <h3
              className="text-xl font-bold text-[#1A2E1A]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Tender & Curious
            </h3>
            <p className="text-sm text-[#374737] mt-1">
              Your connection is growing deeper every day.
            </p>
          </div>
          <div className="text-3xl">🌱</div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-[#A7F3D0]">
            <div className="h-2 rounded-full bg-[#10B981] w-3/4" />
          </div>
          <span className="text-xs font-bold text-[#059669]">74%</span>
        </div>
        <p className="text-xs text-[#6B7B6B] mt-1">Connection score</p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-2xl py-3.5 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] text-sm">
          Create Room
        </button>
        <button className="flex-1 border-2 border-[#FBBF24] text-[#B45309] font-semibold rounded-2xl py-3.5 hover:bg-[#FFFBEB] transition-all duration-200 text-sm">
          Join Room
        </button>
      </div>

      {/* Room code input */}
      <div className="bg-[#FEFDFB] rounded-2xl p-4 border border-[#E2E2DA]">
        <p className="text-xs font-semibold text-[#374737] uppercase tracking-wider mb-2">
          Enter Room Code
        </p>
        <div className="flex gap-2">
          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="GARDEN-42"
            className="flex-1 border border-[#E2E2DA] rounded-xl px-3 py-2.5 text-sm text-[#1A2E1A] placeholder-[#6B7B6B] bg-[#F5F5F0] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
          />
          <button className="bg-[#10B981] text-white font-semibold rounded-xl px-4 py-2.5 text-sm hover:bg-[#059669] transition-colors">
            Join
          </button>
        </div>
      </div>

      {/* Recent games */}
      <div>
        <h3
          className="text-base font-bold text-[#1A2E1A] mb-3"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Recent Sessions
        </h3>
        <div className="space-y-2.5">
          {recentGames.map((game, i) => (
            <div
              key={i}
              className="bg-[#FEFDFB] rounded-2xl px-4 py-3.5 border border-[#E2E2DA] flex items-center justify-between hover:border-[#6EE7B7] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#D1FAE5] flex items-center justify-center text-sm font-bold text-[#047857]">
                  {game.score.split('/')[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#1A2E1A]">
                    {game.title}
                  </p>
                  <p className="text-xs text-[#6B7B6B]">{game.date}</p>
                </div>
              </div>
              <span className="text-xs font-semibold bg-[#FEF3C7] text-[#B45309] px-2.5 py-1 rounded-full">
                {game.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section C: Game Session / Question View ──────────────────────────────────
function GameSessionSection() {
  const [selected, setSelected] = useState<number | null>(2);

  const options = [
    'Quality time together, just the two of us',
    'Spontaneous adventures and new experiences',
    'Deep, heartfelt conversations until midnight',
    'Small daily rituals that show I care',
  ];

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-5">
      {/* Score bar */}
      <div className="bg-[#FEFDFB] rounded-2xl px-5 py-3.5 border border-[#E2E2DA] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#D1FAE5] flex items-center justify-center text-xs font-bold text-[#047857]">
            S
          </div>
          <span className="font-bold text-[#1A2E1A] text-sm">Sofia</span>
          <span className="font-bold text-[#10B981] text-sm ml-1">42</span>
        </div>
        <div className="text-xs font-semibold text-[#6B7B6B] bg-[#ECECE5] px-3 py-1 rounded-full">
          Q 3 / 10
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#F59E0B] text-sm">38</span>
          <span className="font-bold text-[#1A2E1A] text-sm">Marco</span>
          <div className="w-7 h-7 rounded-full bg-[#FEF3C7] flex items-center justify-center text-xs font-bold text-[#B45309]">
            M
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-2">
        <span className="bg-[#FEF3C7] text-[#B45309] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#FDE68A]">
          Love Languages
        </span>
        <span className="bg-[#ECECE5] text-[#374737] text-xs font-medium px-3 py-1.5 rounded-full">
          Thoughtful
        </span>
      </div>

      {/* Question card */}
      <div className="bg-[#FEFDFB] rounded-2xl p-6 shadow border border-[#E2E2DA]">
        <p className="text-xs font-semibold text-[#6B7B6B] uppercase tracking-wider mb-3">
          Question 3
        </p>
        <h3
          className="text-xl font-bold text-[#1A2E1A] leading-snug mb-6"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          What makes you feel most connected to your partner?
        </h3>

        <div className="space-y-3">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-full text-left rounded-2xl px-4 py-3.5 text-sm font-medium border-2 transition-all duration-200 ${
                selected === i
                  ? 'bg-[#10B981] border-[#10B981] text-white shadow-md'
                  : 'bg-[#F5F5F0] border-[#E2E2DA] text-[#374737] hover:border-[#6EE7B7] hover:bg-[#ECFDF5]'
              }`}
            >
              <span
                className={`inline-block w-6 h-6 rounded-full text-xs font-bold mr-3 text-center leading-6 ${
                  selected === i
                    ? 'bg-white/20 text-white'
                    : 'bg-[#E2E2DA] text-[#6B7B6B]'
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Timer */}
      <div>
        <div className="flex justify-between text-xs text-[#6B7B6B] mb-1.5">
          <span>Time remaining</span>
          <span className="font-bold text-[#1A2E1A]">18s</span>
        </div>
        <div className="h-2.5 bg-[#ECECE5] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#34D399] transition-all"
            style={{ width: '60%' }}
          />
        </div>
      </div>

      {/* Waiting banner */}
      <div className="bg-[#FEF3C7] rounded-2xl px-4 py-3 border border-[#FDE68A] flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#F59E0B] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-[#B45309]">
          Waiting for partner to answer...
        </span>
      </div>
    </div>
  );
}

// ─── Section D: Results Reveal ────────────────────────────────────────────────
function ResultsSection() {
  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-5">
      {/* Header */}
      <div className="text-center">
        <div className="text-4xl mb-2">✨</div>
        <h2
          className="text-2xl font-bold text-[#1A2E1A]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Answers Revealed
        </h2>
        <p className="text-sm text-[#6B7B6B] mt-1">
          You both answered question 3
        </p>
      </div>

      {/* Answer cards side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#FEFDFB] rounded-2xl p-4 border-2 border-[#10B981] shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#D1FAE5] flex items-center justify-center text-xs font-bold text-[#047857]">
              S
            </div>
            <span className="text-xs font-semibold text-[#1A2E1A]">Sofia</span>
          </div>
          <p className="text-xs text-[#374737] leading-relaxed">
            Deep, heartfelt conversations until midnight
          </p>
          <div className="mt-2.5 flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-[#10B981] flex items-center justify-center">
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-xs font-bold text-[#059669]">+8 pts</span>
          </div>
        </div>

        <div className="bg-[#FEFDFB] rounded-2xl p-4 border-2 border-[#10B981] shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#FEF3C7] flex items-center justify-center text-xs font-bold text-[#B45309]">
              M
            </div>
            <span className="text-xs font-semibold text-[#1A2E1A]">Marco</span>
          </div>
          <p className="text-xs text-[#374737] leading-relaxed">
            Deep, heartfelt conversations until midnight
          </p>
          <div className="mt-2.5 flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-[#10B981] flex items-center justify-center">
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-xs font-bold text-[#059669]">+8 pts</span>
          </div>
        </div>
      </div>

      {/* Match indicator */}
      <div className="bg-[#ECFDF5] rounded-2xl p-4 border border-[#6EE7B7] text-center">
        <p className="text-2xl mb-1">🌿</p>
        <p
          className="font-bold text-[#047857] text-lg"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Perfect Match!
        </p>
        <p className="text-sm text-[#374737] mt-0.5">
          You both chose the same answer — your bond deepens
        </p>
        <p className="text-2xl font-bold text-[#10B981] mt-2">+16 pts</p>
      </div>

      {/* Tip card */}
      <div className="bg-[#ECFDF5] rounded-2xl p-4 border border-[#A7F3D0]">
        <div className="flex items-start gap-3">
          <div className="text-xl mt-0.5">📖</div>
          <div>
            <p className="text-xs font-bold text-[#047857] uppercase tracking-wider mb-1">
              Garden Wisdom
            </p>
            <p className="text-sm text-[#374737] leading-relaxed">
              Couples who share deep conversations regularly report 40% stronger
              emotional intimacy. Keep nurturing this beautiful habit.
            </p>
          </div>
        </div>
      </div>

      {/* Next button */}
      <button
        className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-2xl py-4 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Next Question →
      </button>
    </div>
  );
}

// ─── Section E: Component Showcase ───────────────────────────────────────────
function ComponentShowcase() {
  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-8">
      {/* Typography */}
      <div className="bg-[#FEFDFB] rounded-2xl p-6 border border-[#E2E2DA] space-y-3">
        <p className="text-xs font-semibold text-[#6B7B6B] uppercase tracking-wider mb-4">
          Typography — Playfair Display
        </p>
        {[
          { tag: 'h1', size: 'text-4xl', label: 'H1 · Heading One' },
          { tag: 'h2', size: 'text-3xl', label: 'H2 · Heading Two' },
          { tag: 'h3', size: 'text-2xl', label: 'H3 · Heading Three' },
          { tag: 'h4', size: 'text-xl', label: 'H4 · Heading Four' },
          { tag: 'h5', size: 'text-lg', label: 'H5 · Heading Five' },
          { tag: 'h6', size: 'text-base', label: 'H6 · Heading Six' },
        ].map(({ tag, size, label }) => {
          const Tag = tag as keyof JSX.IntrinsicElements;
          return (
            <Tag
              key={tag}
              className={`${size} font-bold text-[#1A2E1A] leading-tight`}
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {label}
            </Tag>
          );
        })}
        <p
          className="text-sm text-[#374737] mt-2"
          style={{ fontFamily: "'Lato', system-ui, sans-serif" }}
        >
          Body text in Lato — clean, readable, earthy warmth
        </p>
        <p
          className="text-sm text-[#6B7B6B] italic mt-1"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Italic serif for romantic emphasis
        </p>
      </div>

      {/* Buttons */}
      <div className="bg-[#FEFDFB] rounded-2xl p-6 border border-[#E2E2DA]">
        <p className="text-xs font-semibold text-[#6B7B6B] uppercase tracking-wider mb-4">
          Buttons
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-2xl px-5 py-2.5 text-sm shadow hover:shadow-md transition-all active:scale-[0.98]">
            Primary
          </button>
          <button className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold rounded-2xl px-5 py-2.5 text-sm shadow hover:shadow-md transition-all active:scale-[0.98]">
            Secondary
          </button>
          <button className="border-2 border-[#10B981] text-[#059669] hover:bg-[#ECFDF5] font-semibold rounded-2xl px-5 py-2.5 text-sm transition-all">
            Outlined
          </button>
          <button className="border-2 border-[#FBBF24] text-[#B45309] hover:bg-[#FFFBEB] font-semibold rounded-2xl px-5 py-2.5 text-sm transition-all">
            Amber
          </button>
          <button
            disabled
            className="bg-[#ECECE5] text-[#6B7B6B] font-semibold rounded-2xl px-5 py-2.5 text-sm cursor-not-allowed"
          >
            Disabled
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-[#FEFDFB] rounded-2xl p-6 border border-[#E2E2DA]">
        <p className="text-xs font-semibold text-[#6B7B6B] uppercase tracking-wider mb-4">
          Badges
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="bg-[#ECFDF5] text-[#047857] text-xs font-semibold px-3 py-1 rounded-full border border-[#A7F3D0]">
            Forest
          </span>
          <span className="bg-[#FEF3C7] text-[#B45309] text-xs font-semibold px-3 py-1 rounded-full border border-[#FDE68A]">
            Amber
          </span>
          <span className="bg-[#D1FAE5] text-[#059669] text-xs font-semibold px-3 py-1 rounded-full">
            Emerald
          </span>
          <span className="bg-[#ECECE5] text-[#374737] text-xs font-semibold px-3 py-1 rounded-full">
            Earthy
          </span>
          <span className="bg-[#1A2E1A] text-white text-xs font-semibold px-3 py-1 rounded-full">
            Dark
          </span>
        </div>
      </div>

      {/* Input */}
      <div className="bg-[#FEFDFB] rounded-2xl p-6 border border-[#E2E2DA]">
        <p className="text-xs font-semibold text-[#6B7B6B] uppercase tracking-wider mb-4">
          Input Fields
        </p>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Default state..."
            className="w-full border border-[#E2E2DA] rounded-2xl px-4 py-3 text-sm text-[#1A2E1A] placeholder-[#6B7B6B] bg-[#F5F5F0] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
          />
          <input
            type="text"
            defaultValue="Filled value"
            className="w-full border border-[#10B981] rounded-2xl px-4 py-3 text-sm text-[#1A2E1A] bg-[#FEFDFB] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all ring-2 ring-[#10B981]"
          />
        </div>
      </div>

      {/* Color swatches */}
      <div className="bg-[#FEFDFB] rounded-2xl p-6 border border-[#E2E2DA]">
        <p className="text-xs font-semibold text-[#6B7B6B] uppercase tracking-wider mb-4">
          Color Palette
        </p>

        <div className="mb-4">
          <p className="text-xs text-[#6B7B6B] mb-2 font-medium">
            Primary — Emerald
          </p>
          <div className="flex gap-1.5">
            {[
              '#ECFDF5',
              '#D1FAE5',
              '#A7F3D0',
              '#6EE7B7',
              '#34D399',
              '#10B981',
              '#059669',
              '#047857',
            ].map((c, i) => (
              <div
                key={i}
                className="flex-1 aspect-square rounded-xl shadow-sm border border-black/5"
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-[#6B7B6B] mb-2 font-medium">
            Secondary — Amber
          </p>
          <div className="flex gap-1.5">
            {[
              '#FFFBEB',
              '#FEF3C7',
              '#FDE68A',
              '#FCD34D',
              '#FBBF24',
              '#F59E0B',
              '#D97706',
              '#B45309',
            ].map((c, i) => (
              <div
                key={i}
                className="flex-1 aspect-square rounded-xl shadow-sm border border-black/5"
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-[#6B7B6B] mb-2 font-medium">Surfaces</p>
          <div className="flex gap-1.5">
            {[
              '#FEFDFB',
              '#F5F5F0',
              '#ECECE5',
              '#E2E2DA',
              '#1A2E1A',
              '#374737',
              '#6B7B6B',
            ].map((c, i) => (
              <div
                key={i}
                className="flex-1 aspect-square rounded-xl shadow-sm border border-black/5"
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Showcase ────────────────────────────────────────────────────────────
const SECTIONS = [
  'Auth',
  'Dashboard',
  'Game',
  'Results',
  'Components',
] as const;
type Section = (typeof SECTIONS)[number];

export default function Showcase() {
  const [activeSection, setActiveSection] = useState<Section>('Auth');

  const sectionContent: Record<Section, React.ReactNode> = {
    Auth: <AuthSection />,
    Dashboard: <DashboardSection />,
    Game: <GameSessionSection />,
    Results: <ResultsSection />,
    Components: <ComponentShowcase />,
  };

  return (
    <div
      className="min-h-screen bg-[#F5F5F0]"
      style={{ fontFamily: "'Lato', system-ui, sans-serif" }}
    >
      {/* Variant navigation */}
      <div className="bg-[#FEFDFB] border-b border-[#E2E2DA] px-4 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex gap-1.5">
          {Array.from({ length: 26 }, (_, i) => i + 1).map((n) => (
            <a
              key={n}
              href={`/${n}`}
              className={`w-7 h-7 rounded-xl text-[10px] font-bold flex items-center justify-center transition-all ${
                n === 4
                  ? 'bg-[#10B981] text-white shadow'
                  : 'bg-[#ECECE5] text-[#374737] hover:bg-[#E2E2DA]'
              }`}
            >
              {n}
            </a>
          ))}
        </div>
        <div className="text-right">
          <p
            className="text-xs font-bold text-[#1A2E1A]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Variant 4: Forest Garden
          </p>
          <p className="text-[10px] text-[#6B7B6B]">Playfair Display + Lato</p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="bg-[#FEFDFB] border-b border-[#E2E2DA] px-4 py-2 flex gap-1 overflow-x-auto">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === s
                ? 'bg-[#10B981] text-white shadow'
                : 'text-[#6B7B6B] hover:text-[#374737] hover:bg-[#ECECE5]'
            }`}
          >
            {s === 'Auth'
              ? 'A: Auth'
              : s === 'Dashboard'
                ? 'B: Dashboard'
                : s === 'Game'
                  ? 'C: Game'
                  : s === 'Results'
                    ? 'D: Results'
                    : 'E: Components'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>{sectionContent[activeSection]}</div>
    </div>
  );
}
