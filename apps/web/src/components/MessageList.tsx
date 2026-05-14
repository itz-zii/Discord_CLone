import type { Message } from "../types";
import { MessageItem } from "./MessageItem";

type Props = {
  messages: Message[];
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

export function MessageList({
  messages,
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
  return (
    <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1 bg-[#313338]">
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          msg={msg}
          currentUserId={currentUserId}
          isDM={isDM}
          canManageChannels={canManageChannels}
          editingMessageId={editingMessageId}
          editingContent={editingContent}
          setEditingContent={setEditingContent}
          startEditMessage={startEditMessage}
          cancelEditMessage={cancelEditMessage}
          saveEditMessage={saveEditMessage}
          deleteMessage={deleteMessage}
          toggleReaction={toggleReaction}
        />
      ))}
    </div>
  );
}
