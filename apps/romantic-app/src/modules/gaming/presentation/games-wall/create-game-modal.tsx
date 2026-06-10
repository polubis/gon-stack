import { useState } from 'react';
import type { CreateGamePayload } from '../../core/ports/repository';

type CreateGameModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onSubmit: (payload: CreateGamePayload) => void;
  onClose: () => void;
};

type FormState = {
  name: string;
  maxPlayers: number;
  timePerQuestion: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
};

const INITIAL_FORM: FormState = {
  name: '',
  maxPlayers: 10,
  timePerQuestion: 30,
  category: '',
  difficulty: 'Easy',
  description: '',
};

export const CreateGameModal = ({ isOpen, isLoading, onSubmit, onClose }: CreateGameModalProps) => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  if (!isOpen) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name.trim(),
      type: 'casual',
      maxPlayers: form.maxPlayers,
      timePerQuestion: form.timePerQuestion,
      category: form.category.trim(),
      difficulty: form.difficulty,
      description: form.description.trim() || undefined,
    });
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-surface-0)_80%,transparent)] backdrop-blur-sm" />

      {/* Modal panel */}
      <div className="relative w-full max-w-lg variant-card p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] border border-[color-mix(in_srgb,var(--color-primary-300)_40%,transparent)]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--color-primary-300)]"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold font-heading text-[var(--color-text-primary)]">
                Create a new game
              </h2>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                Set up a room for other players to join.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 variant-icon-button cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--color-text-tertiary)]"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Stepper labels */}
        <div className="flex items-center gap-0">
          {['Game setup', 'Question config', 'Review'].map((label, i) => (
            <div key={label} className="flex items-center gap-0 flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-sans border ${
                    i === 0
                      ? 'bg-[color-mix(in_srgb,var(--color-primary-500)_30%,transparent)] border-[var(--color-primary-400)] text-[var(--color-primary-200)]'
                      : 'bg-[color-mix(in_srgb,var(--color-surface-200)_60%,transparent)] border-[color-mix(in_srgb,var(--color-text-tertiary)_30%,transparent)] text-[var(--color-text-tertiary)]'
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-[11px] font-medium ${
                    i === 0 ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div className="flex-1 mx-2 h-px bg-[color-mix(in_srgb,var(--color-text-tertiary)_25%,transparent)]" />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Game mode (pre-filled casual) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
              Game mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className="variant-option-active px-3 py-2 text-xs font-semibold font-sans rounded-xl text-center cursor-default"
              >
                Casual
              </button>
              {['Competitive', 'Timed rush'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  disabled
                  className="variant-option px-3 py-2 text-xs font-semibold font-sans rounded-xl text-center opacity-40 cursor-not-allowed"
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Game name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cg-name"
              className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide"
            >
              Game name
            </label>
            <input
              id="cg-name"
              type="text"
              required
              maxLength={80}
              placeholder="e.g. Estimate Questions"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="variant-input px-3 py-2 text-sm rounded-xl w-full"
            />
          </div>

          {/* Category & Difficulty row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cg-category"
                className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide"
              >
                Category
              </label>
              <input
                id="cg-category"
                type="text"
                required
                maxLength={60}
                placeholder="e.g. Getting to Know You"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="variant-input px-3 py-2 text-sm rounded-xl w-full"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cg-difficulty"
                className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide"
              >
                Difficulty
              </label>
              <select
                id="cg-difficulty"
                value={form.difficulty}
                onChange={(e) =>
                  set('difficulty', e.target.value as FormState['difficulty'])
                }
                className="variant-input px-3 py-2 text-sm rounded-xl w-full appearance-none cursor-pointer"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Number of players slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                Number of players
              </label>
              <span className="text-xs font-bold text-[var(--color-secondary-300)]">
                {form.maxPlayers}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] -mt-1">
              Set how many players can join this game.
            </p>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={form.maxPlayers}
              onChange={(e) => set('maxPlayers', Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[color-mix(in_srgb,var(--color-secondary-500)_25%,transparent)] accent-[var(--color-primary-400)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)]">
              <span>1</span>
              <span>30</span>
            </div>
          </div>

          {/* Time per question & Difficulty row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cg-tpq"
                className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide"
              >
                Secs per question
              </label>
              <input
                id="cg-tpq"
                type="number"
                required
                min={5}
                max={300}
                placeholder="30"
                value={form.timePerQuestion}
                onChange={(e) => set('timePerQuestion', Number(e.target.value))}
                className="variant-input px-3 py-2 text-sm rounded-xl w-full"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                Next
              </label>
              <div className="flex items-end h-full pb-0.5">
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  Configure questions after creation.
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cg-desc"
              className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide"
            >
              About this game{' '}
              <span className="normal-case font-normal text-[var(--color-text-tertiary)]">
                (optional)
              </span>
            </label>
            <textarea
              id="cg-desc"
              rows={3}
              maxLength={400}
              placeholder="Share what this game is about and what players can expect..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="variant-input px-3 py-2 text-sm rounded-xl w-full resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="variant-button-ghost px-4 py-2 text-sm font-semibold font-sans cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="variant-button-primary px-5 py-2 text-sm font-semibold font-sans cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating…' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
