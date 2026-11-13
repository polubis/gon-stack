export const LogoMark = ({ className = 'h-7 w-9' }: { className?: string }) => (
  <svg viewBox="0 0 40 32" className={className}>
    <path
      d="M15 4L4 16l11 12"
      fill="none"
      stroke="var(--color-logo-mark)"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 6a10 10 0 010 20"
      fill="none"
      stroke="var(--color-logo-accent)"
      strokeWidth={3}
      strokeLinecap="round"
    />
  </svg>
);
