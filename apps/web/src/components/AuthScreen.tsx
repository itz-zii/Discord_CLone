import React from "react";
import backgroundImage from "./background.png";

type Props = {
  mode: "login" | "register";
  email: string;
  displayName: string;
  username: string;
  password: string;
  birthDate: { month: string; day: string; year: string };
  error: string;
  loading: boolean;
  setMode: (mode: "login" | "register") => void;
  setEmail: (value: string) => void;
  setDisplayName: (value: string) => void;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  setBirthDate: (date: { month: string; day: string; year: string }) => void;
  login: () => void;
  register: () => void;
};

export function AuthScreen({
  mode,
  email,
  displayName,
  username,
  password,
  birthDate,
  error,
  loading,
  setMode,
  setEmail,
  setDisplayName,
  setUsername,
  setPassword,
  setBirthDate,
  login,
  register,
}: Props) {
  const isRegister = mode === "register";
  const [dateError, setDateError] = React.useState("");

  const handleRegister = () => {
    if (!birthDate.month || !birthDate.day || !birthDate.year) {
      setDateError("Date of birth is required");
      return;
    }
    setDateError("");
    register();
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-transparent text-white"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="pointer-events-none absolute inset-0" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full items-center justify-center px-4 py-12">
        <div className="w-full max-w-[980px] overflow-hidden rounded-[32px] bg-[#2f3138]/95 shadow-2xl shadow-black/40">
          <div className={`grid items-stretch gap-0 ${!isRegister ? "xl:grid-cols-[1.35fr_0.85fr]" : ""}`}>
            <div className=" px-1 py-12 sm:px-10 md:px-16">
              {!isRegister ? (
                <div className="max-w-xl mx-auto">
                  <h1 className="text-3xl font-semibold text-center text-white">Welcome back!</h1>
                  <p className="mt-2 text-center text-sm text-[#b9bbbe]">
                    We're so excited to see you again!
                  </p>
                  <div className="mt-10 space-y-5">
                    <div>
                      <label className="text-sm font-semibold text-[#b9bbbe]">
                        Email, Phone Number, or Username <span className="text-[#f04747]">*</span>
                      </label>
                      <input
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-[#2f3138] px-4 py-3 text-sm text-white outline-none transition focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/40"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#b9bbbe]">
                        Password <span className="text-[#f04747]">*</span>
                      </label>
                      <input
                        type="password"
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-[#2f3138] px-4 py-3 text-sm text-white outline-none transition focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/40"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="mt-2 text-sm font-medium text-[#5865f2] hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                    {error ? <p className="text-sm text-[#ff6b6b]">{error}</p> : null}
                    <button
                      disabled={loading}
                      onClick={login}
                      className="mt-4 w-full rounded-full bg-[#5865f2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4752c4] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Please wait..." : "Log In"}
                    </button>
                    <div className="pt-3 text-center text-sm text-[#b9bbbe]">
                      <button
                        type="button"
                        onClick={() => setMode("register")}
                        className="font-medium text-[#5865f2] hover:underline"
                      >
                        Need an account? Register
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-[760px] w-full mx-auto">
                  <h1 className="text-3xl font-semibold text-white">Create an account</h1>
                  <p className="mt-2 text-sm text-[#b9bbbe]">Build your community and start chatting today.</p>
                  <div className="mt-10 space-y-5">
                    <div>
                      <label className="text-sm font-semibold text-[#b9bbbe]">
                        Email <span className="text-[#f04747]">*</span>
                      </label>
                      <input
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-[#2f3138] px-4 py-3 text-sm text-white outline-none transition focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/40"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#b9bbbe]">Display Name</label>
                      <input
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-[#2f3138] px-4 py-3 text-sm text-white outline-none transition focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/40"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#b9bbbe]">
                        Username <span className="text-[#f04747]">*</span>
                      </label>
                      <input
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-[#2f3138] px-4 py-3 text-sm text-white outline-none transition focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/40"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#b9bbbe]">
                        Password <span className="text-[#f04747]">*</span>
                      </label>
                      <input
                        type="password"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-[#2f3138] px-4 py-3 text-sm text-white outline-none transition focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/40"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#b9bbbe]">
                        Date of Birth <span className="text-[#f04747]">*</span>
                      </label>
                      <div className="mt-2 grid grid-cols-3 gap-3">
                        <select
                          className="rounded-2xl border border-white/10 bg-[#2f3138] px-3 py-3 text-sm text-white outline-none transition focus:border-[#5865f2]"
                          value={birthDate.month}
                          onChange={(e) => setBirthDate({ ...birthDate, month: e.target.value })}
                        >
                          <option value="">Month</option>
                          <option value="01">January</option>
                          <option value="02">February</option>
                          <option value="03">March</option>
                          <option value="04">April</option>
                          <option value="05">May</option>
                          <option value="06">June</option>
                          <option value="07">July</option>
                          <option value="08">August</option>
                          <option value="09">September</option>
                          <option value="10">October</option>
                          <option value="11">November</option>
                          <option value="12">December</option>
                        </select>
                        <select
                          className="rounded-2xl border border-white/10 bg-[#2f3138] px-3 py-3 text-sm text-white outline-none transition focus:border-[#5865f2]"
                          value={birthDate.day}
                          onChange={(e) => setBirthDate({ ...birthDate, day: e.target.value })}
                        >
                          <option value="">Day</option>
                          {Array.from({ length: 31 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                        <select
                          className="rounded-2xl border border-white/10 bg-[#2f3138] px-3 py-3 text-sm text-white outline-none transition focus:border-[#5865f2]"
                          value={birthDate.year}
                          onChange={(e) => setBirthDate({ ...birthDate, year: e.target.value })}
                        >
                          <option value="">Year</option>
                          {Array.from({ length: 100 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                              <option key={year} value={String(year)}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                    <label className="flex items-start gap-3">
                      <input type="checkbox" className="mt-1" />
                      <span className="text-xs text-[#8e9297]">
                        (Optional) It's okay to send me emails with Discord updates, tips, and special offers. You can opt out at any time.
                      </span>
                    </label>
                    {error ? <p className="text-sm text-[#ff6b6b]">{error}</p> : null}
                    {dateError ? <p className="text-sm text-[#ff6b6b]">{dateError}</p> : null}
                    <button
                      disabled={loading}
                      onClick={handleRegister}
                      className="mt-6 w-full rounded-full bg-[#5865f2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4752c4] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Creating account..." : "Create Account"}
                    </button>
                    <p className="text-xs text-[#8e9297]">
                      By clicking "Create Account," you agree to Discord's{' '}
                      <a href="#" className="font-medium text-[#5865f2] hover:underline">
                        Terms of Service
                      </a>{' '}
                      and have read the{' '}
                      <a href="#" className="font-medium text-[#5865f2] hover:underline">
                        Privacy Policy
                      </a>
                    </p>
                    <div className="pt-3 text-sm text-[#b9bbbe]">
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="font-medium text-[#5865f2] hover:underline"
                      >
                        Already have an account? Log in
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!isRegister ? (
              <div className="hidden xl:flex items-center justify-center p-10">
                <div className="rounded-[1.5rem] border border-white/10 bg-[#36393f] p-8 text-center">
                  <div className="mx-auto mb-5 h-40 w-40 rounded-[1.5rem] border border-white bg-white" />
                  <h2 className="text-lg font-semibold text-white">Log in with QR Code</h2>
                  <p className="mt-3 text-sm text-[#b9bbbe]">
                    Scan this with the Discord mobile app to log in instantly.
                  </p>
                  <p className="mt-4 font-medium text-[#5865f2] cursor-pointer">Or, sign in with passkey</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
