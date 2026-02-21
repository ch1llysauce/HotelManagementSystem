interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "success" | "danger";
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmClasses = {
    primary: "bg-blue-500 hover:bg-blue-600",
    success: "bg-green-500 hover:bg-green-600",
    danger: "bg-red-500 hover:bg-red-600",
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      {/* modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h2>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          {cancelText && onCancel && (
            <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {cancelText}
          </button>
          )}

          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-white transition ${confirmClasses[confirmVariant ?? "primary"]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
