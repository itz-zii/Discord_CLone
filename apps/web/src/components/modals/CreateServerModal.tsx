import { useState, type ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faPlus,
  faTimes,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  open: boolean;
  onCancel: () => void;
  onCreate: (name: string, image?: string | null) => void;
  onJoin: (inviteCode: string) => void;
};

const templateOptions = [
  "Gaming",
  "Friends",
  "Study Group",
  "School Club",
];

const serverTypeOptions = [
  { label: "For me and my friends", icon: faUsers },
  { label: "For a club or community", icon: faGlobe },
];

export function CreateServerModal({
  open,
  onCancel,
  onCreate,
  onJoin,
}: Props) {
  const [step, setStep] = useState<"template" | "serverType" | "customize" | "join">(
    "template",
  );
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [serverName, setServerName] = useState("");
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState("");

  if (!open) return null;

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    setServerName(template);
    setStep("serverType");
  };

  const handleServerTypeSelect = () => {
    setStep("customize");
  };

  const handleGroupImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Limit file size to 1MB
    if (file.size > 1024 * 1024) {
      alert("Image size must be less than 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setGroupImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBack = () => {
    if (step === "customize") {
      setStep("serverType");
      return;
    }
    if (step === "join") {
      setStep("template");
      setInviteCode("");
      return;
    }

    setStep("template");
    setSelectedTemplate("");
    setServerName("");
    setGroupImage(null);
  };

  const handleCancel = () => {
    setStep("template");
    setSelectedTemplate("");
    setServerName("");
    setGroupImage(null);
    setInviteCode("");
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      {step === "template" && (
        <div className="w-[420px] bg-[#2f3136] rounded-3xl shadow-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Create Your Server</h2>
              <p className="mt-3 text-sm text-[#b9bbbe] leading-6">
                Your server is where you and your friends hang out. Make yours and start talking.
              </p>
            </div>

            <button
              onClick={handleCancel}
              className="text-[#b9bbbe] hover:text-white text-xl"
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={() => handleTemplateSelect("My Awesome Server")}
              className="w-full rounded-2xl bg-[#5865f2] px-4 py-4 text-sm font-semibold text-white hover:bg-[#4752c4] transition"
            >
              Create My Own
            </button>
          </div>

          

          <div className="mt-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8e9297]">
              Start from a template
            </p>
            <div className="mt-3 grid gap-3">
              {templateOptions.map((label) => (
                <button
                  key={label}
                  onClick={() => handleTemplateSelect(label)}
                  className="w-full rounded-2xl border border-white/10 bg-[#202225] px-4 py-4 text-left text-sm font-semibold text-white hover:border-white/20 hover:bg-[#2f3136] transition"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-8">
            <p className="text-center text-sm text-[#b9bbbe]">Have an invite already?</p>
            <button
              onClick={() => setStep("join")}
              className="w-full mt-4 rounded-2xl bg-[#202225] border border-white/10 px-4 py-4 text-sm font-semibold text-white hover:border-white/20 hover:bg-[#2f3136] transition"
            >
              Join a Server
            </button>
          </div>
        </div>
      )}

      {step === "serverType" && (
        <div className="w-[420px] bg-[#2f3136] rounded-3xl shadow-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Tell Us More About Your Server</h2>
              <p className="mt-3 text-sm text-[#b9bbbe] leading-6">
                In order to help you with your setup, is your new server for just a few friends or a larger community?
              </p>
            </div>

            <button
              onClick={handleCancel}
              className="text-[#b9bbbe] hover:text-white text-xl"
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          

          <div className="mt-6 grid gap-3">
            {serverTypeOptions.map((option) => (
              <button
                key={option.label}
                onClick={handleServerTypeSelect}
                className="w-full rounded-2xl border border-white/10 bg-[#202225] px-4 py-4 text-left font-semibold text-white hover:border-white/20 hover:bg-[#2f3136] transition"
              >
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={option.icon} className="text-[#5865f2]" />
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-sm font-semibold text-[#dbdee1] hover:text-white"
            >
              Back
            </button>
            <button
              onClick={handleCancel}
              className="text-sm font-semibold text-[#dbdee1] hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === "customize" && (
        <div className="w-[420px] bg-[#2f3136] rounded-3xl shadow-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Customize Your Server</h2>
              <p className="mt-3 text-sm text-[#b9bbbe] leading-6">
                Give your new server a personality with a name and an icon. You can always change it later.
              </p>
            </div>

            <button
              onClick={handleCancel}
              className="text-[#b9bbbe] hover:text-white text-xl"
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <label htmlFor="group-image-upload" className="group relative flex h-28 w-28 cursor-pointer items-center justify-center rounded-full border border-dashed border-white/15 bg-[#202225] text-sm text-[#8e9297] transition hover:border-[#5865f2]">
              {groupImage ? (
                <img
                  src={groupImage}
                  alt="Server avatar preview"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <FontAwesomeIcon icon={faPlus} className="mb-2 text-2xl text-[#8e9297]" />
                  <span className="text-[11px] uppercase tracking-[0.3em] text-[#8e9297]">Upload</span>
                </div>
              )}
              <input
                id="group-image-upload"
                type="file"
                accept="image/*"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                onChange={handleGroupImageChange}
              />
            </label>
            {groupImage && (
              <button
                type="button"
                onClick={() => setGroupImage(null)}
                className="text-sm text-[#b9bbbe] hover:text-white"
              >
                Remove image
              </button>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-white mb-2">Server Name *</label>
            <input
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              className="w-full rounded-2xl bg-[#202225] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-[#5865f2]"
            />
          </div>

          <p className="mt-3 text-[11px] text-[#8e9297]">
            By creating a server, you agree to Discord&apos;s Community Guidelines.
          </p>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-sm font-semibold text-[#dbdee1] hover:text-white"
            >
              Back
            </button>
            <button
              onClick={() => onCreate(serverName || selectedTemplate || "My Awesome Server", groupImage)}
              className="rounded-2xl bg-[#5865f2] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4752c4] transition"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {step === "join" && (
        <div className="w-[420px] bg-[#2f3136] rounded-3xl shadow-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Join a Server</h2>
              <p className="mt-3 text-sm text-[#b9bbbe] leading-6">
                Enter an invite code to join an existing server.
              </p>
            </div>

            <button
              onClick={handleCancel}
              className="text-[#b9bbbe] hover:text-white text-xl"
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-white mb-2">Invite Code</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="e.g., 5aY8KJ2"
              className="w-full rounded-2xl bg-[#202225] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-[#5865f2]"
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-sm font-semibold text-[#dbdee1] hover:text-white"
            >
              Back
            </button>
            <button
              onClick={() => onJoin(inviteCode)}
              disabled={!inviteCode.trim()}
              className="rounded-2xl bg-[#5865f2] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4752c4] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Join
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
