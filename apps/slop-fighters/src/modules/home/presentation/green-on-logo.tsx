type GreenOnLogoProps = {
  className?: string;
};

export const GreenOnLogo = ({ className }: GreenOnLogoProps) => (
  <span
    className={`logo-mask inline-block aspect-[2170/793.9] h-18 text-secondary${className ? ` ${className}` : ''}`}
    aria-hidden
  />
);
