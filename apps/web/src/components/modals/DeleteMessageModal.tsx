type Props = {
  messageToDeleteId: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteMessageModal({
  messageToDeleteId,
  onCancel,
  onConfirm,
}: Props) {
  if (!messageToDeleteId) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-[420px] bg-[#313338] rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-bold mb-2">Delete message</h2>

        <p className="text-sm text-gray-400">
          Are you sure you want to delete this message? This action cannot be
          undone.
        </p>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            className="px-3 py-2 rounded bg-[#4e5058] hover:bg-[#5c5f66] text-sm font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-3 py-2 rounded bg-red-500 hover:bg-red-600 text-sm font-semibold"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
