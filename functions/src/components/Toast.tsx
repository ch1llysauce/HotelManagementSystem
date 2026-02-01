import { createContext, useContext, useState, ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextType {
  showToast: (msg: string, actionLabel?: string, onAction?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => useContext(ToastContext)!;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, actionLabel?: string, onAction?: () => void) => {
    const id = Date.now();
    const toast: Toast = { id, message, actionLabel, onAction };
    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 space-y-3 z-[9999]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-4 animate-fadeIn"
          >
            <span>{toast.message}</span>

            {toast.actionLabel && (
              <button
                onClick={() => {
                  toast.onAction?.();
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                }}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
