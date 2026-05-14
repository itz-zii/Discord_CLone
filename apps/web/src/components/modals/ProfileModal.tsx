import { useState } from "react";
import type { CurrentUser } from "../../types";

type Props = {
  open: boolean;
  currentUser: CurrentUser | null;
  onClose: () => void;
  onLogout: () => void;
};

const sections = [
  "My Account",
  "Content & Social",
  "Data & Privacy",
  "Family Center",
  "Authorized Apps",
  "Devices",
  "Connections",
  "Notifications",
];

export function ProfileModal({
  open,
  currentUser,
  onClose,
  onLogout,
}: Props) {
  const [activeSection, setActiveSection] = useState("My Account");

  if (!open || !currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-[1100px] max-h-[calc(100vh-40px)] overflow-hidden rounded-[32px] bg-[#191b1f] shadow-2xl ring-1 ring-white/10 flex">
        <aside className="w-72 border-r border-white/10 bg-[#141619] p-5 overflow-y-auto">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#6c74a5] font-semibold">
              User Settings
            </p>
          </div>

          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setActiveSection(section)}
                className={`w-full text-left rounded-2xl px-4 py-3 transition ${
                  activeSection === section
                    ? "bg-[#1f2230] text-white"
                    : "text-[#9aa1b9] hover:bg-[#1f2230] hover:text-white"
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-8 py-6">
            <div>
              <h2 className="text-2xl font-semibold text-white">{activeSection}</h2>
              <p className="text-sm text-[#8b94a5] mt-1">
                {activeSection === "My Account"
                  ? "Manage your profile, email, and account preferences."
                  : "Adjust your settings for this section."}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 px-3 py-2 text-sm text-[#9aa1b9] hover:bg-white/5 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="flex flex-col gap-6">
              <div className="rounded-[30px] bg-[#121316] border border-white/10 p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[#6c74a5] mb-2">
                      My Account
                    </p>
                    <p className="text-lg font-semibold text-white">
                      {currentUser.username}
                    </p>
                  </div>
                  <button
                    className="rounded-full bg-[#5865f2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4752c4]"
                    type="button"
                  >
                    Edit User Profile
                  </button>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.5fr,1fr]">
                <div className="rounded-[30px] bg-[#121316] border border-white/10 p-6">
                  <div className="mb-5">
                    <p className="text-sm text-[#8b94a5] uppercase tracking-[0.2em] mb-2">
                      Account Details
                    </p>
                    <p className="text-white text-sm">
                      Manage the details associated with your user account.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl bg-[#181b20] p-4">
                      <p className="text-xs text-[#6c74a5] uppercase tracking-[0.2em] mb-1">
                        Display Name
                      </p>
                      <p className="text-white font-semibold">{currentUser.username}</p>
                    </div>

                    <div className="rounded-2xl bg-[#181b20] p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-[#6c74a5] uppercase tracking-[0.2em] mb-1">
                            Username
                          </p>
                          <p className="text-white font-semibold">{currentUser.username}</p>
                        </div>
                        <button className="text-sm text-[#5865f2] hover:underline">
                          Edit
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#181b20] p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-[#6c74a5] uppercase tracking-[0.2em] mb-1">
                            Email
                          </p>
                          <p className="text-white font-semibold">
                            {currentUser.email}
                          </p>
                        </div>
                        <button className="text-sm text-[#5865f2] hover:underline">
                          Edit
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#181b20] p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-[#6c74a5] uppercase tracking-[0.2em] mb-1">
                            Phone Number
                          </p>
                          <p className="text-white font-semibold">Not set</p>
                        </div>
                        <button className="text-sm text-[#5865f2] hover:underline">
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[30px] bg-[#121316] border border-white/10 p-6">
                  <div className="mb-5">
                    <p className="text-sm text-[#8b94a5] uppercase tracking-[0.2em] mb-2">
                      Security
                    </p>
                    <p className="text-white text-sm">
                      Control how your account stays safe and secure.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl bg-[#181b20] p-4">
                      <p className="text-sm text-white font-semibold">Password</p>
                      <p className="text-xs text-[#8b94a5] mt-1">
                        Change your password and sign-in settings.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#181b20] p-4">
                      <p className="text-sm text-white font-semibold">Two-Factor Authentication</p>
                      <p className="text-xs text-[#8b94a5] mt-1">
                        Add extra protection to your account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-8 py-5 bg-[#131417] flex justify-end gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="rounded-2xl bg-[#f23f43] px-4 py-3 text-sm font-semibold text-white hover:bg-[#ff465d]"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
