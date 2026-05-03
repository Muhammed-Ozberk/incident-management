import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  description?: string;
}

const styles = {
  success: {
    icon: CheckCircle2,
    container: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    iconColor: 'text-emerald-600',
  },
  info: {
    icon: Info,
    container: 'border-sky-200 bg-sky-50 text-sky-900',
    iconColor: 'text-sky-600',
  },
  error: {
    icon: AlertTriangle,
    container: 'border-rose-200 bg-rose-50 text-rose-900',
    iconColor: 'text-rose-600',
  },
};

export function ToastStack({
  notifications,
  onDismiss,
}: {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[min(360px,calc(100vw-32px))] flex-col gap-3">
      {notifications.map((notification) => {
        const style = styles[notification.type];
        const Icon = style.icon;

        return (
          <div
            key={notification.id}
            className={`animate-row-in rounded-lg border p-4 shadow-soft ${style.container}`}
            role="status"
          >
            <div className="flex gap-3">
              <Icon
                className={`mt-0.5 shrink-0 ${style.iconColor}`}
                size={18}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{notification.title}</p>
                {notification.description && (
                  <p className="mt-1 text-sm opacity-80">
                    {notification.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                title="Dismiss notification"
                aria-label="Dismiss notification"
                onClick={() => onDismiss(notification.id)}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md opacity-70 transition hover:bg-white/60 hover:opacity-100"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

