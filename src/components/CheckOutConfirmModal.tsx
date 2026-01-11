interface CheckoutConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  guestName: string;
}

export default function CheckoutConfirmModal({
  onConfirm,
  onCancel,
  guestName,
}: CheckoutConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Check Out Guest?
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Are you sure you want to check out <strong>{guestName}</strong>?
        </p>

        <p className="text-gray-500 text-sm mt-1">
          This action will finalize the stay and record the payment.
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
