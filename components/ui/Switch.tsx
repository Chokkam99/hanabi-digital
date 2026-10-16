import { useId } from 'react';

interface SwitchRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * A labelled on/off setting
 */
export default function SwitchRow({ label, description, checked, onChange }: SwitchRowProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-[15px] font-medium text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-[13px] leading-snug text-ink-2">{description}</p>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200 ${
          checked ? 'border-ink bg-ink' : 'border-rule bg-lacquer-3'
        }`}
      >
        <span
          className={`absolute top-[3px] left-[3px] size-5 rounded-full shadow-sm transition-transform duration-200 ease-out ${
            checked ? 'translate-x-5 bg-mat' : 'translate-x-0 bg-ink-2'
          }`}
        />
      </button>
    </div>
  );
}
