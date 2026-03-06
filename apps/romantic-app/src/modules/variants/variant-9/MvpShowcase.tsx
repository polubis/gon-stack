import { type ReactNode } from 'react';
import {
  Brush,
  Chrome,
  Clock,
  Eraser,
  Heart,
  MessageCircle,
  Mic,
  Minus,
  Music2,
  Plus,
  Settings,
  ShieldCheck,
  Trophy,
  User,
} from 'lucide-react';

const TOTAL_VARIANTS = 26;

type MvpShowcaseProps = {
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
        <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">{label}</p>
        <h2 className="text-xl text-text-primary">{description}</h2>
        <div className="h-px bg-surface-200 mt-2" />
      </div>
      {children}
    </section>
  );
}

/** 1. Authentication – Google OAuth + Email/Password (MVP) */
function AuthView() {
  return (
    <div className="px-4 flex justify-center">
      <div className="variant-card w-full max-w-sm p-6 md:p-8 flex flex-col gap-5">
        <div className="text-center flex flex-col gap-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-xl">💞</div>
          <h3 className="text-3xl text-text-primary">Amoria</h3>
          <p className="text-sm text-text-secondary">Get closer, one question at a time.</p>
        </div>
        <button className="variant-button-ghost w-full py-2.5 px-4 text-sm font-semibold">
          <span className="flex items-center justify-center gap-2">
            <Chrome className="w-4 h-4" aria-hidden="true" />
            <span>Continue with Google</span>
          </span>
        </button>
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-surface-200" />
          <span className="text-xs uppercase tracking-[0.18em] text-text-tertiary">or</span>
          <span className="h-px flex-1 bg-surface-200" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-[0.14em] text-text-tertiary">Email</label>
            <input readOnly placeholder="you@example.com" className="variant-input w-full px-3 py-2.5 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-[0.14em] text-text-tertiary">Password</label>
            <input readOnly placeholder="••••••••" type="password" className="variant-input w-full px-3 py-2.5 text-sm" />
          </div>
        </div>
        <button className="variant-button-primary w-full py-2.5 px-4 text-sm font-semibold uppercase tracking-[0.14em]">
          Log in
        </button>
      </div>
    </div>
  );
}

/** 2. User Profile Creation – name, age, romantic vibe (MVP) */
function ProfileSetupView() {
  return (
    <div className="px-4 flex justify-center">
      <div className="variant-card w-full max-w-md p-6 flex flex-col gap-5">
        <h3 className="text-xl text-text-primary">Create your profile</h3>
        <p className="text-sm text-text-secondary">Name, age, and your romantic vibe for better matches.</p>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-[0.14em] text-text-tertiary">Name</label>
          <input readOnly placeholder="Your name" className="variant-input w-full px-3 py-2.5 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-[0.14em] text-text-tertiary">Age</label>
          <input readOnly placeholder="25" type="number" className="variant-input w-full px-3 py-2.5 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-[0.14em] text-text-tertiary">Romantic vibe</label>
          <p className="text-xs text-text-tertiary mb-1">How you tend to behave in relationships (direct, playful, etc.)</p>
          <div className="flex flex-wrap gap-2">
            <span className="variant-pill">Direct</span>
            <span className="variant-pill variant-pill-secondary">Expressive</span>
            <span className="variant-pill">Playful</span>
            <span className="variant-pill variant-pill-secondary">Spontaneous</span>
          </div>
        </div>
        <button className="variant-button-primary w-full py-2.5 px-4 text-sm font-semibold uppercase tracking-[0.14em]">
          Save profile
        </button>
      </div>
    </div>
  );
}

