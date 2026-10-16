// Authored line icons: 24px grid, 1.75 stroke, round joins

export type IconName =
  | 'undo'
  | 'menu'
  | 'close'
  | 'check'
  | 'eye'
  | 'pencil'
  | 'arrow-left'
  | 'arrow-right'
  | 'play'
  | 'discard'
  | 'clue'
  | 'deck'
  | 'notes'
  | 'plus'
  | 'burst';

const paths: Record<IconName, React.ReactNode> = {
  undo: (
    <>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  pencil: (
    <>
      <path d="M15.5 4.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      <path d="m13.5 6.5 3 3" />
    </>
  ),
  'arrow-left': (
    <>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  play: <path d="M7.5 5.5v13l11-6.5Z" />,
  discard: (
    <>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V4.5h5V7" />
      <path d="M6.5 7l1 12.5h9l1-12.5" />
      <path d="M10.5 11v5" />
      <path d="M13.5 11v5" />
    </>
  ),
  clue: (
    <>
      <path d="M4.5 5.5h15v10h-8l-4.5 3.5v-3.5h-2.5Z" />
      <path d="M8.5 10.5h7" />
    </>
  ),
  deck: (
    <>
      <rect x="7" y="3.5" width="11" height="15" rx="1.5" />
      <path d="M5 6.5v13a1 1 0 0 0 1 1h9" />
    </>
  ),
  notes: (
    <>
      <path d="M5 6.5h9" />
      <path d="M5 12h9" />
      <path d="M5 17.5h5" />
      <path d="m16 15 4 4" />
      <path d="m20 15-4 4" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  burst: (
    <>
      <path d="M12 2.5v4" />
      <path d="M12 17.5v4" />
      <path d="M2.5 12h4" />
      <path d="M17.5 12h4" />
      <path d="m5.3 5.3 2.8 2.8" />
      <path d="m15.9 15.9 2.8 2.8" />
      <path d="m5.3 18.7 2.8-2.8" />
      <path d="m15.9 8.1 2.8-2.8" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </>
  ),
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
