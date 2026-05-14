type Props = {
  open: boolean;
  inviteCode: string;
  onCopy: () => void;
  onClose: () => void;
};

export function InviteModal({ open, inviteCode, onCopy, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-[440px] bg-[#313338] rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-bold">Invite friends</h2>

        <p className="text-sm text-gray-400 mt-1 mb-4">
          Share this code so others can join your server.
        </p>

        <div className="bg-[#1e1f22] rounded px-3 py-2 flex items-center gap-2">
          <input
            value={inviteCode}
            readOnly
            className="flex-1 bg-transparent outline-none text-sm text-gray-200"
          />

          <button
            onClick={onCopy}
            className="bg-[#5865f2] hover:bg-[#4752c4] px-3 py-1 rounded text-sm font-semibold"
          >
            Copy
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-5 px-3 py-2 rounded bg-[#4e5058] hover:bg-[#5c5f66] text-sm font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
}
