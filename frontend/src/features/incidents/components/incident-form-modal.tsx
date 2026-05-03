import { X } from 'lucide-react';
import { IncidentForm } from './incident-form';
import type {
  CreateIncidentPayload,
  RegisteredService,
} from '../types/incident';

export function IncidentFormModal({
  ariaLabel,
  closeLabel,
  services,
  initialData,
  onClose,
  onSubmit,
}: {
  ariaLabel: string;
  closeLabel: string;
  services: RegisteredService[];
  initialData?: CreateIncidentPayload;
  onClose: () => void;
  onSubmit: (payload: CreateIncidentPayload) => Promise<void>;
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
      <div className="relative w-full max-w-[440px]">
        <button
          type="button"
          title="Close"
          aria-label={closeLabel}
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <X size={16} aria-hidden="true" />
        </button>
        <IncidentForm
          onSubmit={onSubmit}
          services={services}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
