type Props = {
  isDM: boolean;
  dmUsername?: string;
  channelName?: string;
  ownerName?: string;
  onOpenSearch: () => void;
};

export function ChatHeader({
  isDM,
  dmUsername,
  channelName,
  ownerName,
  onOpenSearch,
}: Props) {
  return (
    <header className="h-16 px-4 flex items-center justify-between border-b border-white/5 bg-[#313338] shadow-sm">
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[#949ba4] text-xl">{isDM ? "@" : "#"}</span>

          <span className="font-semibold text-[16px] text-[#f2f3f5] truncate">
            {isDM ? dmUsername || "DM" : channelName || "no-channel"}
          </span>
        </div>

        {!isDM && ownerName ? (
          <span className="text-xs text-[#80848e] mt-1 truncate">
            Owner: {ownerName}
          </span>
        ) : null}
      </div>

      <button
        onClick={onOpenSearch}
        className="text-xs bg-[#383a40] hover:bg-[#4e5058] px-3 py-1.5 rounded-md text-[#dbdee1] font-medium"
      >
        Search
      </button>
    </header>
  );
}
