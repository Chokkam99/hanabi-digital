'use client';

import { useEffect, useId, useRef } from 'react';
import Icon from './Icon';

interface SheetProps {
  title: string;
  description?: React.ReactNode;
  // Without onClose the sheet can't be dismissed (e.g. a drawn card must be entered or undone)
  onClose?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Bottom sheet on phones, centered panel on wider screens
 */
export default function Sheet({ title, description, onClose, children, footer }: SheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Read the latest onClose without re-running the mount effect (which would steal focus)
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    // Remember what opened the sheet so focus can go back there when it closes
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Move focus into the sheet so keyboard and screen reader users land in it
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>('button:not([disabled]), input, [tabindex="0"]') ?? []);
    (focusables()[0] ?? panel)?.focus({ preventScroll: true });

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.();
        return;
      }
      // Keep Tab inside the sheet; the table behind it isn't reachable while it's open
      if (e.key === 'Tab') {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const inside = panel?.contains(document.activeElement);
        if (e.shiftKey && (document.activeElement === first || !inside)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKey);

    // Keep the table from scrolling underneath
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-black/65 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-2xl border border-rule bg-lacquer shadow-[0_-12px_40px_rgba(0,0,0,0.5)] animate-sheet-in focus:outline-none sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold leading-tight text-ink [font-stretch:92%]">
              {title}
            </h2>
            {description && <div className="mt-1 text-sm text-ink-2">{description}</div>}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="-mt-1 -mr-2 flex size-10 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-lacquer-2 hover:text-ink"
            >
              <Icon name="close" />
            </button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>

        {footer && <div className="flex gap-2 border-t border-rule px-5 pt-3 pb-safe">{footer}</div>}
      </div>
    </div>
  );
}
