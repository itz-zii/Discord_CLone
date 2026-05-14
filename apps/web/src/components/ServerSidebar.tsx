import type { ServerItem } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type Props = {
  servers: ServerItem[];
  selectedServerId: string;
  selectServer: (serverId: string) => void;
  createServer: () => void;
};

export function ServerSidebar({
  servers,
  selectedServerId,
  selectServer,
  createServer,
}: Props) {
  return (
    <aside className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-3">
      {servers.map((item) => {
        const active = selectedServerId === item.server.id;

        return (
          <button
            key={item.server.id}
            onClick={() => selectServer(item.server.id)}
            className={`relative w-12 h-12 flex items-center justify-center font-bold text-white ${
              active
                ? "rounded-2xl bg-[#5865f2]"
                : "rounded-3xl bg-[#313338] hover:rounded-2xl hover:bg-[#5865f2]"
            }`}
            title={item.server.name}
          >
            {active && (
              <span className="absolute -left-3 w-1 h-10 rounded-r bg-white" />
            )}

            {item.server.avatarUrl ? (
              <img
                src={item.server.avatarUrl}
                alt={item.server.name}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              item.server.name[0]?.toUpperCase()
            )}
          </button>
        );
      })}

      <div className="w-8 h-px bg-white/10 my-1" />

      <button
        onClick={createServer}
        className="w-12 h-12 rounded-3xl hover:rounded-2xl bg-[#313338] hover:bg-[#23a55a] flex items-center justify-center text-[#23a55a] hover:text-white text-2xl"
        title="Create server"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </aside>
  );
}