/** 3. Gaming Room – create room, join room, room code (MVP) */
function RoomView() {
  return (
    <div className="px-4 flex justify-center">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <div className="variant-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-200 text-primary-700 flex items-center justify-center font-bold">A</div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Amelia & James</p>
              <p className="text-xs text-text-tertiary">Ready for tonight&apos;s round</p>
            </div>
          </div>
          <button className="variant-icon-button" aria-label="Settings">
            <Settings className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="variant-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">Romantic vibe</p>
            <span className="variant-pill">active</span>
          </div>
          <p className="text-text-primary text-sm">
            Warm, playful and curious. Strong compatibility in communication and shared goals.
          </p>
          <div className="h-2 bg-surface-200 overflow-hidden rounded-full">
            <div className="h-full w-2/3 bg-primary-500 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="variant-button-primary py-3 text-sm font-semibold uppercase tracking-[0.14em]">Create room</button>
          <button className="variant-button-secondary py-3 text-sm font-semibold uppercase tracking-[0.14em]">Join room</button>
        </div>
        <div className="variant-card p-4 flex gap-2">
          <input readOnly maxLength={6} placeholder="ROOM42" className="variant-input flex-1 px-3 py-2.5 text-center text-sm tracking-[0.3em] font-mono uppercase" />
          <button className="variant-button-secondary px-4 text-sm font-semibold">Go</button>
        </div>
      </div>
    </div>
  );
}

/** 4. Category selection – 8 categories + Drawing, Music, Trash Talk (MVP) */
function CategorySelectView() {
  const categories = [
    'Relationship Dynamics',
    'Self-Discovery',
    'Sexual Intimacy',
    'Mutual Respect',
    'Communication & Conflicts',
    'Values & Life Goals',
    'Love Languages',
    'Trust & Fidelity',
    'Drawing',
    'Music & Entertainment',
    'Trash Talk',
  ];
  return (
    <div className="px-4 flex justify-center">
      <div className="w-full max-w-2xl flex flex-col gap-4">
        <p className="text-sm text-text-secondary">Select a category to start. First to 10 points wins.</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat, i) => (
            <span
              key={cat}
              className={i === 0 ? 'variant-pill variant-option-active px-3 py-1.5' : 'variant-pill px-3 py-1.5'}
            >
              {cat}
            </span>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <span className="variant-pill variant-pill-secondary">Easy</span>
          <span className="variant-pill variant-pill-secondary">Medium</span>
          <span className="variant-pill variant-pill-secondary">Hard</span>
        </div>
      </div>
    </div>
  );
}

