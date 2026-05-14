import type { Member } from "../types";

type Props = {
  members: Member[];
  onlineUserIds: string[];
  conversationByUserId: Record<string, string>;
  unreadConversationCounts: Record<string, number>;
  openDM: (member: Member) => void;
};

export function MemberSidebar({
  members,
  onlineUserIds,
  conversationByUserId,
  unreadConversationCounts,
  openDM,
}: Props) {
  return (
    <aside className="w-60 bg-[#232428] p-3 overflow-y-auto">
      <p className="text-xs text-[#949ba4] font-bold mb-3 px-1">
        MEMBERS — {members.length}
      </p>

      {(["OWNER", "ADMIN", "MEMBER"] as const).map((role) => {
        const group = members.filter((member) => member.role === role);

        if (group.length === 0) return null;

        return (
          <div key={role} className="mb-4">
            <p className="text-xs text-[#949ba4] font-bold mb-1 px-1">
              {role} — {group.length}
            </p>

            {group.map((member) => {
              const conversationId = conversationByUserId[member.user.id];
              const unreadDMCount = conversationId
                ? unreadConversationCounts[conversationId] || 0
                : 0;
              const online = onlineUserIds.includes(member.user.id);

              return (
                <button
                  key={member.user.id}
                  onClick={() => openDM(member)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#2b2d31] text-left text-[#949ba4] hover:text-[#dbdee1]"
                >
                  <div className="relative w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center shrink-0 overflow-hidden font-semibold text-white">
                    {member.user.avatarUrl ? (
                      <img
                        src={`http://localhost:4000${member.user.avatarUrl}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      member.user.username[0]?.toUpperCase()
                    )}

                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#232428] ${
                        online ? "bg-[#23a55a]" : "bg-[#80848e]"
                      }`}
                    />

                    {unreadDMCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-[5px] rounded-full bg-[#f23f43] text-white text-[10px] flex items-center justify-center border-2 border-[#232428] font-bold">
                        {unreadDMCount}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm truncate">{member.user.username}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          member.role === "OWNER"
                            ? "bg-[#5865f2] text-white"
                            : member.role === "ADMIN"
                            ? "bg-[#d97706] text-white"
                            : "bg-[#4b5563] text-[#d1d5db]"
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        );
      })}
    </aside>
  );
}
