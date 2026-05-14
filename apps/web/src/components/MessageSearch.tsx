import type { Message } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";

type Props = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  results: Message[];
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
};

export function MessageSearch({
  searchQuery,
  setSearchQuery,
  results,
  open,
  onClose,
  onSearch,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center pt-20 z-50">
      <div className="w-[560px] bg-[#313338] rounded-lg shadow-xl overflow-hidden">
        <div className="p-4 border-b border-black/30 flex gap-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
              if (e.key === "Escape") onClose();
            }}
            placeholder="Search messages..."
            className="flex-1 bg-[#1e1f22] px-3 py-2 rounded outline-none text-sm"
            autoFocus
          />

          <button
            onClick={onSearch}
            className="px-3 py-2 rounded bg-[#5865f2] hover:bg-[#4752c4] text-sm font-semibold"
          >
            Search
          </button>

          <button
            onClick={onClose}
            className="px-3 py-2 rounded bg-[#4e5058] hover:bg-[#5c5f66] text-sm font-semibold"
          >
            Close
          </button>
        </div>

        <div className="max-h-[520px] overflow-y-auto p-4 space-y-3">
          {results.length === 0 ? (
            <p className="text-sm text-gray-400">No results</p>
          ) : (
            results.map((msg) => (
              <div
                key={msg.id}
                className="bg-[#2b2d31] rounded p-3 border border-white/5"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {msg.user.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-gray-200 break-words">
                  {msg.content}
                </p>

                {msg.fileUrl && (
                  <p className="text-xs text-[#5865f2] mt-1 flex items-center gap-2">
                    <FontAwesomeIcon icon={faPaperclip} /> {msg.fileName || "Attachment"}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
