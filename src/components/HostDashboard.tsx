import React, { useState } from "react";
import { Quiz, Participant } from "../types";
import { Sparkles, Users, Play, Power, RotateCcw, Plus, Info, Check, ShieldAlert, Cpu, Layers } from "lucide-react";

interface HostDashboardProps {
  activeQuiz: Quiz | null;
  participants: Participant[];
  onStartQuiz: () => void;
  onEndQuiz: () => void;
  onResetQuiz: () => void;
  onQuizGenerated: (newQuiz: Quiz) => void;
}

export default function HostDashboard({
  activeQuiz,
  participants,
  onStartQuiz,
  onEndQuiz,
  onResetQuiz,
  onQuizGenerated,
}: HostDashboardProps) {
  // AI Generator state
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>("medium");
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorError, setGeneratorError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setGeneratorError("Please specify a quiz topic.");
      return;
    }

    try {
      setIsGenerating(true);
      setGeneratorError("");
      setSuccessMsg("");

      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, count }),
      });

      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.error || data.details || "Failed to generate questions");
      }

      if (data.quiz) {
        onQuizGenerated(data.quiz);
        setSuccessMsg(`Draft created successfully! Generated ${data.quiz.questions.length} premium questions on "${data.quiz.topic}". Click "Start Quiz Session" below to make it live!`);
        setTopic(""); // clear input
      }
    } catch (err: any) {
      setGeneratorError(err.message || "Something went wrong while compiling the quiz.");
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateUserProgress = (participant: Participant) => {
    if (!activeQuiz) return 0;
    const answered = Object.keys(participant.answers).length;
    return Math.round((answered / activeQuiz.questions.length) * 100);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8" id="host-dashboard">
      
      {/* Active Session Status header banner */}
      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-700">
              Session Controller
            </span>
          </div>
          <h2 className="text-xl font-sans font-bold text-gray-950">
            {activeQuiz ? `Active Topic: "${activeQuiz.topic}"` : "No active session loaded"}
          </h2>
          <div className="text-xs text-gray-500">
            Session status:{" "}
            <span className={`font-mono font-bold uppercase ${
              activeQuiz?.status === "live" ? "text-green-600" : activeQuiz?.status === "ended" ? "text-red-500" : "text-amber-500"
            }`}>
              {activeQuiz?.status || "none"}
            </span>
            {" · "} Difficulty: <span className="font-semibold text-gray-700">{activeQuiz?.difficulty || "N/A"}</span>
          </div>
        </div>

        {/* Control Button Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {activeQuiz?.status === "draft" && (
            <button
              onClick={onStartQuiz}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-green-100 flex items-center gap-2 cursor-pointer"
              id="host-start-btn"
            >
              <Play className="w-4 h-4 fill-white" />
              Start Quiz Session
            </button>
          )}

          {activeQuiz?.status === "live" && (
            <button
              onClick={onEndQuiz}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-red-100 flex items-center gap-2 cursor-pointer"
              id="host-end-btn"
            >
              <Power className="w-4 h-4" />
              End Session & Lock
            </button>
          )}

          <button
            onClick={onResetQuiz}
            className="bg-white border border-gray-300 hover:border-gray-450 text-gray-700 font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            id="host-reset-btn"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Defaults
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: AI Quiz Generator parameters - Grid span-5 */}
        <div className="lg:col-span-5 bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-6" id="ai-generator-module">
          <div className="space-y-1">
            <h3 className="text-lg font-sans font-bold text-gray-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
              AI Quiz Generator
            </h3>
            <p className="text-gray-500 text-xs text-gray-400">
              Command Gemini to compile a customized curriculum with deep assessments.
            </p>
          </div>

          <form onSubmit={handleGenerateQuiz} className="space-y-4">
            
            {/* Topic Input */}
            <div className="space-y-1.5">
              <label htmlFor="quiz-topic" className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-mono">
                Knowledge Topic
              </label>
              <input
                id="quiz-topic"
                type="text"
                placeholder="e.g. Convolutional Neural Networks (CNNs)"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (generatorError) setGeneratorError("");
                }}
                disabled={isGenerating}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm text-gray-800"
                required
              />
            </div>

            {/* Selector Grid */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Difficulty Select */}
              <div className="space-y-1.5">
                <label htmlFor="quiz-difficulty" className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-mono">
                  Difficulty Range
                </label>
                <select
                  id="quiz-difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  disabled={isGenerating}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-700 font-medium"
                >
                  <option value="easy">Elementary (Easy)</option>
                  <option value="medium">Intermediate (Medium)</option>
                  <option value="hard">Advanced (Hard)</option>
                </select>
              </div>

              {/* Number of Questions Select */}
              <div className="space-y-1.5">
                <label htmlFor="quiz-count" className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-mono">
                  Question Count
                </label>
                <select
                  id="quiz-count"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  disabled={isGenerating}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-700 font-medium"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={8}>8 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>

            </div>

            {/* Error Indicator */}
            {generatorError && (
              <div className="bg-red-50 border border-red-150 p-3 rounded-xl flex items-start gap-2.5 text-xs text-red-800" id="generator-error">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <p>{generatorError}</p>
              </div>
            )}

            {/* Success indicator */}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-150 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800" id="generator-success">
                <Check className="w-4.5 h-4.5 shrink-0 text-emerald-600 mt-0.5" />
                <p>{successMsg}</p>
              </div>
            )}

            {/* Generate Button Wrapper */}
            <button
              type="submit"
              id="generate-quiz-btn"
              disabled={isGenerating}
              className="w-full bg-[#7B2FF7] hover:bg-purple-700 text-white font-sans font-semibold text-sm py-3 px-6 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 disabled:bg-purple-300 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating via Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5" />
                  Generate Quiz Using AI
                </>
              )}
            </button>
          </form>

          {/* Guidelines info card footer */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
            <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
              <span className="font-semibold text-gray-700">How it works:</span> Gemini formulates challenging, curricular questions on any requested subject instantly using custom academic schema validation. Old progress is reset automatically.
            </p>
          </div>
        </div>

        {/* Right Column: Live Participants Panel - Grid span-7 */}
        <div className="lg:col-span-7 bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-6" id="participants-panel">
          
          <div className="flex items-center justify-between border-b border-gray-120 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-lg font-sans font-bold text-gray-950 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Live Participant Hub
              </h3>
              <p className="text-gray-500 text-xs">
                Real-time tracking of connected candidates, completed answers, and metrics.
              </p>
            </div>
            <div className="bg-purple-100 text-purple-800 text-[10px] font-mono tracking-wider font-bold px-2.5 py-1 rounded-full shrink-0">
              {participants.length} connected
            </div>
          </div>

          {/* Participant Grid */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1" id="participants-stack">
            {participants.map((p) => {
              const progress = calculateUserProgress(p);
              
              return (
                <div
                  key={p.username}
                  className="bg-white p-4 rounded-xl border border-gray-150 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-150 hover:border-purple-200"
                >
                  {/* Name and Detail column */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm font-semibold text-gray-900">{p.username}</span>
                    </div>
                    <div className="text-[10px] font-mono font-bold text-gray-500 flex items-center gap-1.5 uppercase">
                      <span>{p.timeSpentSec}s elapsed</span>
                      <span>·</span>
                      <span className="text-[#7B2FF7]">{p.score} score</span>
                      <span>·</span>
                      <span className="text-emerald-700">{p.accuracy}% accuracy</span>
                    </div>
                  </div>

                  {/* Progress bar column */}
                  <div className="w-full sm:w-44 text-right space-y-1 shrink-0">
                    <div className="flex justify-between items-center text-[10px] font-bold font-mono text-gray-500">
                      <span>PROGRESS</span>
                      <span className="text-gray-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}

            {participants.length === 0 && (
              <div className="py-12 text-center text-gray-400 font-mono text-sm leading-relaxed" id="empty-participants">
                Lobby is currently empty.<br />
                Invite participants by sharing the active link above! 📬
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
