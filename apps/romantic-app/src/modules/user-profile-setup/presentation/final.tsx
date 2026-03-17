import { useState } from 'react';
import { useContext } from './context';

export const Final = () => {
  const ctx = useContext();
  const [isSaved, setIsSaved] = useState(false);
  const answers = ctx.$answers.use();

  const displayName = answers['user-profile.display-name'];
  const age = answers['user-profile.age'];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-heading font-semibold text-text-primary">
        Here&apos;s your romantic vibe
        {typeof displayName === 'string' && displayName.trim()
          ? `, ${displayName.trim()}`
          : ''}
      </h2>
      <p className="text-sm text-text-secondary leading-relaxed">
        This is how we&apos;ll describe your relationship style in the game. You
        can change this later if you want.
      </p>

      <div className="variant-option p-4 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
          Basic profile
        </p>
        <p className="text-text-primary text-sm">
          Name:{' '}
          {typeof displayName === 'string' && displayName.trim()
            ? displayName
            : 'Not set'}
        </p>
        <p className="text-text-primary text-sm">
          Age: {typeof age === 'number' ? age : 'Not set'}
        </p>
      </div>

      <div className="variant-option p-4 flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
          Romantic vibe tags
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="variant-pill variant-pill-secondary">
            Profile completed
          </span>
        </div>
      </div>

      {isSaved && (
        <p className="text-sm text-success">
          Profile saved. You are ready to start playing.
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="variant-button-ghost py-2.5 px-4 text-sm font-semibold"
          onClick={() => ctx.trigger('[TRIGGER]_EDIT_ANSWERS')}
        >
          Edit answers
        </button>
        <button
          type="button"
          className="variant-button-primary py-2.5 px-4 text-sm font-semibold uppercase tracking-[0.14em]"
          onClick={() => setIsSaved(true)}
        >
          Save profile &amp; start playing
        </button>
      </div>
    </div>
  );
};
