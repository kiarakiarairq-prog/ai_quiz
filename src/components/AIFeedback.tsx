import React from "react";
import { Sparkles, CheckCircle2, XCircle, Info, BrainCircuit } from "lucide-react";

interface AIFeedbackProps {
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
  explanation: string;
  isLoading: boolean;
}

export default function AIFeedback({
  isCorrect,
  correctAnswer,
  userAnswer,
  explanation,
  isLoading,
}: AIFeedbackProps) {
  if (isLoading) {
    return (
      <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-6 animate-pulse space-y-4" id="ai-feedback-loading">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-200 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-purple-600" />
          </div>
          <div className="h-4 bg-purple-200 rounded w-1/3"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-purple-200 rounded w-full"></div>
          <div className="h-3 bg-purple-200 rounded w-5/6"></div>
          <div className="h-3 bg-purple-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border rounded-2xl p-6 shadow-sm overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100 ${
        isCorrect
          ? "bg-emerald-50/50 border-emerald-100 text-emerald-950"
          : "bg-purple-50/40 border-purple-150 text-purple-950"
      }`}
      id="ai-feedback-panel"
    >
      {/* Title block */}
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
              isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-5.5 h-5.5 stroke-[2.5]" />
            ) : (
              <BrainCircuit className="w-5.5 h-5.5" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#7B2FF7] uppercase">
              AI Powered Feedback
            </span>
            <h4 className="text-base font-sans font-bold leading-none mt-1">
              {isCorrect ? "Correct! Brilliant work." : "Incorrect Choice"}
            </h4>
          </div>
        </div>

        {/* AI Branding badge */}
        <div className="bg-purple-600 text-white font-sans text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 shadow-sm shadow-purple-200">
          <Sparkles className="w-3 h-3" />
          <span>Gemini AI</span>
        </div>
      </div>

      {/* Answer comparison list */}
      <div className="space-y-2.5 mb-4 border-b border-dashed border-gray-200/65 pb-4">
        {!isCorrect && (
          <div className="text-sm">
            <span className="font-semibold text-red-700 font-sans block mb-1">Your Answer:</span>
            <div className="bg-red-50 border border-red-100 px-3.5 py-2.5 rounded-xl font-medium inline-block text-red-800 text-xs">
              {userAnswer}
            </div>
          </div>
        )}
        <div className="text-sm">
          <span className="font-semibold text-emerald-800 font-sans block mb-1">
            {isCorrect ? "Submitted Answer:" : "Correct Solution:"}
          </span>
          <div className="bg-emerald-50 border border-emerald-100 px-3.5 py-2.5 rounded-xl font-medium inline-block text-emerald-800 text-xs shadow-sm">
            {correctAnswer}
          </div>
        </div>
      </div>

      {/* Explanation text */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase font-mono tracking-wider text-gray-500">
          <Info className="w-3.5 h-3.5" />
          <span>Detailed Explanation</span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed font-sans">{explanation}</p>
      </div>
    </div>
  );
}
