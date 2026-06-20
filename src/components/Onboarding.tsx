import React, { useState } from "react";
import { Play, Shield, ArrowRight, Sparkles, LogIn, UserPlus } from "lucide-react";

interface OnboardingProps {
  onJoin: (userData: {
    username: string;
    role: 'player' | 'host';
    answers?: { [qId: string]: string };
    score?: number;
    accuracy?: number;
    timeSpentSec?: number;
  }) => void;
}

export default function Onboarding({ onJoin }: OnboardingProps) {
  // Mode switcher: "login" or "register"
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<'player' | 'host'>("player");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please specify an email address.");
      return;
    }

    if (mode === "register") {
      if (!email.includes("@") || !email.includes(".")) {
        setError("Please specify a valid email address.");
        return;
      }
      if (!username.trim()) {
        setError("Please specify a display nickname.");
        return;
      }
      if (username.length < 3) {
        setError("Display nickname must be at least 3 characters.");
        return;
      }
      if (username.length > 20) {
        setError("Display nickname must be 20 characters or fewer.");
        return;
      }
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = mode === "login" 
        ? { email: email.trim(), password }
        : { email: email.trim(), username: username.trim(), password, role };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Please verify credentials.");
      }

      if (data.success && data.user) {
        onJoin({
          username: data.user.username,
          role: data.user.role,
          answers: data.user.answers || {},
          score: data.user.score || 0,
          accuracy: data.user.accuracy || 0,
          timeSpentSec: data.user.timeSpentSec || 0
        });
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during authorization.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12" id="onboarding-container">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        
        {/* Header Decorator */}
        <div className="bg-gradient-to-r from-[#7B2FF7] to-indigo-700 px-6 py-8 text-center text-white relative">
          <div className="absolute top-3 right-3 animate-pulse bg-white/20 px-2 py-1 rounded-full text-[10px] font-mono tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Powered by Gemini
          </div>
          <h1 className="text-3xl font-sans font-bold tracking-tight mb-2">QuizAI Live</h1>
          <p className="text-purple-100 text-sm">Interactive Live Quizzing & Real-time AI Performance Analytics</p>
        </div>

        {/* Tab Switcher for Login / Register */}
        <div className="flex border-b border-gray-100" id="auth-tab-bar">
          <button
            type="button"
            id="auth-mode-login-tab"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`w-1/2 py-3.5 text-center text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === "login"
                ? "border-b-2 border-[#7B2FF7] text-[#7B2FF7] bg-purple-50/10"
                : "text-gray-400 hover:text-gray-600 bg-white"
            }`}
          >
            <LogIn className="w-4 h-4" />
            Existing Account
          </button>
          
          <button
            type="button"
            id="auth-mode-register-tab"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`w-1/2 py-3.5 text-center text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === "register"
                ? "border-b-2 border-[#7B2FF7] text-[#7B2FF7] bg-purple-50/10"
                : "text-gray-400 hover:text-gray-600 bg-white"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs" id="onboarding-error">
              {error}
            </div>
          )}

          {/* Prompt info for testing defaults */}
          {mode === "login" && (
            <div className="bg-purple-50 text-purple-800 p-3 rounded-xl text-[11px] leading-relaxed border border-purple-100">
              <span className="font-bold">Sandbox Tip:</span> You can sign up a new account, or instantly log in with pre-existing account email <strong>elena@quizai.live</strong> (or tag <strong>Elena_DataSci</strong>) or host <strong>host@quizai.live</strong> (or tag <strong>Host_Pro</strong>) using the password <strong>password123</strong>.
            </div>
          )}

          {/* Email Address Input (Always visible) */}
          <div className="space-y-1.5">
            <label htmlFor="email-input" className="block text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">
              {mode === "login" ? "Email Address or Nickname" : "Email Address"}
            </label>
            <input
              id="email-input"
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder={mode === "login" ? "e.g., elena@quizai.live or Elena_DataSci" : "e.g., student@school.com"}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm text-gray-800"
              required
            />
          </div>

          {/* Display Tag & Username Input (Only visible in Register mode) */}
          {mode === "register" && (
            <div className="space-y-1.5 animate-fade-in">
              <label htmlFor="username-input" className="block text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">
                Display Nickname (Leaderboard Name)
              </label>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g., Ada_Lovelace"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm text-gray-800"
                maxLength={20}
                required
              />
            </div>
          )}

          {/* Password Input */}
          <div className="space-y-1.5">
            <label htmlFor="password-input" className="block text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">
              Password
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm text-gray-800"
              minLength={4}
              required
            />
          </div>

          {/* Role Selection Tabs (Only shown if creating account) */}
          {mode === "register" && (
            <div className="space-y-2 pt-1 animate-fade-in">
              <span className="block text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">Choose Account Role</span>
              <div className="grid grid-cols-2 gap-3">
                {/* Participant Tab */}
                <button
                  type="button"
                  id="role-player-btn"
                  onClick={() => setRole("player")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    role === "player"
                      ? "border-[#7B2FF7] bg-purple-50/40 text-[#7B2FF7]"
                      : "border-gray-200 hover:border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  <Play className={`w-5 h-5 mb-1.5 ${role === "player" ? "text-[#7B2FF7]" : "text-gray-400"}`} />
                  <span className="font-semibold text-xs">Participant</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">Compete & Solve</span>
                </button>

                {/* Host Tab */}
                <button
                  type="button"
                  id="role-host-btn"
                  onClick={() => setRole("host")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    role === "host"
                      ? "border-[#7B2FF7] bg-purple-50/40 text-[#7B2FF7]"
                      : "border-gray-200 hover:border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  <Shield className={`w-5 h-5 mb-1.5 ${role === "host" ? "text-[#7B2FF7]" : "text-gray-400"}`} />
                  <span className="font-semibold text-xs">Session Host</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">Build & Control</span>
                </button>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            id="join-submit-btn"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Validating Account...
              </>
            ) : mode === "login" ? (
              <>
                Sign In & Enter Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Register New Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Accent */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <span>Active Quiz Lobby</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> App Channel Online
          </span>
        </div>
      </div>
    </div>
  );
}
