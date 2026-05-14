type Props = {
  open: boolean;
  channelName: string;
  setChannelName: (value: string) => void;
  onCancel: () => void;
  onCreate: () => void;
};

export function CreateChannelModal({
  open,
  channelName,
  setChannelName,
  onCancel,
  onCreate,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-[420px] bg-[#313338] rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-bold mb-4">Create channel</h2>

        <input
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCreate();
          }}
          placeholder="general"
          className="w-full bg-[#1e1f22] px-3 py-2 rounded outline-none text-sm text-gray-200"
        />

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            className="px-3 py-2 rounded bg-[#4e5058] hover:bg-[#5c5f66] text-sm font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={onCreate}
            className="px-3 py-2 rounded bg-[#5865f2] hover:bg-[#4752c4] text-sm font-semibold"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
