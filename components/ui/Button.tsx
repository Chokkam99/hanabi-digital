import Icon, { IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: IconName;
  size?: 'md' | 'lg';
}

const variants: Record<Variant, string> = {
  // Gofun white: the one primary action on a screen
  primary: 'bg-ink text-mat hover:bg-white disabled:bg-lacquer-3 disabled:text-ink-3',
  secondary: 'bg-lacquer-2 text-ink border border-rule hover:bg-lacquer-3 disabled:text-ink-3 disabled:hover:bg-lacquer-2',
  ghost: 'text-ink-2 hover:bg-lacquer-2 hover:text-ink disabled:text-ink-3 disabled:hover:bg-transparent',
  danger: 'bg-transparent text-ink border border-ink-3 hover:bg-ink hover:text-mat',
};

export default function Button({
  variant = 'secondary',
  icon,
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-[background-color,color,transform] duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100 ${
        size === 'lg' ? 'min-h-13 px-5 text-base' : 'min-h-11 px-4 text-sm'
      } ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
}