/** 5. Multiple choice question + score bar + timer + Skip / Save / Pause (MVP) */
function QuestionMultipleChoiceView() {
  const options = ['Quality time', 'Words of affirmation', 'Physical touch', 'Acts of service'];
  return (
    <div className="px-4 flex justify-center">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <div className="variant-card p-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-primary-600">Amelia 7</span>
          <span className="text-xs uppercase tracking-[0.14em] text-text-tertiary">Q 4 / 10</span>
          <span className="text-sm font-semibold text-secondary-600">James 6</span>
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
            {options.map((opt, idx) => (
              <div
                key={opt}
                className={idx === 0 ? 'variant-option-active w-full text-left px-4 py-3 text-sm' : 'variant-option w-full text-left px-4 py-3 text-sm'}
              >
                <span className="mr-2 opacity-70">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-text-tertiary">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              <span>Time remaining</span>
            </span>
            <span className="font-semibold text-warning">18s</span>
          </div>
          <div className="h-2 bg-surface-200 overflow-hidden rounded-full">
            <div className="h-full w-1/2 bg-warning rounded-full" />
          </div>
          <div className="flex gap-2 pt-2">
            <button className="variant-button-ghost py-2 px-3 text-xs font-semibold">Skip</button>
            <button className="variant-button-ghost py-2 px-3 text-xs font-semibold">Save for later</button>
            <button className="variant-button-ghost py-2 px-3 text-xs font-semibold">Pause</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 6. Scale question (1–5) – static */
function QuestionScaleView() {
  return (
    <div className="px-4 flex justify-center">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <div className="variant-card p-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-primary-600">Amelia 5</span>
          <span className="text-xs uppercase tracking-[0.14em] text-text-tertiary">Q 2 / 10</span>
          <span className="text-sm font-semibold text-secondary-600">James 4</span>
        </div>
        <div className="variant-card p-5 flex flex-col gap-4">
          <span className="variant-pill">Relationship Dynamics</span>
          <span className="variant-pill variant-pill-secondary">Easy</span>
          <h3 className="text-xl text-text-primary leading-snug">
            How important is it for you that your partner remembers important dates? (1 = Not important, 5 = Very important)
          </h3>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={n === 4 ? 'variant-option-active flex-1 text-center py-3 text-sm font-semibold' : 'variant-option flex-1 text-center py-3 text-sm'}
              >
                {n}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-text-tertiary">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              <span>Time remaining</span>
            </span>
            <span className="font-semibold text-warning">45s</span>
          </div>
          <div className="h-2 bg-surface-200 overflow-hidden rounded-full">
            <div className="h-full w-3/4 bg-warning rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** 7. Yes/No question – static */
function QuestionYesNoView() {
  return (
    <div className="px-4 flex justify-center">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <div className="variant-card p-5 flex flex-col gap-4">
          <span className="variant-pill">Trust & Fidelity</span>
          <span className="variant-pill variant-pill-secondary">Easy</span>
          <h3 className="text-xl text-text-primary leading-snug">
            Can your partner have friends of the opposite sex?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="variant-option-active text-center py-4 text-sm font-semibold">Yes</div>
            <div className="variant-option text-center py-4 text-sm">No</div>
          </div>
          <div className="flex gap-2">
            <button className="variant-button-ghost py-2 px-3 text-xs font-semibold">Skip</button>
            <button className="variant-button-ghost py-2 px-3 text-xs font-semibold">Pause</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 8. Open text question with character limit – static */
function QuestionOpenTextView() {
  return (
    <div className="px-4 flex justify-center">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <div className="variant-card p-5 flex flex-col gap-4">
          <span className="variant-pill">Self-Discovery</span>
          <span className="variant-pill variant-pill-secondary">Hard</span>
          <h3 className="text-xl text-text-primary leading-snug">
            Describe a moment when you changed the most as a person. What was it?
          </h3>
          <textarea
            readOnly
            placeholder="Your answer (max 200 characters)..."
            rows={4}
            className="variant-input w-full px-3 py-2.5 text-sm resize-none"
          />
          <p className="text-xs text-text-tertiary text-right">0 / 200</p>
          <div className="flex gap-2">
            <button className="variant-button-ghost py-2 px-3 text-xs font-semibold">Skip</button>
            <button className="variant-button-primary py-2 px-4 text-xs font-semibold">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 9. Drawing question – canvas + tools (brush, colors, eraser) – static */
function QuestionDrawingView() {
  return (
    <div className="px-4 flex justify-center">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <div className="variant-card p-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-primary-600">Amelia 6</span>
          <span className="text-xs uppercase tracking-[0.14em] text-text-tertiary">Drawing</span>
          <span className="text-sm font-semibold text-secondary-600">James 5</span>
        </div>
        <div className="variant-card p-5 flex flex-col gap-4">
          <span className="variant-pill">Creative</span>
          <h3 className="text-xl text-text-primary leading-snug">
            What is his favorite sport? Draw it.
          </h3>
          <div className="aspect-video bg-surface-0 rounded-lg border border-surface-200 flex items-center justify-center text-text-tertiary text-sm">
            [Drawing canvas – brush, colors, eraser]
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="variant-icon-button" aria-label="Brush tool">
              <Brush className="w-4 h-4" aria-hidden="true" />
            </button>
            <button type="button" className="variant-icon-button" aria-label="Eraser tool">
              <Eraser className="w-4 h-4" aria-hidden="true" />
            </button>
            <div className="flex gap-1">
              <span className="w-6 h-6 rounded-full bg-primary-500 border-2 border-white" />
              <span className="w-6 h-6 rounded-full bg-secondary-400 border-2 border-surface-200" />
              <span className="w-6 h-6 rounded-full bg-warning border-2 border-surface-200" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-text-tertiary">
            <span>Time remaining</span>
            <span className="font-semibold text-warning">1:20</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 10. Music question – song name input + YouTube placeholder – static */
function QuestionMusicView() {
  return (
    <div className="px-4 flex justify-center">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <div className="variant-card p-5 flex flex-col gap-4">
          <span className="variant-pill">Music & Entertainment</span>
          <h3 className="text-xl text-text-primary leading-snug">
            Enter your favorite song. If both match, we&apos;ll play it on YouTube.
          </h3>
          <input
            readOnly
            placeholder="Song name..."
            className="variant-input w-full px-3 py-2.5 text-sm"
          />
          <div className="aspect-video bg-surface-0 rounded-lg border border-surface-200 flex items-center justify-center text-text-tertiary text-sm">
            [YouTube player – plays when both answers match]
          </div>
        </div>
      </div>
    </div>
  );
}

/** 11. Trash talk – 4 words, pick one (secret), guess with words starting with letter, 3 attempts – static */
function QuestionTrashTalkView() {
  const words = ['Moon', 'Mountain', 'Mystery', 'Memory'];
  return (
    <div className="px-4 flex justify-center">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <div className="variant-card p-5 flex flex-col gap-4">
          <span className="variant-pill">Trash Talk</span>
          <h3 className="text-xl text-text-primary leading-snug">
            Pick one word. Your partner guesses by saying words starting with <strong className="text-primary-400">M</strong>.
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {words.map((w, i) => (
              <div
                key={w}
                className={i === 1 ? 'variant-option-active text-center py-3 text-sm font-semibold' : 'variant-option text-center py-3 text-sm'}
              >
                {w}
              </div>
            ))}
          </div>
          <p className="text-xs text-text-tertiary">Guesser: say a word starting with M (3 attempts). Voice input enabled.</p>
          <div className="flex gap-2">
            <span className="variant-pill variant-pill-secondary">Attempt 1 / 3</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 12. Results reveal – match (+1) – static */
function ResultsMatchView() {
  return (
    <div className="px-4 flex justify-center">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Amelia', answer: 'Quality time', color: 'bg-primary-100 text-primary-700' },
            { name: 'James', answer: 'Quality time', color: 'bg-secondary-100 text-secondary-700' },
          ].map((item) => (
            <div key={item.name} className="variant-card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${item.color}`}>
                  {item.name[0]}
                </span>
                <span className="text-xs text-text-tertiary">{item.name}</span>
              </div>
              <p className="text-sm text-text-primary font-semibold">{item.answer}</p>
            </div>
          ))}
        </div>
        <div className="variant-card p-4 text-center">
          <p className="text-success text-sm font-semibold">Perfect match! +1 point each</p>
        </div>
        <div className="variant-card p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-info mb-1">Educational tip</p>
          <p className="text-sm text-text-secondary">
            Shared answers are strong signals of compatibility momentum and conversational safety.
          </p>
        </div>
        <button className="variant-button-primary py-3 text-sm font-semibold uppercase tracking-[0.14em]">Next question</button>
      </div>
    </div>
  );
}

/** 13. Results – mismatch (-1) – static */
function ResultsMismatchView() {
  return (
    <div className="px-4 flex justify-center">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Amelia', answer: 'Yes', color: 'bg-primary-100 text-primary-700' },
            { name: 'James', answer: 'No', color: 'bg-secondary-100 text-secondary-700' },
          ].map((item) => (
            <div key={item.name} className="variant-card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${item.color}`}>
                  {item.name[0]}
                </span>
                <span className="text-xs text-text-tertiary">{item.name}</span>
              </div>
              <p className="text-sm text-text-primary font-semibold">{item.answer}</p>
            </div>
          ))}
        </div>
        <div className="variant-card p-4 text-center">
          <p className="text-error text-sm font-semibold">Different answers. −1 point each.</p>
        </div>
        <button className="variant-button-primary py-3 text-sm font-semibold uppercase tracking-[0.14em]">Next question</button>
      </div>
    </div>
  );
}

/** 14. Win celebration – first to 10 points – static */
function WinCelebrationView() {
  return (
    <div className="px-4 flex justify-center">
      <div className="variant-card w-full max-w-md p-8 flex flex-col gap-6 text-center">
        <div className="flex justify-center">
          <Trophy className="w-12 h-12 text-yellow-400" aria-hidden="true" />
        </div>
        <h3 className="text-3xl text-text-primary">Amelia wins!</h3>
        <p className="text-text-secondary">First to 10 points. Great game, you two.</p>
        <div className="flex justify-center gap-4 text-lg">
          <span className="text-primary-400 font-bold">Amelia 10</span>
          <span className="text-text-tertiary">–</span>
          <span className="text-secondary-400 font-bold">James 7</span>
        </div>
        <div className="flex flex-col gap-2">
          <button className="variant-button-primary py-3 text-sm font-semibold uppercase tracking-[0.14em]">Play again</button>
          <button className="variant-button-secondary py-3 text-sm font-semibold uppercase tracking-[0.14em]">View summary</button>
        </div>
      </div>
    </div>
  );
}

/** 15. Component showcase – typography, buttons, inputs, pills, palette – static */
function ComponentShowcaseView() {
  const primarySwatches = [50, 100, 200, 300, 400, 500, 600, 700] as const;
  const secondarySwatches = [50, 100, 200, 300, 400, 500, 600, 700] as const;
  const sliderPreviewValue = 4;
  const sliderPreviewRatio = (sliderPreviewValue - 1) / 4;
  const sliderPreviewThumbSizePx = 16;
  const systemIcons: { name: string; icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }> }[] = [
    { name: 'Heart', icon: Heart },
    { name: 'User', icon: User },
    { name: 'Chat', icon: MessageCircle },
    { name: 'Music', icon: Music2 },
    { name: 'Mic', icon: Mic },
    { name: 'Timer', icon: Clock },
    { name: 'Brush', icon: Brush },
    { name: 'Eraser', icon: Eraser },
    { name: 'Shield', icon: ShieldCheck },
    { name: 'Trophy', icon: Trophy },
  ];
  return (
    <div className="px-4 flex justify-center">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-4">
        <div className="variant-card p-5 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">Typography</p>
          <h1 className="text-4xl text-text-primary">Heading 1</h1>
          <h2 className="text-3xl text-text-primary">Heading 2</h2>
          <h3 className="text-2xl text-text-primary">Heading 3</h3>
          <p className="text-base text-text-secondary">Body – question prompts, card copy.</p>
          <p className="text-sm text-text-secondary">Body-sm – descriptions, hints.</p>
          <p className="text-xs text-text-tertiary">Caption – metadata, timestamps.</p>
        </div>
        <div className="variant-card p-5 flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">Buttons + Input</p>
          <div className="flex flex-wrap gap-2">
            <button className="variant-button-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]">Primary</button>
            <button className="variant-button-secondary px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]">Secondary</button>
            <button className="variant-button-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]">Ghost</button>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3">
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
                Player handle
              </label>
              <span className="text-[10px] font-medium text-error">Invalid · read-only</span>
            </div>
            <div className="relative">
              <input
                readOnly
                aria-invalid="true"
                value="player_///invalid"
                className="variant-input w-full px-3 py-2.5 text-sm"
                style={{
                  borderColor: 'var(--color-error)',
                  boxShadow:
                    '0 0 0 1px color-mix(in srgb, var(--color-error) 40%, transparent), 0 0 14px color-mix(in srgb, var(--color-error) 55%, transparent)',
                }}
              />
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[11px] font-semibold uppercase tracking-[0.16em] text-error">
                Error
              </div>
            </div>
            <p className="mt-1 min-h-4 text-[11px] text-error">
              Handle is required and must be between 2 and 32 characters.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="variant-pill">Pill</span>
            <span className="variant-pill variant-pill-secondary">Pill secondary</span>
          </div>
          <div className="space-y-2 pt-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
              Slider (1-5)
            </label>
            <div className="relative pt-7">
              <span
                className="variant-pill absolute top-0 -translate-x-1/2"
                style={{
                  left: `calc((100% - ${sliderPreviewThumbSizePx}px) * ${sliderPreviewRatio} + ${sliderPreviewThumbSizePx / 2}px)`,
                }}
              >
                {sliderPreviewValue}
              </span>
              <input
                type="range"
                min={1}
                max={5}
                value={sliderPreviewValue}
                readOnly
                aria-label="Design system slider example"
                className="w-full accent-primary-400"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-text-tertiary">
              <span>Low agreement</span>
              <span>High agreement</span>
            </div>
          </div>
          <div className="space-y-2 pt-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
              Numeric stepper
            </label>
            <div className="flex items-center gap-3">
              <button type="button" className="variant-icon-button" aria-label="Decrease value">
                <Minus className="w-4 h-4" aria-hidden="true" />
              </button>
              <input
                readOnly
                value={7}
                aria-label="Stepper value"
                className="variant-input w-20 px-3 py-2 text-sm text-center font-semibold"
              />
              <button type="button" className="variant-icon-button" aria-label="Increase value">
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="text-xs text-text-tertiary">evenings per week</span>
            </div>
          </div>
        </div>
        <div className="variant-card p-5 flex flex-col gap-3 md:col-span-2">
          <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">Palette</p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {primarySwatches.map((n) => (
              <div key={n} className="rounded-md h-10 flex items-end p-1" style={{ backgroundColor: `var(--color-primary-${n})` }}>
                <span className="text-[10px] text-text-primary/80">{n}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {secondarySwatches.map((n) => (
              <div key={n} className="rounded-md h-10 flex items-end p-1" style={{ backgroundColor: `var(--color-secondary-${n})` }}>
                <span className="text-[10px] text-text-primary/80">{n}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary mb-2">Icons</p>
            {/* Filled chip style (design system icon buttons) */}
            <div className="grid grid-cols-5 gap-3 mb-4">
              {systemIcons.map(({ name, icon: Icon }) => (
                <div key={`chip-${name}`} className="flex flex-col items-center gap-1">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-surface-0 border border-surface-200">
                    <Icon className="w-4 h-4 text-text-primary" aria-hidden />
                  </span>
                  <span className="text-[10px] text-text-tertiary">{name}</span>
                </div>
              ))}
            </div>
            {/* Raw text-style icons */}
            <div className="grid grid-cols-5 gap-3">
              {systemIcons.map(({ name, icon: Icon }) => (
                <div key={`raw-${name}`} className="flex flex-col items-center gap-1 text-text-primary">
                  <Icon className="w-4 h-4" aria-hidden />
                  <span className="text-[10px] text-text-tertiary">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MvpShowcase({
  variantNumber,
  variantTitle,
  fontPair,
  styleLabel,
  totalVariants = TOTAL_VARIANTS,
}: MvpShowcaseProps) {
  const navItems = Array.from({ length: totalVariants }, (_, i) => i + 1);

  return (
    <div className="variant-shell min-h-screen text-text-primary" style={{ fontFamily: 'var(--font-sans)' }}>
      <nav className="sticky top-0 z-40 variant-nav">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-lg leading-tight">{variantTitle}</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-text-tertiary">{fontPair}</span>
          </div>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {navItems.map((n) => (
              <a
                key={n}
                href={`/${n}`}
                className={n === variantNumber ? 'variant-nav-active px-2.5 py-1.5 text-xs font-semibold transition-colors' : 'variant-nav-item px-2.5 py-1.5 text-xs font-semibold transition-colors'}
              >
                /{n}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <header className="variant-hero border-b border-surface-200">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-text-tertiary mb-2">Romantic app · MVP UI (static)</p>
          <h1 className="text-4xl text-text-primary mb-2">{variantTitle}</h1>
          <p className="text-sm text-text-secondary">{styleLabel}</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-8 flex flex-col gap-12">
        <Section label="1" description="Authentication · Google OAuth + Email/Password">
          <AuthView />
        </Section>
        <Section label="2" description="User Profile · Name, Age, Romantic Vibe">
          <ProfileSetupView />
        </Section>
        <Section label="3" description="Gaming Room · Create / Join · Room Code">
          <RoomView />
        </Section>
        <Section label="4" description="Category Selection · 8 categories + Drawing, Music, Trash Talk">
          <CategorySelectView />
        </Section>
        <Section label="5" description="Question · Multiple choice + Timer + Skip / Save / Pause">
          <QuestionMultipleChoiceView />
        </Section>
        <Section label="6" description="Question · Scale (1–5)">
          <QuestionScaleView />
        </Section>
        <Section label="7" description="Question · Yes/No">
          <QuestionYesNoView />
        </Section>
        <Section label="8" description="Question · Open text (character limit)">
          <QuestionOpenTextView />
        </Section>
        <Section label="9" description="Question · Drawing (canvas + tools)">
          <QuestionDrawingView />
        </Section>
        <Section label="10" description="Question · Music (song name + YouTube)">
          <QuestionMusicView />
        </Section>
        <Section label="11" description="Question · Trash Talk (4 words, letter hint, attempts)">
          <QuestionTrashTalkView />
        </Section>
        <Section label="12" description="Results · Match (+1 point)">
          <ResultsMatchView />
        </Section>
        <Section label="13" description="Results · Mismatch (−1 point)">
          <ResultsMismatchView />
        </Section>
        <Section label="14" description="Win Celebration · First to 10 points">
          <WinCelebrationView />
        </Section>
        <Section label="15" description="Component Showcase · Theme tokens">
          <ComponentShowcaseView />
        </Section>
      </main>
    </div>
  );
}
