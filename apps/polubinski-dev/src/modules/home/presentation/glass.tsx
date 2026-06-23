type GlassProps = {
  className?: string;
};

const Glass = ({ className }: GlassProps) => (
  <div
    className={`rounded-full ${className ?? ''}`.trim()}
    aria-hidden="true"
    role="presentation"
    style={{
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      boxShadow:
        'inset 0 0 8px 1px rgba(127, 255, 191, 0.25), inset 0 0 20px 4px rgba(65, 197, 122, 0.3), inset 0 0 35px 8px rgba(20, 76, 44, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2), 0 0 0 2px rgba(38, 127, 76, 0.15), 0 0 8px 2px rgba(65, 197, 122, 0.15)',
    }}
  />
);

export { Glass };
