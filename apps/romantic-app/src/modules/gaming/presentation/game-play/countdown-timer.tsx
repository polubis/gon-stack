import type { ActiveQuestion } from '../../domain/models';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type CountdownTimerProps = {
  activeQuestion: ActiveQuestion;
  remainingSeconds: number;
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const CountdownTimer = ({
  activeQuestion,
  remainingSeconds,
}: CountdownTimerProps) => {
  const totalSeconds = activeQuestion.total > 0 ? remainingSeconds : 30;
  const maxSeconds = 30;
  const clampedRemaining = Math.max(0, Math.min(remainingSeconds, maxSeconds));
  const progress = clampedRemaining / maxSeconds;

  const size = 72;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const isUrgent = clampedRemaining <= 5;
  const isWarning = clampedRemaining <= 10 && clampedRemaining > 5;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e2236"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isUrgent ? '#ef4444' : isWarning ? '#f59e0b' : '#e91e8c'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
          style={{
            filter: isUrgent
              ? 'drop-shadow(0 0 6px #ef4444)'
              : isWarning
              ? 'drop-shadow(0 0 6px #f59e0b)'
              : 'drop-shadow(0 0 6px #e91e8c)',
          }}
        />
      </svg>

      {/* Center number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={[
            'text-lg font-bold leading-none',
            isUrgent ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white',
          ].join(' ')}
        >
          {clampedRemaining}
        </span>
        <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">sec</span>
      </div>
    </div>
  );
};
