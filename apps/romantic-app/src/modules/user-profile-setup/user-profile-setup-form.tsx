import {
  UserProfileSetupProvider,
  useUserProfileSetupContext,
  TOTAL_STEPS,
  type Answers,
} from './user-profile-setup-context';

function UserProfileSetupFormInner() {
  const {
    step,
    setStep,
    name,
    setName,
    age,
    setAge,
    answers,
    saved,
    setSaved,
    currentTraitStep,
    vibeTags,
    canContinue,
    progressLabel,
    handleContinue,
    handleBack,
    handleScaleChange,
    handleChoiceChange,
  } = useUserProfileSetupContext();

  return (
    <section id="user-profile-setup" className="w-full max-w-2xl variant-card p-6 md:p-8 flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="variant-pill">Profile setup</div>
          {step > 0 && (
            <p className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
              Step {Math.min(step, TOTAL_STEPS)} of {TOTAL_STEPS}{progressLabel ? ` - ${progressLabel}` : ''}
            </p>
          )}
        </div>
        {step > 0 && (
          <div className="h-2 rounded-full bg-surface-200 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-primary-400 to-secondary-400 transition-all duration-300"
              style={{ width: `${(Math.min(step, TOTAL_STEPS) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        )}
      </header>

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-text-primary">
            Let&apos;s set up your relationship profile
          </h1>
          <p className="text-text-secondary">
            Takes about 3-5 minutes. Your answers stay private in your room.
          </p>
          <div className="variant-option p-4 text-sm text-text-secondary leading-relaxed">
            We&apos;ll start with a few basics, then some quick questions about how you are in relationships. Ready?
          </div>
          <button
            type="button"
            className="variant-button-primary w-full md:w-auto md:self-end py-2.5 px-5 text-sm font-semibold uppercase tracking-[0.14em]"
            onClick={handleContinue}
          >
            Let&apos;s go
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-heading font-semibold text-text-primary">First, tell us who you are</h2>
          <p className="text-sm text-text-secondary">Your partner will see this during games.</p>
          <div className="variant-option p-4 text-sm text-text-secondary">What should we call you?</div>
          <div className="flex flex-col gap-1">
            <label htmlFor="profile-name" className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Alex"
              autoComplete="name"
              className="variant-input w-full px-3 py-2.5 text-sm"
            />
          </div>
          <div className="variant-option p-4 text-sm text-text-secondary">
            And how old are you{name.trim() ? `, ${name.trim()}` : ''}?
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="profile-age" className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
              Age
            </label>
            <input
              id="profile-age"
              type="number"
              min={18}
              max={120}
              value={age}
              onChange={(event) => setAge(event.target.value)}
              placeholder="29"
              className="variant-input w-full px-3 py-2.5 text-sm"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <button type="button" className="variant-button-ghost py-2.5 px-4 text-sm font-semibold" onClick={handleBack}>
              Back
            </button>
            <button
              type="button"
              className="variant-button-primary py-2.5 px-4 text-sm font-semibold uppercase tracking-[0.14em] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step >= 2 && step <= 9 && currentTraitStep && (
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-heading font-semibold text-text-primary">{currentTraitStep.title}</h2>

          {currentTraitStep.scaleQuestions?.map((question) => {
            const value = answers[question.id as keyof Answers] as number;
            const sliderRatio = (value - 1) / 4;
            const sliderThumbSizePx = 16;
            return (
              <div key={question.id} className="variant-option p-4 flex flex-col gap-3">
                <p className="text-sm text-text-secondary leading-relaxed">{question.prompt}</p>
                <div className="relative pt-7">
                  <span
                    className="variant-pill absolute top-0 -translate-x-1/2"
                    style={{ left: `calc((100% - ${sliderThumbSizePx}px) * ${sliderRatio} + ${sliderThumbSizePx / 2}px)` }}
                  >
                    {value}
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={value}
                    onChange={(event) => handleScaleChange(question.id as keyof Answers, Number(event.target.value))}
                    className="w-full accent-primary-400"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-text-tertiary">
                  <span>{question.minLabel}</span>
                  <span>{question.maxLabel}</span>
                </div>
              </div>
            );
          })}

          {currentTraitStep.numericQuestion && (
            <div className="variant-option p-4 flex flex-col gap-3">
              <p className="text-sm text-text-secondary leading-relaxed">{currentTraitStep.numericQuestion.prompt}</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="variant-icon-button"
                  onClick={() =>
                    handleScaleChange(
                      currentTraitStep.numericQuestion?.id as keyof Answers,
                      Math.max(
                        currentTraitStep.numericQuestion?.min ?? 0,
                        Number(answers[currentTraitStep.numericQuestion?.id as keyof Answers]) - 1,
                      ),
                    )
                  }
                  aria-label="Decrease evenings"
                >
                  -
                </button>
                <input
                  type="number"
                  min={currentTraitStep.numericQuestion.min}
                  max={currentTraitStep.numericQuestion.max}
                  value={answers[currentTraitStep.numericQuestion.id as keyof Answers] as number}
                  onChange={(event) =>
                    handleScaleChange(
                      currentTraitStep.numericQuestion?.id as keyof Answers,
                      Math.max(
                        currentTraitStep.numericQuestion?.min ?? 0,
                        Math.min(currentTraitStep.numericQuestion?.max ?? 7, Number(event.target.value)),
                      ),
                    )
                  }
                  className="variant-input w-20 px-3 py-2 text-sm text-center"
                />
                <button
                  type="button"
                  className="variant-icon-button"
                  onClick={() =>
                    handleScaleChange(
                      currentTraitStep.numericQuestion?.id as keyof Answers,
                      Math.min(
                        currentTraitStep.numericQuestion?.max ?? 7,
                        Number(answers[currentTraitStep.numericQuestion?.id as keyof Answers]) + 1,
                      ),
                    )
                  }
                  aria-label="Increase evenings"
                >
                  +
                </button>
                <span className="text-sm text-text-secondary">evenings per week</span>
              </div>
            </div>
          )}

          {currentTraitStep.choiceQuestions?.map((question) => {
            const selected = answers[question.id as keyof Answers] as string;
            return (
              <div key={question.id} className="variant-option p-4 flex flex-col gap-3">
                <p className="text-sm text-text-secondary leading-relaxed">{question.prompt}</p>
                <div className="flex flex-col gap-2">
                  {question.options.map((option) => {
                    const isSelected = selected === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`w-full text-left px-3 py-2 text-sm ${
                          isSelected ? 'variant-option-active' : 'variant-option'
                        }`}
                        onClick={() => handleChoiceChange(question.id as keyof Answers, option)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between gap-3">
            <button type="button" className="variant-button-ghost py-2.5 px-4 text-sm font-semibold" onClick={handleBack}>
              Back
            </button>
            <button
              type="button"
              className="variant-button-primary py-2.5 px-4 text-sm font-semibold uppercase tracking-[0.14em] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Next trait
            </button>
          </div>
        </div>
      )}

      {step === 10 && (
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-heading font-semibold text-text-primary">
            Here&apos;s your romantic vibe{name.trim() ? `, ${name.trim()}` : ''}
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            This is how we&apos;ll describe your relationship style in the game. You can change this later if you want.
          </p>

          <div className="variant-option p-4 flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.14em] text-text-tertiary">Basic profile</p>
            <p className="text-text-primary text-sm">Name: {name.trim() || 'Not set'}</p>
            <p className="text-text-primary text-sm">Age: {age || 'Not set'}</p>
          </div>

          <div className="variant-option p-4 flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.14em] text-text-tertiary">Romantic vibe tags</p>
            <div className="flex flex-wrap gap-2">
              {vibeTags.map((tag) => (
                <span key={tag} className="variant-pill variant-pill-secondary">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {saved && (
            <p className="text-sm text-success">Profile saved. You are ready to start playing.</p>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="variant-button-ghost py-2.5 px-4 text-sm font-semibold"
              onClick={() => setStep(1)}
            >
              Edit answers
            </button>
            <button
              type="button"
              className="variant-button-primary py-2.5 px-4 text-sm font-semibold uppercase tracking-[0.14em]"
              onClick={() => setSaved(true)}
            >
              Save profile &amp; start playing
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export function UserProfileSetupForm() {
  return (
    <UserProfileSetupProvider>
      <UserProfileSetupFormInner />
    </UserProfileSetupProvider>
  );
}
