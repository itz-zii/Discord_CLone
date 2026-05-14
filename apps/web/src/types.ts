export type Role = "OWNER" | "ADMIN" | "MEMBER";

export type CurrentUser = {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
};

export type ServerItem = {
  id: string;
  userId: string;
  serverId: string;
  role: Role;
  server: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

export type Channel = {
  id: string;
  name: string;
  serverId: string;
  type?: "text" | "voice";
};

export type MessageReaction = {
  emoji: string;
  count: number;
  reacted?: boolean;
};

export type Message = {
  id: string;
  content: string;
  createdAt: string;
  channelId?: string | null;
  conversationId?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  reactions?: MessageReaction[];
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
};

export type Member = {
  id: string;
  role: Role;
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl: string | null;
  };
};

export type Conversation = {
  id: string;
  users: CurrentUser[];
};

export type DeletedMessagePayload = {
  id: string;
  channelId?: string | null;
  conversationId?: string | null;
};
