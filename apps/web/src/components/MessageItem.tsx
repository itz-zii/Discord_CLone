import type { Message } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faFaceLaughBeam,
  faFaceSurprise,
  faFire,
  faHeart,
  faPaperclip,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";

const REACTIONS: Array<{ emoji: string; icon: IconDefinition; label: string }> = [
  { emoji: "👍", icon: faThumbsUp, label: "Like" },
  { emoji: "❤️", icon: faHeart, label: "Love" },
  { emoji: "😂", icon: faFaceLaughBeam, label: "Laugh" },
  { emoji: "🔥", icon: faFire, label: "Fire" },
  { emoji: "😮", icon: faFaceSurprise, label: "Surprise" },
];

const reactionIconMap = REACTIONS.reduce<Record<string, IconDefinition>>((map, reaction) => {
  map[reaction.emoji] = reaction.icon;
  return map;
}, {});

type Props = {
  msg: Message;
  currentUserId?: string;
  isDM: boolean;
  canManageChannels: boolean;
  editingMessageId: string;
  editingContent: string;
  setEditingContent: (value: string) => void;
  startEditMessage: (message: Message) => void;
  cancelEditMessage: () => void;
  saveEditMessage: () => void;
  deleteMessage: (messageId: string) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
};

export function MessageItem({
  msg,
  currentUserId,
  isDM,
  canManageChannels,
  editingMessageId,
  editingContent,
  setEditingContent,
  startEditMessage,
  cancelEditMessage,
  saveEditMessage,
  deleteMessage,
  toggleReaction,
}: Props) {
  const isOwnMessage = msg.user.id === currentUserId;
  const canDeleteMessage = isOwnMessage || (!isDM && canManageChannels);
  const isEditing = editingMessageId === msg.id;

  return (
    <div className="group relative flex gap-4 px-2 py-1.5 rounded hover:bg-black/5">
      <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center shrink-0 overflow-hidden font-semibold">
        {msg.user.avatarUrl ? (
          <img
            src={`http://localhost:4000${msg.user.avatarUrl}`}
            className="w-full h-full object-cover"
          />
        ) : (
          msg.user.username[0]?.toUpperCase()
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[15px] text-[#f2f3f5]">
            {msg.user.username}
          </span>

          <span className="text-xs text-[#949ba4]">
            {new Date(msg.createdAt).toLocaleString()}
          </span>
        </div>

        {!isEditing && (
          <div className="absolute right-4 top-0 hidden group-hover:flex items-center gap-2 bg-[#2b2d31] border border-white/10 rounded-md px-2 py-1 shadow-lg">
              {REACTIONS.map((reaction) => (
                <button
                  key={reaction.emoji}
                  onClick={() => toggleReaction(msg.id, reaction.emoji)}
                  className="text-sm hover:scale-125"
                  title={`React ${reaction.label}`}
                >
                  <FontAwesomeIcon icon={reaction.icon} />
                </button>
              ))}
            {isOwnMessage && (
              <button
                onClick={() => startEditMessage(msg)}
                className="text-xs text-[#b5bac1] hover:text-white"
              >
                Edit
              </button>
            )}

            {canDeleteMessage && (
              <button
                onClick={() => deleteMessage(msg.id)}
                className="text-xs text-[#f23f43] hover:text-red-300"
              >
                Delete
              </button>
            )}
          </div>
        )}

        {isEditing ? (
          <div className="mt-2">
            <input
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;

                if (e.key === "Enter") {
                  e.preventDefault();
                  saveEditMessage();
                }

                if (e.key === "Escape") {
                  cancelEditMessage();
                }
              }}
              className="w-full bg-[#383a40] px-3 py-2 rounded-md outline-none text-[#dbdee1]"
              autoFocus
            />

            <div className="flex gap-2 mt-2">
              <button
                onClick={saveEditMessage}
                className="text-xs bg-[#5865f2] hover:bg-[#4752c4] px-2 py-1 rounded"
              >
                Save
              </button>

              <button
                onClick={cancelEditMessage}
                className="text-xs bg-[#4e5058] hover:bg-[#5c5f66] px-2 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {msg.content && (
              <p className="text-[15px] text-[#dbdee1] leading-[1.375] mt-[2px] break-words">
                {msg.content}
              </p>
            )}

            {msg.fileUrl && (
              <div className="mt-2">
                {msg.fileType?.startsWith("image/") ? (
                  <img
                    src={`http://localhost:4000${msg.fileUrl}`}
                    alt={msg.fileName || "uploaded"}
                    className="max-w-sm rounded-lg border border-white/10 shadow"
                  />
                ) : (
                  <a
                    href={`http://localhost:4000${msg.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-[#2b2d31] hover:bg-[#35373c] px-3 py-2 rounded-md text-[#5865f2] hover:underline"
                  >
                    <FontAwesomeIcon icon={faPaperclip} /> {msg.fileName || "Download file"}
                  </a>
                )}
              </div>
            )}

            {msg.reactions && msg.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {msg.reactions.map((reaction) => (
                  <button
                    key={reaction.emoji}
                    onClick={() => toggleReaction(msg.id, reaction.emoji)}
                    className={`border px-2 py-0.5 rounded-md text-sm flex items-center gap-1 transition-all ${reaction.reacted ? "bg-[#5865f2] text-white border-transparent" : "bg-[#2b2d31] hover:bg-[#35373c] border border-white/10 text-[#dbdee1]"}`}
                  >
                    {reactionIconMap[reaction.emoji] ? (
                      <FontAwesomeIcon icon={reactionIconMap[reaction.emoji]} />
                    ) : (
                      <span>{reaction.emoji}</span>
                    )}
                    <span className="text-xs text-[#b5bac1]">
                      {reaction.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
