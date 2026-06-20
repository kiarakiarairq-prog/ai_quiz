import React, { useState, useEffect, useRef } from "react";
import { Quiz, Participant, Question } from "./types";
import Onboarding from "./components/Onboarding";
import Sidebar from "./components/Sidebar";
import QuestionCard from "./components/QuestionCard";
import AIFeedback from "./components/AIFeedback";
import ResultsPanel from "./components/ResultsPanel";
import Leaderboard from "./components/Leaderboard";
import HostDashboard from "./components/HostDashboard";
import { Sparkles, Trophy, Users, Shield, Cpu, RefreshCw, LogOut, Award, Layers } from "lucide-react";

export default function App() {
  // Authentication / Role Onboarding
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<'player' | 'host' | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Back-end state synchronized from server
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [pollingError, setPollingError] = useState("");

  // Navigation tabs in main area
  const [activeTab, setActiveTab] = useState<"quiz" | "host" | "leaderboard">("quiz");

  // Player Quiz Execution Parameters
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Feedback details for current finished question
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
  } | null>(null);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Player answers local store
  const [playerAnswers, setPlayerAnswers] = useState<{ [qId: string]: string }>({});
  const [playerScore, setPlayerScore] = useState(0);
  const [playerAccuracy, setPlayerAccuracy] = useState(0);
  const [playerTimeSpent, setPlayerTimeSpent] = useState(0);

  // --- Background synchronization loop ---
  useEffect(() => {
    async function syncState() {
      try {
        const res = await fetch("/api/quiz/active");
        if (!res.ok) throw new Error("Sync failure");
        const data = await res.json();
        
        if (data.activeQuiz) {
          setActiveQuiz(data.activeQuiz);
        }
        if (data.participants) {
          setParticipants(data.participants);
        }
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
        setPollingError("");
      } catch (err) {
        setPollingError("Temporary connectivity delay. Re-synchronizing...");
      }
    }

    // Initial sync
    syncState();

    // Backdrop interval: every 3.5 seconds
    const interval = setInterval(syncState, 3500);
    return () => clearInterval(interval);
  }, []);

  // --- Circular Countdown Timer Effect ---
  useEffect(() => {
    const isPlaying = username && role === "player" && activeQuiz?.status === "live" && !isLocked;
    
    if (isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            // Timeout! Auto-submit
            handleAutoTimeout();
            return 30;
          }
          // Increment player direct time spent
          setPlayerTimeSpent((t) => t + 1);
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [username, role, activeQuiz, currentIdx, isLocked]);

  // Adjust timers / resets on moving questions
  useEffect(() => {
    if (!activeQuiz) return;
    const currentQuestion = activeQuiz.questions[currentIdx];
    if (!currentQuestion) return;

    // Check if player has already submitted/answered this question in their local store
    const existingAns = playerAnswers[currentQuestion.id];
    if (existingAns !== undefined) {
      setSelectedOption(existingAns);
      setIsLocked(true);
      
      // Compute correctness for explanation restore
      const isCorrect = existingAns === currentQuestion.correctAnswer;
      setFeedback({
        isCorrect,
        correctAnswer: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation,
      });
    } else {
      setSelectedOption(null);
      setIsLocked(false);
      setFeedback(null);
      setTimeLeft(30); // reset 30s stopwatch
    }
  }, [currentIdx, activeQuiz, playerAnswers]);

  // Handle joining game after login or registration success
  const handleJoin = (userData: {
    username: string;
    role: 'player' | 'host';
    answers?: { [qId: string]: string };
    score?: number;
    accuracy?: number;
    timeSpentSec?: number;
  }) => {
    setUsername(userData.username);
    setRole(userData.role);
    
    // Re-align default tab depending on role
    if (userData.role === "host") {
      setActiveTab("host");
    } else {
      setActiveTab("quiz");
      
      // Restore progress if the participant is returning
      setPlayerAnswers(userData.answers || {});
      setPlayerScore(userData.score || 0);
      setPlayerAccuracy(userData.accuracy || 0);
      setPlayerTimeSpent(userData.timeSpentSec || 0);
    }
  };

  // Auto-submit choice on countdown expired
  const handleAutoTimeout = () => {
    const defaultOption = selectedOption || "Unanswered (Time limit expired)";
    handleAnswerSubmit(defaultOption, true);
  };

  // Submit Answer handler
  const handleAnswerSubmit = async (chosenOption: string, isTimeout = false) => {
    if (!activeQuiz || isLocked) return;
    const question = activeQuiz.questions[currentIdx];
    if (!question) return;

    try {
      setIsSubmitting(true);
      const timeElapsedForQuestion = 30 - timeLeft;

      // Submit answer to backend API to evaluate score
      const res = await fetch("/api/quiz/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          questionId: question.id,
          answer: chosenOption,
          timeSpentSec: timeElapsedForQuestion,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Update local memory
        const nextAnswers = { ...playerAnswers, [question.id]: chosenOption };
        setPlayerAnswers(nextAnswers);
        setPlayerScore(data.currentScore);
        setPlayerAccuracy(data.accuracy);
        setIsLocked(true);

        setFeedback({
          isCorrect: data.isCorrect,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation,
        });

        // Trigger brief sync update of participants list
        const syncRes = await fetch("/api/quiz/active");
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          setParticipants(syncData.participants);
          setLeaderboard(syncData.leaderboard);
        }
      }
    } catch (err) {
      console.error("Submit Answer error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Onboarding exit
  const handleLogout = () => {
    setUsername("");
    setRole(null);
    setPlayerAnswers({});
    setPlayerScore(0);
    setPlayerAccuracy(0);
    setPlayerTimeSpent(0);
    setCurrentIdx(0);
  };

  // --- Host Control callbacks ---
  const handleStartSession = async () => {
    try {
      const res = await fetch("/api/quiz/start", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.activeQuiz) {
        setActiveQuiz(data.activeQuiz);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEndSession = async () => {
    try {
      const res = await fetch("/api/quiz/end", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.activeQuiz) {
        setActiveQuiz(data.activeQuiz);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetSession = async () => {
    try {
      const res = await fetch("/api/quiz/reset", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.activeQuiz) {
        setActiveQuiz(data.activeQuiz);
        setParticipants(data.participants);
        setLeaderboard(data.leaderboard);
        setPlayerAnswers({});
        setPlayerScore(0);
        setPlayerAccuracy(0);
        setPlayerTimeSpent(0);
        setCurrentIdx(0);
        setFeedback(null);
        setSelectedOption(null);
        setIsLocked(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuizGenerated = (newQuiz: Quiz) => {
    setActiveQuiz(newQuiz);
    // Reset local player counters on new quiz deployment
    setPlayerAnswers({});
    setPlayerScore(0);
    setPlayerAccuracy(0);
    setPlayerTimeSpent(0);
    setCurrentIdx(0);
    setFeedback(null);
    setSelectedOption(null);
    setIsLocked(false);
  };

  // --- Render Gates ---
  if (!username || !role) {
    return <Onboarding onJoin={handleJoin} />;
  }

  // Calculate if player completed all questions
  const totalQuestionsList = activeQuiz?.questions || [];
  const totalQuestionsCount = totalQuestionsList.length;
  const answeredCountLocal = Object.keys(playerAnswers).length;
  const isFullCompleted = totalQuestionsCount > 0 && answeredCountLocal === totalQuestionsCount;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900" id="main-frame">
      
      {/* Sticky Topmost Header Bar */}
      <header className="bg-white border-b border-gray-150 sticky top-0 z-40 shadow-xs px-6 py-4 flex justify-between items-center" id="navbar">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-100">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-sans font-extrabold tracking-tight text-gray-950">
              QuizAI Live
            </h1>
            <span className="text-[10px] text-gray-400 font-mono block leading-none">
              v1.0 · GEMINI-3.5-FLASH
            </span>
          </div>
        </div>

        {/* Global tabs list matches role */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          {role === "player" && (
            <button
              id="tab-quiz"
              onClick={() => setActiveTab("quiz")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "quiz" ? "bg-white text-purple-700 shadow-xs" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Active Quiz
            </button>
          )}

          {role === "host" && (
            <button
              id="host-tab-quiz"
              onClick={() => setActiveTab("host")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "host" ? "bg-white text-purple-700 shadow-xs" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Host Dashboard
            </button>
          )}

          <button
            id="tab-leaderboard"
            onClick={() => setActiveTab("leaderboard")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "leaderboard" ? "bg-white text-purple-700 shadow-xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Leaderboard
          </button>
        </div>

        {/* Exit Control */}
        <div className="flex items-center gap-3">
          {role === "host" && (
            <span className="bg-purple-100 text-purple-800 font-mono font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Host Mode</span>
            </span>
          )}
          
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-all cursor-pointer border border-gray-200"
            title="Leave Session"
            id="logout-btn"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Network Alert notifications */}
      {pollingError && (
        <div className="bg-amber-500 text-white py-2 px-4 text-center text-xs font-mono font-bold flex items-center justify-center gap-2" id="syncing-alert">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>{pollingError}</span>
        </div>
      )}

      {/* Main viewport Container grids */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6" id="view-port">
        
        {/* VIEW 1: Leaderboard Table tab */}
        {activeTab === "leaderboard" && (
          <Leaderboard entries={leaderboard} currentUser={username} />
        )}

        {/* VIEW 2: Host dashboard custom content */}
        {activeTab === "host" && (
          <HostDashboard
            activeQuiz={activeQuiz}
            participants={participants}
            onStartQuiz={handleStartSession}
            onEndQuiz={handleEndSession}
            onResetQuiz={handleResetSession}
            onQuizGenerated={handleQuizGenerated}
          />
        )}

        {/* VIEW 3: Main Active quiz session flow */}
        {activeTab === "quiz" && role === "player" && (
          <>
            {/* Case A: Quiz is ended / not started draft */}
            {activeQuiz?.status === "draft" && (
              <div className="bg-white border border-gray-150 rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm" id="draft-gate-card">
                <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2">
                  <Cpu className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-sans font-bold text-gray-900 tracking-tight">
                  Awaiting Host Authorization
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  The host has compiled a draft quiz about <span className="font-semibold text-[#7B2FF7]">"{activeQuiz.topic}"</span>. Please stand by while they initiate the active countdown timer.
                </p>
                <div className="inline-flex items-center gap-2 bg-purple-50 text-[#7B2FF7] font-mono text-xs font-bold px-4 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
                  Connected and Synced
                </div>
              </div>
            )}

            {activeQuiz?.status === "ended" && !isFullCompleted && (
              <div className="bg-white border border-gray-150 rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm" id="ended-gate-card">
                <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-sans font-bold text-gray-900 tracking-tight animate-bounce">
                  Session Closed by Host
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  This active live assessment has been shut down by the moderator. You can review scores in the Leaderboard tab.
                </p>
              </div>
            )}

            {/* Case B: Player completed the quiz -> Results Analysis View */}
            {isFullCompleted && (
              <ResultsPanel
                username={username}
                score={playerScore}
                totalQuestions={totalQuestionsCount}
                accuracy={playerAccuracy}
                timeSpentSec={playerTimeSpent}
                onReset={handleResetSession}
              />
            )}

            {/* Case C: Live, actively running quiz session */}
            {activeQuiz?.status === "live" && !isFullCompleted && totalQuestionsCount > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start" id="active-quiz-grid">
                
                {/* Left Sidebar QUESTION NAVIGATOR - Width 25% (span-3) */}
                <div className="md:col-span-4 lg:col-span-3 bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden h-fit md:sticky md:top-24">
                  <Sidebar
                    quizTitle={activeQuiz.topic}
                    questions={activeQuiz.questions}
                    currentIdx={currentIdx}
                    onSelectIdx={(idx) => setCurrentIdx(idx)}
                    answers={playerAnswers}
                    username={username}
                    score={playerScore}
                  />
                </div>

                {/* Right Area QUESTION CONTENT - Width 75% (span-9) */}
                <div className="md:col-span-8 lg:col-span-9 space-y-6">
                  
                  {/* Dynamic Progress indicator card */}
                  <div className="bg-white border border-gray-150 p-4 rounded-2xl shadow-sm" id="mini-progress-bar">
                    <div className="flex justify-between items-center text-xs font-bold font-mono text-gray-500 mb-2">
                      <span className="uppercase tracking-wider text-xs">overall completion progress</span>
                      <span className="text-[#7B2FF7]">{answeredCountLocal} OF {totalQuestionsCount} COMPLETED</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-300 animate-pulse"
                        style={{ width: `${(answeredCountLocal / totalQuestionsCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Core Question options card */}
                  <QuestionCard
                    question={activeQuiz.questions[currentIdx]}
                    currentNumber={currentIdx + 1}
                    totalNumber={totalQuestionsCount}
                    timeLeft={timeLeft}
                    selectedOption={selectedOption}
                    onSelectOption={(opt) => setSelectedOption(opt)}
                    isLocked={isLocked}
                    onSubmit={() => selectedOption && handleAnswerSubmit(selectedOption)}
                    onPrev={() => currentIdx > 0 && setCurrentIdx((i) => i - 1)}
                    onNext={() => currentIdx < totalQuestionsCount - 1 && setCurrentIdx((i) => i + 1)}
                    canPrev={currentIdx > 0}
                    canNext={currentIdx < totalQuestionsCount - 1}
                    isSubmitting={isSubmitting}
                  />

                  {/* Dynamic Interactive AI Feedback segment */}
                  {isLocked && feedback && (
                    <AIFeedback
                      isCorrect={feedback.isCorrect}
                      correctAnswer={feedback.correctAnswer}
                      userAnswer={playerAnswers[activeQuiz.questions[currentIdx].id] || ""}
                      explanation={feedback.explanation}
                      isLoading={isSubmitting}
                    />
                  )}
                </div>

              </div>
            )}
          </>
        )}
      </main>

      {/* Humble Footer */}
      <footer className="bg-white border-t border-gray-150 text-center py-4 text-xs text-gray-400 font-mono mt-auto shrink-0 uppercase tracking-widest" id="app-footer">
        © 2026 QuizAI Live · Real-time Academic Learning Sandbox
      </footer>
    </div>
  );
}
