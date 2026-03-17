import { useState, type ReactNode } from 'react';

const TOTAL_VARIANTS = 26;

type ShowcaseTemplateProps = {
  variantNumber: number;
  variantTitle: string;
  fontPair: string;
  styleLabel: string;
  totalVariants?: number;
};

function Section({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="px-4 flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">
          {label}
        </p>
        <h2 className="text-xl text-text-primary">{description}</h2>
        <div className="h-px bg-surface-200 mt-2" />
      </div>
      {children}
    </section>
  );
}

function AuthView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="px-4 flex justify-center">
      <div className="variant-card w-full max-w-sm p-6 md:p-8 flex flex-col gap-5">
        <div className="text-center flex flex-col gap-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-xl">
            💞
          </div>
          <h3 className="text-3xl text-text-primary">Amoria</h3>
          <p className="text-sm text-text-secondary">
            Get closer, one question at a time.
          </p>
        </div>

        <button className="variant-button-ghost w-full py-2.5 px-4 text-sm font-semibold">
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-surface-200" />
          <span className="text-xs uppercase tracking-[0.18em] text-text-tertiary">
            or
          </span>
          <span className="h-px flex-1 bg-surface-200" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="variant-input w-full px-3 py-2.5 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              className="variant-input w-full px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <button className="variant-button-primary w-full py-2.5 px-4 text-sm font-semibold uppercase tracking-[0.14em]">
          Log in
        </button>
      </div>
    </div>
  );
}

