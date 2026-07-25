const VIEWBOX_WIDTH = 2170;
const VIEWBOX_HEIGHT = 793.9;

type GreenOnLogoProps = {
  className?: string;
  height?: number;
};

export const GreenOnLogo = ({ className, height = 32 }: GreenOnLogoProps) => {
  const width = height * (VIEWBOX_WIDTH / VIEWBOX_HEIGHT);

  return (
    <img
      src="/images/green-on-logo.svg"
      className={className}
      width={width}
      height={height}
      alt=""
      aria-hidden
    />
  );
};
