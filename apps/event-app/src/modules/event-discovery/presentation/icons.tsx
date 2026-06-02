type IconProps = {
  size?: number;
  fill?: string;
};

export const IconSearch = ({ size = 16 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const IconPin = ({ size = 16 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

export const IconCal = ({ size = 16 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);

export const IconHeart = ({ size = 16, fill = 'none' }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={fill}
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M12 21s-8-5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-8 11-8 11l-1 0Z" />
  </svg>
);

export const IconShare = ({ size = 16 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="m8 11 8-4M8 13l8 4" />
  </svg>
);

export const IconUser = ({ size = 16 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <circle cx="12" cy="9" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);

export const IconArrow = ({ size = 16 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconBack = ({ size = 16 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const IconClose = ({ size = 16 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const IconClock = ({ size = 16 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconCheck = ({ size = 16 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="m5 12 5 5L20 7" />
  </svg>
);

export const IconSun = ({ size = 16 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const IconMoon = ({ size = 16 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
  </svg>
);

export const IconCaret = ({ size = 10 }: IconProps) => (
  <svg
    viewBox="0 0 12 12"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
  >
    <path d="m3 4.5 3 3 3-3" />
  </svg>
);
