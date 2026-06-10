import { useState } from 'react';
import type { ActiveQuestion, Answer, Question } from '../../domain/models';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type QuestionDisplayProps = {
  activeQuestion: ActiveQuestion;
  onSubmit: (questionId: string, answer: Answer) => void;
};

/* =============================================================================
 * Multiple Choice
 * ============================================================================= */

type MultipleChoiceProps = {
  question: Extract<Question, { type: 'multiple_choice' }>;
  hasAnswered: boolean;
  onSubmit: (questionId: string, answer: Answer) => void;
};

const MultipleChoiceInput = ({ question, hasAnswered, onSubmit }: MultipleChoiceProps) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (option: string) => {
    if (hasAnswered) return;
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    );
  };

  const handleSubmit = () => {
    if (selected.length === 0 || hasAnswered) return;
    onSubmit(question.id as string, { type: 'multiple_choice', selected });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((option, i) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={i}
              type="button"
              disabled={hasAnswered}
              onClick={() => toggle(option)}
              className={[
                'flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left text-sm font-medium transition-all duration-150',
                'disabled:cursor-not-allowed',
                isSelected && !hasAnswered
                  ? 'border-pink-500 bg-pink-600/20 text-pink-300 shadow-md shadow-pink-600/20'
                  : hasAnswered
                  ? 'border-white/5 bg-white/5 text-slate-500'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:border-pink-500/50 hover:bg-pink-600/10 hover:text-white',
              ].join(' ')}
            >
              <span
                className={[
                  'w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-150',
                  isSelected && !hasAnswered
                    ? 'border-pink-500 bg-pink-600 text-white'
                    : 'border-white/20 text-slate-400',
                ].join(' ')}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{option}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={hasAnswered || selected.length === 0}
        onClick={handleSubmit}
        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-pink-600/25 transition-all duration-150 hover:saturate-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {hasAnswered ? 'Answer submitted' : 'Submit answer'}
      </button>
    </div>
  );
};

/* =============================================================================
 * Text Input
 * ============================================================================= */

type TextInputProps = {
  question: Extract<Question, { type: 'text_input' }>;
  hasAnswered: boolean;
  onSubmit: (questionId: string, answer: Answer) => void;
};

const TextInputQuestion = ({ question, hasAnswered, onSubmit }: TextInputProps) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim() || hasAnswered) return;
    onSubmit(question.id as string, { type: 'text_input', text: text.trim() });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={text}
          disabled={hasAnswered}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Type your answer here…"
          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
        />
      </div>
      <button
        type="button"
        disabled={hasAnswered || !text.trim()}
        onClick={handleSubmit}
        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-pink-600/25 transition-all duration-150 hover:saturate-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {hasAnswered ? 'Answer submitted' : 'Submit answer'}
      </button>
    </div>
  );
};

/* =============================================================================
 * Scale
 * ============================================================================= */

type ScaleProps = {
  question: Extract<Question, { type: 'scale' }>;
  hasAnswered: boolean;
  onSubmit: (questionId: string, answer: Answer) => void;
};

const ScaleInput = ({ question, hasAnswered, onSubmit }: ScaleProps) => {
  const [value, setValue] = useState(Math.round((question.min + question.max) / 2));

  const handleSubmit = () => {
    if (hasAnswered) return;
    onSubmit(question.id as string, { type: 'scale', value });
  };

  const pct = ((value - question.min) / (question.max - question.min)) * 100;

  return (
    <div className="space-y-6">
      {/* Value display */}
      <div className="flex justify-center">
        <span className="text-4xl font-bold text-white tabular-nums">
          {value}
          <span className="text-sm text-slate-400 font-normal ml-2">
            / {question.max}
          </span>
        </span>
      </div>

      {/* Slider track */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="range"
            min={question.min}
            max={question.max}
            step={question.step}
            value={value}
            disabled={hasAnswered}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(to right, #e91e8c ${pct}%, #1e2236 ${pct}%)`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>{question.min}</span>
          <span>{question.max}</span>
        </div>
      </div>

      <button
        type="button"
        disabled={hasAnswered}
        onClick={handleSubmit}
        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-pink-600/25 transition-all duration-150 hover:saturate-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {hasAnswered ? 'Answer submitted' : 'Submit answer'}
      </button>
    </div>
  );
};

/* =============================================================================
 * Wild Challenge
 * ============================================================================= */

type WildChallengeProps = {
  question: Extract<Question, { type: 'wild_challenge' }>;
  hasAnswered: boolean;
  onSubmit: (questionId: string, answer: Answer) => void;
};

const WildChallengeInput = ({ question, hasAnswered, onSubmit }: WildChallengeProps) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim() || hasAnswered) return;
    onSubmit(question.id as string, { type: 'wild_challenge', text: text.trim() });
  };

  return (
    <div className="space-y-5">
      {/* Challenge card */}
      <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/30 border border-purple-500/20">
        <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center shrink-0">
          {/* Gamepad icon */}
          <svg className="w-5 h-5 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <rect x="2" y="6" width="20" height="12" rx="3" />
            <path d="M6 12h4M8 10v4" strokeLinecap="round" />
            <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none" />
            <circle cx="18" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
            <circle cx="14" cy="12" r="1" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-1">Wild Challenge</p>
          <p className="text-base font-medium text-white leading-relaxed">{question.content}</p>
        </div>
      </div>

      {/* Response input */}
      <div className="space-y-3">
        <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">
          Describe how you'd complete this challenge
        </label>
        <textarea
          value={text}
          disabled={hasAnswered}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell us how you would do it…"
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 resize-none"
        />
      </div>

      <button
        type="button"
        disabled={hasAnswered || !text.trim()}
        onClick={handleSubmit}
        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-pink-600/25 transition-all duration-150 hover:saturate-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {hasAnswered ? 'Answer submitted' : 'Submit answer'}
      </button>
    </div>
  );
};

/* =============================================================================
 * Main Export
 * ============================================================================= */

export const QuestionDisplay = ({ activeQuestion, onSubmit }: QuestionDisplayProps) => {
  const { question, hasAnswered } = activeQuestion;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Question content header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-full bg-pink-600/20 border border-pink-500/30 text-[10px] font-bold uppercase tracking-wider text-pink-400">
            {question.type.replace(/_/g, ' ')}
          </span>
          {hasAnswered && (
            <span className="px-2.5 py-1 rounded-full bg-green-600/20 border border-green-500/30 text-[10px] font-bold uppercase tracking-wider text-green-400">
              Answered
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-white leading-relaxed">
          {question.content}
        </h3>
      </div>

      {/* Input by type */}
      <div className="flex-1">
        {question.type === 'multiple_choice' && (
          <MultipleChoiceInput
            question={question}
            hasAnswered={hasAnswered}
            onSubmit={onSubmit}
          />
        )}
        {question.type === 'text_input' && (
          <TextInputQuestion
            question={question}
            hasAnswered={hasAnswered}
            onSubmit={onSubmit}
          />
        )}
        {question.type === 'scale' && (
          <ScaleInput
            question={question}
            hasAnswered={hasAnswered}
            onSubmit={onSubmit}
          />
        )}
        {question.type === 'wild_challenge' && (
          <WildChallengeInput
            question={question}
            hasAnswered={hasAnswered}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </div>
  );
};