function DashboardView() {
  const [roomCode, setRoomCode] = useState('');

  return (
    <div className="px-4 flex justify-center">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <div className="variant-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-200 text-primary-700 flex items-center justify-center font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Amelia & James
              </p>
              <p className="text-xs text-text-tertiary">
                {"Ready for tonight's round"}
              </p>
            </div>
          </div>
          <button className="variant-icon-button" aria-label="Settings">
            ⚙️
          </button>
        </div>

        <div className="variant-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">
              Romantic vibe
            </p>
            <span className="variant-pill">active</span>
          </div>
          <p className="text-text-primary text-sm">
            Warm, playful and curious. Strong compatibility in communication and
            shared goals.
          </p>
          <div className="h-2 bg-surface-200 overflow-hidden rounded-full">
            <div className="h-full w-2/3 bg-primary-500 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="variant-button-primary py-3 text-sm font-semibold uppercase tracking-[0.14em]">
            Create room
          </button>
          <button className="variant-button-secondary py-3 text-sm font-semibold uppercase tracking-[0.14em]">
            Join room
          </button>
        </div>

        <div className="variant-card p-4 flex gap-2">
          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="ROOM42"
            className="variant-input flex-1 px-3 py-2.5 text-center text-sm tracking-[0.3em] font-mono uppercase"
          />
          <button className="variant-button-secondary px-4 text-sm font-semibold">
            Go
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionView() {
  const [selected, setSelected] = useState<number | null>(null);
  const options = [
    'Quality time',
    'Words of affirmation',
    'Physical touch',
    'Acts of service',
  ];

  return (
    <div className="px-4 flex justify-center">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <div className="variant-card p-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-primary-600">
            Amelia 7
          </span>
          <span className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
            Q 4 / 10
          </span>
          <span className="text-sm font-semibold text-secondary-600">
            James 6
          </span>
        </div>

        <div className="variant-card p-5 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="variant-pill">Love Languages</span>
            <span className="variant-pill variant-pill-secondary">Medium</span>
          </div>
          <h3 className="text-2xl text-text-primary leading-snug">
            What makes you feel most emotionally safe in the relationship?
          </h3>
          <div className="flex flex-col gap-2">
            {options.map((opt, idx) => {
              const isActive = selected === idx;
              return (
                <button
                  key={opt}
                  onClick={() => setSelected(idx)}
                  className={[
                    'w-full text-left px-4 py-3 text-sm transition-colors',
                    isActive ? 'variant-option-active' : 'variant-option',
                  ].join(' ')}
                >
                  <span className="mr-2 opacity-70">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs text-text-tertiary">
            <span>Time remaining</span>
            <span className="font-semibold text-warning">18s</span>
          </div>
          <div className="h-2 bg-surface-200 overflow-hidden rounded-full">
            <div className="h-full w-1/2 bg-warning rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultsView() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="px-4 flex justify-center">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              name: 'Amelia',
              answer: 'Quality time',
              color: 'bg-primary-100 text-primary-700',
            },
            {
              name: 'James',
              answer: 'Quality time',
              color: 'bg-secondary-100 text-secondary-700',
            },
          ].map((item) => (
            <div
              key={item.name}
              className="variant-card p-4 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${item.color}`}
                >
                  {item.name[0]}
                </span>
                <span className="text-xs text-text-tertiary">{item.name}</span>
              </div>
              <p className="text-sm text-text-primary font-semibold">
                {item.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="variant-card p-4 text-center">
          <p className="text-success text-sm font-semibold">
            Perfect match! +1 point
          </p>
        </div>

        <div className="variant-card p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-info mb-1">
            Educational tip
          </p>
          <p className="text-sm text-text-secondary">
            Shared answers are strong signals of compatibility momentum and
            conversational safety.
          </p>
          {expanded ? (
            <p className="mt-2 text-sm text-text-tertiary">
              {
                'Try asking "why this matters to you right now?" after each match to deepen emotional context.'
              }
            </p>
          ) : null}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 text-xs font-semibold text-info"
          >
            {expanded ? 'Show less' : 'Learn more'}
          </button>
        </div>

        <button className="variant-button-primary py-3 text-sm font-semibold uppercase tracking-[0.14em]">
          Next question
        </button>
      </div>
    </div>
  );
}

function ComponentShowcase() {
  const [inputValue, setInputValue] = useState('');

  const primarySwatches = [
    { label: '50', className: 'bg-primary-50' },
    { label: '100', className: 'bg-primary-100' },
    { label: '200', className: 'bg-primary-200' },
    { label: '300', className: 'bg-primary-300' },
    { label: '400', className: 'bg-primary-400' },
    { label: '500', className: 'bg-primary-500' },
    { label: '600', className: 'bg-primary-600' },
    { label: '700', className: 'bg-primary-700' },
  ];
  const secondarySwatches = [
    { label: '50', className: 'bg-secondary-50' },
    { label: '100', className: 'bg-secondary-100' },
    { label: '200', className: 'bg-secondary-200' },
    { label: '300', className: 'bg-secondary-300' },
    { label: '400', className: 'bg-secondary-400' },
    { label: '500', className: 'bg-secondary-500' },
    { label: '600', className: 'bg-secondary-600' },
    { label: '700', className: 'bg-secondary-700' },
  ];

  return (
    <div className="px-4 flex justify-center">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-4">
        <div className="variant-card p-5 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
            Typography
          </p>
          <h1 className="text-4xl text-text-primary">Heading 1</h1>
          <h2 className="text-3xl text-text-primary">Heading 2</h2>
          <h3 className="text-2xl text-text-primary">Heading 3</h3>
          <h4 className="text-xl text-text-primary">Heading 4</h4>
          <h5 className="text-lg text-text-primary">Heading 5</h5>
          <h6 className="text-base text-text-primary">Heading 6</h6>
          <div className="h-px bg-surface-200 my-1" />
          <p className="text-base text-text-secondary">
            Body / p1: use for question prompts, card copy, and conversational
            guidance text.
          </p>
          <p className="text-sm text-text-secondary">
            Body-sm / p2: use for secondary descriptions, helper hints, and
            supporting UI text.
          </p>
          <p className="text-xs text-text-tertiary">
            Caption: metadata, timestamps, subtle status notes, and non-critical
            annotations.
          </p>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Label-lg (L1): active category
          </p>
          <p className="text-xs font-medium text-text-tertiary">
            Label-sm (L2): optional helper
          </p>
        </div>

        <div className="variant-card p-5 flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
            Buttons + Input
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="variant-button-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]">
              Primary
            </button>
            <button className="variant-button-secondary px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]">
              Secondary
            </button>
            <button className="variant-button-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]">
              Ghost
            </button>
          </div>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Input component"
            className="variant-input px-3 py-2.5 text-sm"
          />
        </div>

        <div className="variant-card p-5 flex flex-col gap-3 md:col-span-2">
          <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
            Primary palette
          </p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {primarySwatches.map((swatch) => (
              <div
                key={swatch.label}
                className={`rounded-md ${swatch.className} h-10 flex items-end p-1`}
              >
                <span className="text-[10px] text-text-primary/80">
                  {swatch.label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
            Secondary palette
          </p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {secondarySwatches.map((swatch) => (
              <div
                key={swatch.label}
                className={`rounded-md ${swatch.className} h-10 flex items-end p-1`}
              >
                <span className="text-[10px] text-text-primary/80">
                  {swatch.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShowcaseTemplate({
  variantNumber,
  variantTitle,
  fontPair,
  styleLabel,
  totalVariants = TOTAL_VARIANTS,
}: ShowcaseTemplateProps) {
  const navItems = Array.from({ length: totalVariants }, (_, i) => i + 1);

  return (
    <div
      className="variant-shell min-h-screen text-text-primary"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <nav className="sticky top-0 z-40 variant-nav">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-lg leading-tight">{variantTitle}</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
              {fontPair}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {navItems.map((n) => (
              <a
                key={n}
                href={`/${n}`}
                className={[
                  'px-2.5 py-1.5 text-xs font-semibold transition-colors',
                  n === variantNumber
                    ? 'variant-nav-active'
                    : 'variant-nav-item',
                ].join(' ')}
              >
                /{n}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <header className="variant-hero border-b border-surface-200">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-text-tertiary mb-2">
            Romantic app ui system
          </p>
          <h1 className="text-4xl text-text-primary mb-2">{variantTitle}</h1>
          <p className="text-sm text-text-secondary">{styleLabel}</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-8 flex flex-col gap-12">
        <Section label="View A" description="Authentication · Login">
          <AuthView />
        </Section>
        <Section label="View B" description="Dashboard · Rooms and Activity">
          <DashboardView />
        </Section>
        <Section label="View C" description="Game Session · Question">
          <QuestionView />
        </Section>
        <Section label="View D" description="Results Reveal">
          <ResultsView />
        </Section>
        <Section label="View E" description="Component Showcase">
          <ComponentShowcase />
        </Section>
      </main>
    </div>
  );
}
