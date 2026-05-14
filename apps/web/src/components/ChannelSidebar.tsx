import type { Channel, CurrentUser } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faHeadphones, faPlus, faVolumeHigh } from "@fortawesome/free-solid-svg-icons";
import { VideoCallModal } from "./VideoCallModal";

type Props = {
  channels: Channel[];
  selectedChannelId: string;
  selectedVoiceChannelId?: string;
  selectedServer?: {
    id: string;
    name: string;
  };
  currentUser: CurrentUser | null;
  canManageChannels: boolean;
  unreadChannelCounts: Record<string, number>;
  selectChannel: (channelId: string) => void;
  joinVoiceChannel: (channelId: string) => void;
  createChannel: () => void;
  createInvite: () => void;
  openProfile: () => void;
  showVideoCall?: boolean;
  voiceChannelName?: string;
  serverName?: string;
  conversationId?: string;
  onCloseVideoCall?: () => void;
};

const isVoiceChannel = (channel: Channel) =>
  channel.type === "voice" || channel.name.toLowerCase().includes("voice");

export function ChannelSidebar({
  channels,
  selectedChannelId,
  selectedVoiceChannelId,
  selectedServer,
  currentUser,
  canManageChannels,
  unreadChannelCounts,
  selectChannel,
  joinVoiceChannel,
  createChannel,
  createInvite,
  openProfile,
  showVideoCall = false,
  voiceChannelName = "Voice",
  serverName = "",
  conversationId = "",
  onCloseVideoCall = () => {},
}: Props) {
  const textChannels = channels.filter((channel) => !isVoiceChannel(channel));
  const voiceChannels = channels.filter(isVoiceChannel);

  return (
    <aside className="relative w-60 bg-[#2b2d31] flex flex-col pb-4">
      <div className="h-12 px-4 flex items-center justify-between border-b border-black/30 font-semibold shadow-sm">
        <span className="truncate text-[#f2f3f5]">
          {selectedServer?.name || "No Server"}
        </span>

        {canManageChannels && selectedServer?.id && (
          <button
            onClick={createInvite}
            className="text-xs bg-[#383a40] hover:bg-[#4e5058] px-2.5 py-1.5 rounded-md text-[#dbdee1]"
          >
            Invite
          </button>
        )}
      </div>

      <div className="flex-1 p-3 overflow-y-auto pb-28">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs text-[#949ba4] font-bold">TEXT CHANNELS</p>

          {canManageChannels && (
            <button
              onClick={createChannel}
              className="text-[#949ba4] hover:text-white text-lg leading-none"
              title="Create channel"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          )}
        </div>

        {textChannels.map((channel) => {
          const active = selectedChannelId === channel.id;
          const unread = unreadChannelCounts[channel.id] || 0;

          return (
            <button
              key={channel.id}
              onClick={() => selectChannel(channel.id)}
              className={`w-full text-left px-2 py-1.5 rounded-md mb-0.5 ${
                active
                  ? "bg-[#404249] text-white"
                  : "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[15px] truncate"># {channel.name}</span>

                {unread > 0 && (
                  <span className="min-w-[18px] h-[18px] px-[5px] rounded-full bg-[#f23f43] text-white text-[11px] flex items-center justify-center font-bold">
                    {unread}
                  </span>
                )}
              </div>
            </button>
          );
        })}

        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs text-[#949ba4] font-bold">VOICE CHANNELS</p>

          {canManageChannels && (
            <button
              onClick={createChannel}
              className="text-[#949ba4] hover:text-white text-lg leading-none"
              title="Create channel"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          )}
        </div>

        {voiceChannels.length > 0 ? (
          voiceChannels.map((channel) => {
            const active = selectedVoiceChannelId === channel.id;

            return (
              <div key={channel.id} className="mb-3 rounded-xl bg-[#2a2c2f] border border-white/5">
                <button
                  onClick={() => joinVoiceChannel(channel.id)}
                  className={`w-full text-left px-3 py-2 rounded-t-xl flex items-center justify-between gap-2 ${
                    active
                      ? "bg-[#2f3238] text-white"
                      : "text-[#b9bbbe] hover:bg-[#2e3238] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faVolumeHigh} className="text-[#5865f2]" />
                    <span className="text-[15px] truncate">{channel.name}</span>
                  </div>
                  <span className={`text-[11px] uppercase tracking-[0.08em] ${active ? "text-[#9db4ff]" : "text-[#8b94a5]"}`}>
                    {active ? "" : ""}
                  </span>
                </button>

                {active && (
                  <div className=" px-3 py-3 rounded-b-xl ">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 rounded-2xl">
                        <div className="h-10 w-10 rounded-full bg-[#5865f2] overflow-hidden flex items-center justify-center text-sm font-semibold text-white">
                          {currentUser?.username?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {currentUser?.username || "You"}
                          </p>
                          <p className="text-[11px] text-[#8b94a5] truncate">In voice</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="px-2 py-2 text-xs text-[#6c74a5]">No voice channels available</div>
        )}
      </div>

      <div className="absolute w-75 left-[-65px] bottom-1.5 z-10 rounded-lg border border-white/10 bg-[#212428]/95 px-3 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          {showVideoCall && conversationId && (
        <div className="  backdrop-blur-xl">
          <VideoCallModal
            open={true}
            inline
            conversationId={conversationId}
            voiceChannelName={voiceChannelName}
            serverName={serverName}
            onClose={onCloseVideoCall}
          />
        </div>
      )}
        <div className="flex items-center gap-3">
          
          <button
            onClick={openProfile}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-[#2c3036]"
          >
            <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center text-lg font-semibold text-white shadow-inner shadow-black/20">
              {currentUser?.username?.[0]?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-sm truncate text-white">
                {currentUser?.username || "User"}
              </p>
              <p className="text-[11px] uppercase text-[#6ce6a9] tracking-[0.08em] font-bold">
                {showVideoCall ? "In voice" : "Online"}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2b2f35] text-[#dbdee1] transition hover:bg-[#3b4049]"
              aria-label="Headphones"
            >
              <FontAwesomeIcon icon={faHeadphones} className="text-base" />
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[#dbdee1] transition hover:bg-[#3b4049]"
              aria-label="Settings"
              onClick={openProfile}
            >
              <FontAwesomeIcon icon={faCog} className="text-base" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
