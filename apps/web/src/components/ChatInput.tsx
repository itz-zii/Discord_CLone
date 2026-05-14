import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";

type Props = {
  content: string;
  isDM: boolean;
  selectedConversationId: string;
  selectedChannelId: string;
  dmUsername?: string;
  channelName?: string;
  handleTyping: (value: string) => void;
  sendMessage: () => void;
  uploadFile: (file: File) => void;
};

export function ChatInput({
  content,
  isDM,
  selectedConversationId,
  selectedChannelId,
  dmUsername,
  channelName,
  handleTyping,
  sendMessage,
  uploadFile,
}: Props) {
  const disabled = isDM ? !selectedConversationId : !selectedChannelId;

  return (
    <div className="p-4 bg-[#313338]">
      <div className="bg-[#383a40] rounded-2xl px-4 py-3 flex gap-3 items-center">
        <label
          className={`text-xl ${
            disabled
              ? "cursor-not-allowed text-[#80848e]"
              : "cursor-pointer text-[#b5bac1] hover:text-white"
          }`}
          title="Upload file"
        >
          <FontAwesomeIcon icon={faPaperclip} />
          <input
            type="file"
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                uploadFile(file);
              }

              e.target.value = "";
            }}
          />
        </label>

        <input
          className="flex-1 bg-transparent outline-none text-[15px] text-[#dbdee1] placeholder-[#949ba4]"
          placeholder={
            isDM
              ? `Message @${dmUsername || ""}`
              : channelName
                ? `Message #${channelName}`
                : "Select a channel"
          }
          value={content}
          disabled={disabled}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;

            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <button
          onClick={sendMessage}
          disabled={disabled}
          className="bg-[#5865f2] hover:bg-[#4752c4] disabled:bg-[#4e5058] disabled:text-[#949ba4] px-4 py-1.5 rounded-md font-semibold text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
