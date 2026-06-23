type PlanetProps = {
  className?: string;
};

const Planet = ({ className }: PlanetProps) => (
  <div
    role="presentation"
    aria-hidden="true"
    className={`rounded-full ${className ?? ''}`.trim()}
    style={{
      background:
        'radial-gradient(circle at 30% 30%, rgba(127, 255, 191, 0.9) 0%, #41c57a 30%, #144c2c 70%, #0b2817 100%)',
      boxShadow:
        'inset 5px 5px 20px rgba(11, 40, 23, 0.3), inset -5px -5px 15px rgba(0, 0, 0, 0.2)',
    }}
  />
);

export { Planet };
