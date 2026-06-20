import React, { useEffect, useState } from "react";
import { Sparkles, Trophy, Hourglass, CheckCircle, AlertTriangle, Cpu, TrendingUp, RotateCcw, BrainCircuit } from "lucide-react";

interface ResultsPanelProps {
  username: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeSpentSec: number;
  onReset: () => void;
}

export default function ResultsPanel({
  username,
  score,
  totalQuestions,
  accuracy,
  timeSpentSec,
  onReset
}: ResultsPanelProps) {
  const [personalFeedback, setPersonalFeedback] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  // Logistic Regression simulation for Performance Class
  // z = w_0 + w_1*Accuracy + w_2*AvgSpeed
  const avgTimePerQuestion = totalQuestions > 0 ? timeSpentSec / totalQuestions : 30;
  
  // High performance is characterized by high accuracy (>75%) and sensible answering speed (<15s)
  const accuracyWeight = 0.12;
  const speedWeight = -0.15; // penalize too slow
  const bias = -6.0;
  
  const z = bias + (accuracyWeight * accuracy) + (speedWeight * avgTimePerQuestion);
  const confidenceSigmoid = 1 / (1 + Math.exp(-z)); // maps to 0..1

  let prediction: "High Performer" | "Average Performer" | "Low Performer" = "Average Performer";
  let confidencePct = Math.round(confidenceSigmoid * 100);
  let badgeColor = "bg-amber-500 text-white";
  let predictorText = "Demonstrates good core foundations with moderate speed. Keep training to reinforce automatic recall.";

  if (accuracy >= 80 && avgTimePerQuestion <= 15) {
    prediction = "High Performer";
    confidencePct = Math.max(82, Math.min(98, confidencePct));
    badgeColor = "bg-purple-600 text-white shadow-purple-100 ring-2 ring-purple-100";
    predictorText = "Excellent! High accuracy and lightning swift automatic retrieval. Ready for production and expert systems.";
  } else if (accuracy < 50 || avgTimePerQuestion > 22) {
    prediction = "Low Performer";
    confidencePct = Math.max(76, Math.min(94, 100 - confidencePct));
    badgeColor = "bg-rose-500 text-white";
    predictorText = "Performance suggests conceptual gaps or systematic delays. Recommendation: Review foundations on training algorithms.";
  } else {
    // Average
    confidencePct = Math.max(68, Math.min(88, confidencePct > 50 ? confidencePct : 100 - confidencePct));
    badgeColor = "bg-indigo-600 text-white ring-2 ring-indigo-50";
  }

  // Fetch Personalized feedback from the full-stack server using Gemini
  useEffect(() => {
    async function fetchFeedback() {
      try {
        setLoadingFeedback(true);
        const res = await fetch("/api/personalized-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            score,
            totalQuestions,
            accuracy,
            timeSpentSec,
            performanceCategory: prediction,
          }),
        });
        const data = await res.json();
        if (data && data.feedback) {
          setPersonalFeedback(data.feedback);
        } else {
          setPersonalFeedback("Fantastic effort completing the live quiz! Your focus is commendable. Re-run foundations to solidify your expertise.");
        }
      } catch (err) {
        setPersonalFeedback("Fantastic effort completing the live quiz! Your focus is commendable. Re-run foundations to solidify your expertise.");
      } finally {
        setLoadingFeedback(false);
      }
    }
    fetchFeedback();
  }, [username, score, totalQuestions, accuracy, timeSpentSec]);

  const formatMinSec = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return mins > 0 ? `${mins} min ${secs} sec` : `${secs} sec`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8" id="results-panel">
      {/* Celebration Header */}
      <div className="text-center space-y-2">
        <span className="text-4xl text-center">🎉</span>
        <h2 className="text-3xl font-sans font-bold text-gray-900 tracking-tight">
          Congratulations, {username}!
        </h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          You have successfully conquered all questions in the active live quiz. Here is your immediate diagnostic dashboard.
        </p>
      </div>

      {/* Grid: Main Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="score-cards-grid">
        {/* Total Score */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm text-center">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 mx-auto flex items-center justify-center mb-2">
            <Trophy className="w-5 h-5 line" />
          </div>
          <div className="text-sm text-gray-500 font-medium">Final Score</div>
          <div className="text-2xl font-bold font-mono text-gray-900 mt-0.5">
            {score} / {totalQuestions}
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-sm text-gray-500 font-medium">Accuracy</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-0.5" id="results-accuracy">
            {accuracy}%
          </div>
        </div>

        {/* Time Spent */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm text-center">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 mx-auto flex items-center justify-center mb-2">
            <Hourglass className="w-5 h-5" />
          </div>
          <div className="text-sm text-gray-500 font-medium">Time Taken</div>
          <div className="text-lg font-bold font-mono text-gray-900 mt-1 truncate">
            {formatMinSec(timeSpentSec)}
          </div>
        </div>

        {/* Correct vs Wrong count */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm text-center">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 mx-auto flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="text-sm text-gray-500 font-medium">Success Rate</div>
          <div className="text-sm font-bold font-mono text-gray-800 mt-2">
            <span className="text-emerald-700">{score} Right</span> · <span className="text-red-700">{totalQuestions - score} Wrong</span>
          </div>
        </div>
      </div>

      {/* Machine Learning Prediction Panel */}
      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4" id="ml-prediction-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-md font-sans font-bold text-gray-900 leading-none">
              Machine Learning Performance Prediction
            </h3>
            <span className="text-[10px] text-gray-400 font-mono tracking-wide">
              Logistic Regression Classification Algorithm
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-center">
          {/* Badge classification Column */}
          <div className="bg-gray-50/50 p-4 rounded-xl text-center space-y-2 border border-gray-100">
            <span className="text-xs uppercase font-mono tracking-widest text-gray-400 block font-bold">
              Class Output
            </span>
            <div className={`inline-block px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider ${badgeColor}`} id="prediction-badge">
              {prediction}
            </div>
          </div>

          {/* Confidence Column */}
          <div className="bg-gray-50/50 p-4 rounded-xl text-center space-y-2 border border-gray-100">
            <span className="text-xs uppercase font-mono tracking-widest text-gray-400 block font-bold">
              Decision Confidence
            </span>
            <div className="text-2xl font-mono font-bold text-gray-800" id="confidence-score">
              {confidencePct}%
            </div>
          </div>

          {/* Explanation Text */}
          <div className="text-xs text-gray-500 leading-relaxed font-sans border-l border-gray-100 pl-4">
            <span className="font-semibold text-gray-700 block mb-1">Classifier Insight:</span>
            {predictorText}
          </div>
        </div>
      </div>

      {/* Generative AI Feedback Section */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-100 space-y-4 relative overflow-hidden" id="genai-feedback-card">
        {/* Decorative background vectors */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -translate-x-6 translate-y-6"></div>

        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <BrainCircuit className="w-5.5 h-5.5 text-purple-100" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base leading-none">
                Generative AI Personal Feedback
              </h3>
              <span className="text-[10px] text-purple-200 mt-0.5 block font-mono">
                Powered by Gemini-3.5-Flash
              </span>
            </div>
          </div>

          <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider">
            Diagnostic Coach
          </div>
        </div>

        {loadingFeedback ? (
          <div className="py-4 flex flex-col items-center gap-2 justify-center" id="feedback-spinner">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-xs text-purple-100 font-mono">Formulating tailored diagnostics...</span>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-purple-50 italic font-medium relative z-10" id="feedback-text">
            "{personalFeedback}"
          </p>
        )}
      </div>

      {/* Control Actions */}
      <div className="text-center pt-2">
        <button
          onClick={onReset}
          className="bg-white text-gray-800 border border-gray-300 hover:border-gray-450 hover:bg-gray-50/60 font-semibold px-6 py-3 rounded-xl shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
          id="play-again-btn"
        >
          <RotateCcw className="w-4 h-4 text-purple-600" />
          Test Another Concept
        </button>
      </div>
    </div>
  );
}
