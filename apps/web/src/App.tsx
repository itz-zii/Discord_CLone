import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./lib/api";
import { socket } from "./socket";

import type {
  Channel,
  Conversation,
  CurrentUser,
  DeletedMessagePayload,
  Member,
  Message,
  MessageReaction,
  ServerItem,
} from "./types";
import { MessageSearch } from "./components/MessageSearch";
import { AuthScreen } from "./components/AuthScreen";
import { ServerSidebar } from "./components/ServerSidebar";
import { ChannelSidebar } from "./components/ChannelSidebar";
import { ChatHeader } from "./components/ChatHeader";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { MemberSidebar } from "./components/MemberSidebar";
import { Toast } from "./components/Toast";
import { ProfileModal } from "./components/modals/ProfileModal";
import { DeleteMessageModal } from "./components/modals/DeleteMessageModal";
import { CreateServerModal } from "./components/modals/CreateServerModal";
import { CreateChannelModal } from "./components/modals/CreateChannelModal";
import { InviteModal } from "./components/modals/InviteModal";
import { JoinServerModal } from "./components/modals/JoinServerModal";

function App() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [email, setEmail] = useState("test@gmail.com");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("123456");
  const [birthDate, setBirthDate] = useState({ month: "", day: "", year: "" });
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [servers, setServers] = useState<ServerItem[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const [selectedServerId, setSelectedServerId] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [selectedVoiceChannelId, setSelectedVoiceChannelId] = useState("");

  const [isDM, setIsDM] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [dmUser, setDmUser] = useState<CurrentUser | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const [editingMessageId, setEditingMessageId] = useState("");
  const [editingContent, setEditingContent] = useState("");

  const [messageToDeleteId, setMessageToDeleteId] = useState("");

  const [inviteCode, setInviteCode] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const [showCreateServerModal, setShowCreateServerModal] = useState(false);

  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [channelName, setChannelName] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);

  const [unreadChannelCounts, setUnreadChannelCounts] = useState<
    Record<string, number>
  >({});

  const [unreadConversationCounts, setUnreadConversationCounts] = useState<
    Record<string, number>
  >({});

  const [conversationByUserId, setConversationByUserId] = useState<
    Record<string, string>
  >({});

  const searchMessages = async () => {
    if (!searchQuery.trim()) return;

    const params = new URLSearchParams();
    params.set("q", searchQuery.trim());

    if (isDM) {
      if (!selectedConversationId) return;
      params.set("conversationId", selectedConversationId);
    } else {
      if (!selectedChannelId) return;
      params.set("channelId", selectedChannelId);
    }

    const res = await api.get<Message[]>(
      `/messages/search?${params.toString()}`,
    );
    setSearchResults(res.data);
  };

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendingRef = useRef(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 2000);
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    const err = error as {
      response?: { data?: { message?: string } } | undefined;
      message?: string;
    };

    return err?.response?.data?.message || err?.message || fallback;
  };

  const login = async () => {
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setLoggedIn(true);
      await loadMe();
      await loadServers();
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Login failed");
      setAuthError(message);
      showToast(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async () => {
    setAuthError("");
    setAuthLoading(true);

    try {
      await api.post("/auth/register", {
        email,
        username,
        password,
      });

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      setLoggedIn(true);
      await loadMe();
      await loadServers();
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Register failed");
      setAuthError(message);
      showToast(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setShowProfileModal(false);
    setLoggedIn(false);
    setCurrentUser(null);
    setAuthError("");
    setServers([]);
    setChannels([]);
    setMembers([]);
    setMessages([]);
    setTypingUsers([]);
    setSelectedServerId("");
    setSelectedChannelId("");
    setIsDM(false);
    setSelectedConversationId("");
    setDmUser(null);
    setEditingMessageId("");
    setEditingContent("");
    setMessageToDeleteId("");
    setInviteCode("");
    setShowInviteModal(false);
    setShowJoinModal(false);
    setJoinCode("");
    setShowCreateServerModal(false);
    setShowCreateChannelModal(false);
    setChannelName("");
    setOnlineUserIds([]);
    setUnreadChannelCounts({});
    setUnreadConversationCounts({});
    setConversationByUserId({});
    setShowSearchModal(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const loadMe = useCallback(async () => {
    try {
      const res = await api.get<CurrentUser>("/auth/me");
      setCurrentUser(res.data);
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Session expired. Please login again.");
      console.error("Load me error:", error);
      logout();
      showToast(message);
    }
  }, []);

  const loadServers = async () => {
    const res = await api.get<ServerItem[]>("/servers");
    setServers(res.data);

    const firstServer = res.data[0]?.server;

    if (firstServer) {
      setSelectedServerId(firstServer.id);
    } else {
      setSelectedServerId("");
      setSelectedChannelId("");
      setChannels([]);
      setMembers([]);
      setMessages([]);
      setTypingUsers([]);
    }
  };

  const loadChannels = async (serverId: string) => {
    const res = await api.get<Channel[]>(`/channels/server/${serverId}`);
    setChannels(res.data);

    const firstChannel = res.data[0];

    if (firstChannel) {
      setIsDM(false);
      setSelectedConversationId("");
      setDmUser(null);
      setSelectedChannelId(firstChannel.id);
    } else {
      setSelectedChannelId("");
      setMessages([]);
      setTypingUsers([]);
    }
  };

  const loadMembers = async (serverId: string) => {
    const res = await api.get<Member[]>(`/servers/${serverId}/members`);
    setMembers(res.data);
  };

  const loadMessages = async (channelId: string) => {
    const res = await api.get<Message[]>(`/messages/channel/${channelId}`);
    setMessages(res.data);
  };

  const loadDMMessages = async (conversationId: string) => {
    const res = await api.get<Message[]>(
      `/messages/conversation/${conversationId}`,
    );
    setMessages(res.data);
  };

  const selectServer = (serverId: string) => {
    setIsDM(false);
    setSelectedConversationId("");
    setDmUser(null);
    setSelectedServerId(serverId);
  };

  const selectChannel = (channelId: string) => {
    setIsDM(false);
    setSelectedConversationId("");
    setDmUser(null);
    setSelectedChannelId(channelId);

    setUnreadChannelCounts((prev) => ({
      ...prev,
      [channelId]: 0,
    }));
  };

  const openDM = async (member: Member) => {
    if (!currentUser) return;

    if (member.user.id === currentUser.id) {
      showToast("You cannot DM yourself.");
      return;
    }

    const res = await api.post<Conversation>("/conversations", {
      userId: member.user.id,
    });

    setIsDM(true);
    setSelectedConversationId(res.data.id);
    setDmUser(member.user);
    setMessages([]);
    setTypingUsers([]);
    setEditingMessageId("");
    setEditingContent("");

    setUnreadConversationCounts((prev) => ({
      ...prev,
      [res.data.id]: 0,
    }));

    setConversationByUserId((prev) => ({
      ...prev,
      [member.user.id]: res.data.id,
    }));
  };

  const createServer = () => {
    setShowCreateServerModal(true);
  };

  const handleCreateServer = async (name: string, image?: string | null) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      console.log("Creating server with name:", trimmedName);
      const res = await api.post("/servers", {
        name: trimmedName,
        avatarUrl: image || null,
      });

      console.log("Server created:", res.data);

      try {
        await loadServers();
        console.log("Servers loaded successfully");
      } catch (loadError) {
        console.error("Load servers error:", loadError);
      }

      setSelectedServerId(res.data.id);
      setShowCreateServerModal(false);
      showToast("Server created successfully!");
    } catch (error) {
      console.error("Create server failed:", error);
      if (error instanceof Error) {
        showToast("Error: " + error.message);
      } else {
        showToast("Failed to create server");
      }
    }
  };

  const handleJoinServer = async (inviteCode: string) => {
    const trimmedCode = inviteCode.trim();
    if (!trimmedCode) return;

    try {
      console.log("Joining server with invite code:", trimmedCode);
      const res = await api.post(`/servers/invites/${trimmedCode}/join`);

      console.log("Joined server:", res.data);

      try {
        await loadServers();
        console.log("Servers loaded successfully");
      } catch (loadError) {
        console.error("Load servers error:", loadError);
      }

      setShowCreateServerModal(false);
      showToast("Successfully joined server!");
    } catch (error) {
      console.error("Join server failed:", error);
      if (error instanceof Error) {
        showToast("Error: " + error.message);
      } else {
        showToast("Failed to join server");
      }
    }
  };

  const createChannel = () => {
    if (!selectedServerId) return;
    setShowCreateChannelModal(true);
  };

  const handleCreateChannel = async () => {
    if (!selectedServerId || !channelName.trim()) return;

    const res = await api.post<Channel>("/channels", {
      name: channelName,
      serverId: selectedServerId,
    });

    setChannels((prev) => [...prev, res.data]);
    setIsDM(false);
    setSelectedConversationId("");
    setDmUser(null);
    setSelectedChannelId(res.data.id);
    setChannelName("");
    setShowCreateChannelModal(false);
    showToast("Channel created successfully!");
  };

  const createInvite = async () => {
    if (!selectedServerId) return;

    const res = await api.post(`/servers/${selectedServerId}/invites`);
    const code = res.data.code;

    setInviteCode(code);
    setShowInviteModal(true);
    showToast("Invite code created!");
  };

  const copyInviteCode = async () => {
    if (!inviteCode) return;

    await navigator.clipboard.writeText(inviteCode);
    showToast("Copied invite code!");
  };

  const handleJoinByInvite = async () => {
    const trimmedCode = joinCode.trim();
    if (!trimmedCode) return;

    try {
      await api.post(`/servers/invites/${trimmedCode.toLowerCase()}/join`);
      await loadServers();

      setJoinCode("");
      setShowJoinModal(false);
      showToast("Joined server!");
    } catch (error) {
      console.error("Join invite failed:", error);
      showToast("Failed to join server");
    }
  };

  const emitTypingStop = () => {
    if (isDM) return;
    if (!selectedChannelId || !currentUser) return;

    socket.emit("typing:stop", {
      channelId: selectedChannelId,
      username: currentUser.username,
    });
  };

  const handleTyping = (value: string) => {
    setContent(value);

    if (isDM) return;
    if (!selectedChannelId || !currentUser) return;

    socket.emit("typing:start", {
      channelId: selectedChannelId,
      username: currentUser.username,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop();
    }, 1000);
  };

  const sendMessage = async () => {
    if (sendingRef.current) return;
    if (!content.trim()) return;

    sendingRef.current = true;

    try {
      if (isDM) {
        if (!selectedConversationId) return;

        const res = await api.post("/messages/dm", {
          content,
          conversationId: selectedConversationId,
        });

        setMessages((prev) => {
          if (prev.some((message) => message.id === res.data.id)) return prev;
          return [...prev, res.data];
        });
      } else {
        if (!selectedChannelId) return;

        const res = await api.post("/messages", {
          content,
          channelId: selectedChannelId,
        });

        setMessages((prev) => {
          if (prev.some((message) => message.id === res.data.id)) return prev;
          return [...prev, res.data];
        });

        emitTypingStop();
      }

      setContent("");

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    } finally {
      sendingRef.current = false;
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("content", content);

    if (isDM) {
      if (!selectedConversationId) return;
      formData.append("conversationId", selectedConversationId);
    } else {
      if (!selectedChannelId) return;
      formData.append("channelId", selectedChannelId);
    }

    await api.post("/messages/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setContent("");
  };

  const startEditMessage = (message: Message) => {
    if (message.user.id !== currentUser?.id) return;

    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const cancelEditMessage = () => {
    setEditingMessageId("");
    setEditingContent("");
  };

  const saveEditMessage = async () => {
    if (!editingMessageId || !editingContent.trim()) return;

    await api.patch(`/messages/${editingMessageId}`, {
      content: editingContent,
    });

    setEditingMessageId("");
    setEditingContent("");
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    try {
      const res = await api.post<MessageReaction[]>(
        `/messages/${messageId}/reactions`,
        {
          emoji,
        },
      );

      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? { ...message, reactions: res.data }
            : message,
        ),
      );
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Could not toggle reaction");
      showToast(message);
    }
  };

  const deleteMessage = (messageId: string) => {
    setMessageToDeleteId(messageId);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDeleteId) return;

    await api.delete(`/messages/${messageToDeleteId}`);

    setMessageToDeleteId("");
    showToast("Message deleted");
  };

  useEffect(() => {
    if (!loggedIn) return;

    queueMicrotask(() => {
      void loadMe();
      void loadServers();
    });
  }, [loggedIn, loadMe]);

  useEffect(() => {
    if (!selectedServerId) return;

    queueMicrotask(() => {
      void loadChannels(selectedServerId);
      void loadMembers(selectedServerId);
    });
  }, [selectedServerId]);

  useEffect(() => {
    if (!currentUser) return;

    socket.emit("user:online", currentUser.id);

    socket.on("online-users", (userIds: string[]) => {
      setOnlineUserIds(userIds);
    });

    return () => {
      socket.off("online-users");
    };
  }, [currentUser]);

  useEffect(() => {
    if (isDM) return;
    if (!selectedChannelId) return;

    queueMicrotask(() => {
      setTypingUsers([]);
      setEditingMessageId("");
      setEditingContent("");
      void loadMessages(selectedChannelId);
    });

    socket.emit("join-channel", selectedChannelId);

    const handleNewMessage = (message: Message) => {
      if (message.channelId && message.channelId !== selectedChannelId) {
        setUnreadChannelCounts((prev) => ({
          ...prev,
          [message.channelId!]: (prev[message.channelId!] || 0) + 1,
        }));

        return;
      }

      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev;
        return [...prev, message];
      });
    };

    const handleUpdatedMessage = (updatedMessage: Message) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === updatedMessage.id ? updatedMessage : message,
        ),
      );
    };

    const handleDeletedMessage = (payload: DeletedMessagePayload) => {
      setMessages((prev) =>
        prev.filter((message) => message.id !== payload.id),
      );
    };

    const handleReaction = ({
      messageId,
      reactions,
    }: {
      messageId: string;
      reactions: Message["reactions"];
    }) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                reactions,
              }
            : message,
        ),
      );
    };

    const handleTypingStart = ({ username }: { username: string }) => {
      if (username === currentUser?.username) return;

      setTypingUsers((prev) => {
        if (prev.includes(username)) return prev;
        return [...prev, username];
      });
    };

    const handleTypingStop = ({ username }: { username: string }) => {
      setTypingUsers((prev) => prev.filter((name) => name !== username));
    };

    socket.off("message:new");
    socket.off("message:updated");
    socket.off("message:deleted");

    socket.on("message:new", handleNewMessage);
    socket.on("message:updated", handleUpdatedMessage);
    socket.on("message:deleted", handleDeletedMessage);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    socket.off("message:reaction");
    socket.on("message:reaction", handleReaction);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:updated", handleUpdatedMessage);
      socket.off("message:deleted", handleDeletedMessage);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      socket.off("message:reaction", handleReaction);
    };
  }, [isDM, selectedChannelId, currentUser?.username]);

  useEffect(() => {
    if (!isDM) return;
    if (!selectedConversationId) return;

    queueMicrotask(() => {
      setTypingUsers([]);
      setEditingMessageId("");
      setEditingContent("");
      void loadDMMessages(selectedConversationId);
    });

    socket.emit("join-conversation", selectedConversationId);

    const handleNewMessage = (message: Message) => {
      if (
        message.conversationId &&
        message.conversationId !== selectedConversationId
      ) {
        setUnreadConversationCounts((prev) => ({
          ...prev,
          [message.conversationId!]: (prev[message.conversationId!] || 0) + 1,
        }));

        return;
      }

      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev;
        return [...prev, message];
      });
    };

    const handleUpdatedMessage = (updatedMessage: Message) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === updatedMessage.id ? updatedMessage : message,
        ),
      );
    };

    const handleDeletedMessage = (payload: DeletedMessagePayload) => {
      setMessages((prev) =>
        prev.filter((message) => message.id !== payload.id),
      );
    };

    socket.off("message:new");
    socket.off("message:updated");
    socket.off("message:deleted");

    socket.on("message:new", handleNewMessage);
    socket.on("message:updated", handleUpdatedMessage);
    socket.on("message:deleted", handleDeletedMessage);
    socket.on("message:reaction", ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions } : m)),
      );
    });

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:updated", handleUpdatedMessage);
      socket.off("message:deleted", handleDeletedMessage);
      socket.off("message:reaction");
    };
  }, [isDM, selectedConversationId]);

  const selectedServerMember = servers.find(
    (item) => item.server.id === selectedServerId,
  );

  const selectedServer = selectedServerMember?.server;

  const selectedChannel = channels.find(
    (channel) => channel.id === selectedChannelId,
  );

  const selectedVoiceChannel = channels.find(
    (channel) => channel.id === selectedVoiceChannelId,
  );

  const selectedServerOwnerName = members.find(
    (member) => member.role === "OWNER",
  )?.user.username;

  const canManageChannels =
    selectedServerMember?.role === "OWNER" ||
    selectedServerMember?.role === "ADMIN";

  if (!loggedIn) {
    return (
      <AuthScreen
        mode={mode}
        email={email}
        displayName={displayName}
        username={username}
        password={password}
        birthDate={birthDate}
        error={authError}
        loading={authLoading}
        setMode={setMode}
        setEmail={setEmail}
        setDisplayName={setDisplayName}
        setUsername={setUsername}
        setPassword={setPassword}
        setBirthDate={setBirthDate}
        login={() => {
          void login();
        }}
        register={() => {
          void register();
        }}
      />
    );
  }

  return (
    <div className="h-screen bg-[#313338] text-white flex">
      <ServerSidebar
        servers={servers}
        selectedServerId={selectedServerId}
        selectServer={selectServer}
        createServer={createServer}
      />

      <ChannelSidebar
        channels={channels}
        selectedChannelId={selectedChannelId}
        selectedVoiceChannelId={selectedVoiceChannelId}
        selectedServer={selectedServer}
        currentUser={currentUser}
        canManageChannels={canManageChannels}
        unreadChannelCounts={unreadChannelCounts}
        selectChannel={selectChannel}
        joinVoiceChannel={(channelId) => {
          setSelectedVoiceChannelId(channelId);
          setShowVideoCall(true);
        }}
        createChannel={createChannel}
        openProfile={() => setShowProfileModal(true)}
        createInvite={() => {
          void createInvite();
        }}
        showVideoCall={showVideoCall}
        voiceChannelName={selectedVoiceChannel?.name || "Voice"}
        serverName={selectedServer?.name || ""}
        conversationId={selectedVoiceChannelId || selectedConversationId}
        onCloseVideoCall={() => {
          setShowVideoCall(false);
          setSelectedVoiceChannelId("");
        }}
      />

      <main className="flex-1 flex flex-col">
        <ChatHeader
          isDM={isDM}
          dmUsername={dmUser?.username}
          channelName={selectedChannel?.name}
          ownerName={selectedServerOwnerName}
          onOpenSearch={() => setShowSearchModal(true)}
        />

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex min-h-0">
            <section className="flex-1 flex flex-col min-w-0">
            <MessageList
              messages={messages}
              currentUserId={currentUser?.id}
              isDM={isDM}
              canManageChannels={canManageChannels}
              editingMessageId={editingMessageId}
              editingContent={editingContent}
              setEditingContent={setEditingContent}
              startEditMessage={startEditMessage}
              cancelEditMessage={cancelEditMessage}
              saveEditMessage={() => {
                void saveEditMessage();
              }}
              deleteMessage={deleteMessage}
              toggleReaction={toggleReaction}
            />

            {!isDM && typingUsers.length > 0 && (
              <div className="px-4 pb-1 text-xs text-gray-400">
                {typingUsers.join(", ")}{" "}
                {typingUsers.length === 1 ? "is" : "are"} typing...
              </div>
            )}

            <ChatInput
              content={content}
              isDM={isDM}
              selectedConversationId={selectedConversationId}
              selectedChannelId={selectedChannelId}
              dmUsername={dmUser?.username}
              channelName={selectedChannel?.name}
              handleTyping={handleTyping}
              sendMessage={() => {
                void sendMessage();
              }}
              uploadFile={(file) => {
                void uploadFile(file);
              }}
            />
          </section>

          <MemberSidebar
            members={members}
            onlineUserIds={onlineUserIds}
            conversationByUserId={conversationByUserId}
            unreadConversationCounts={unreadConversationCounts}
            openDM={(member) => {
              void openDM(member);
            }}
          />
        </div>
      </div>
      </main>

      {showCreateServerModal && (
        <CreateServerModal
          open={showCreateServerModal}
          onCancel={() => {
            setShowCreateServerModal(false);
          }}
          onCreate={(name, image) => {
            void handleCreateServer(name, image);
          }}
          onJoin={(inviteCode) => {
            void handleJoinServer(inviteCode);
          }}
        />
      )}

      <CreateChannelModal
        open={showCreateChannelModal}
        channelName={channelName}
        setChannelName={setChannelName}
        onCancel={() => {
          setShowCreateChannelModal(false);
          setChannelName("");
        }}
        onCreate={() => {
          void handleCreateChannel();
        }}
      />

      <InviteModal
        open={showInviteModal}
        inviteCode={inviteCode}
        onCopy={() => {
          void copyInviteCode();
        }}
        onClose={() => setShowInviteModal(false)}
      />

      <JoinServerModal
        open={showJoinModal}
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        onCancel={() => {
          setShowJoinModal(false);
          setJoinCode("");
        }}
        onJoin={() => {
          void handleJoinByInvite();
        }}
      />

      <DeleteMessageModal
        messageToDeleteId={messageToDeleteId}
        onCancel={() => setMessageToDeleteId("")}
        onConfirm={() => {
          void confirmDeleteMessage();
        }}
      />
      <MessageSearch
        open={showSearchModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        results={searchResults}
        onClose={() => {
          setShowSearchModal(false);
          setSearchQuery("");
          setSearchResults([]);
        }}
        onSearch={() => {
          void searchMessages();
        }}
      />

      <Toast message={toastMessage} />
      <ProfileModal
        open={showProfileModal}
        currentUser={currentUser}
        onClose={() => setShowProfileModal(false)}
        onLogout={logout}
      />
    </div>
    
  );
}

export default App;
