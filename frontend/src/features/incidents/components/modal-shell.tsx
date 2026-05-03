import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export function ModalShell({
  ariaLabel,
  maxWidth = 'max-w-[500px]',
  children,
  closeLabel = 'Close',
  onClose,
}: {
  ariaLabel: string;
  maxWidth?: string;
  children: ReactNode;
  closeLabel?: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`relative w-full ${maxWidth} rounded-xl bg-white p-6 shadow-2xl`}>
        <button
          type="button"
          title={closeLabel}
          aria-label={closeLabel}
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <X size={18} aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
}
