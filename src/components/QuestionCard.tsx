import React from "react";
import { Question } from "../types";
import CircularTimer from "./CircularTimer";
import { Check, ArrowLeft, ArrowRight, Sparkles, AlertCircle, HelpCircle } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  currentNumber: number;
  totalNumber: number;
  timeLeft: number;
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
  isLocked: boolean;
  onSubmit: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  isSubmitting: boolean;
}

export default function QuestionCard({
  question,
  currentNumber,
  totalNumber,
  timeLeft,
  selectedOption,
  onSelectOption,
  isLocked,
  onSubmit,
  onPrev,
  onNext,
  canPrev,
  canNext,
  isSubmitting,
}: QuestionCardProps) {
  return (
    <div className="space-y-6" id="question-card-wrapper">
      
      {/* Top Question and Timer header */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 relative overflow-hidden">
        {/* Subtle top indicator bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7B2FF7] to-indigo-500"></div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#7B2FF7]">
              Question {currentNumber} of {totalNumber}
            </div>
            <h3 className="text-xl font-sans font-bold text-gray-900 mt-1 leading-snug">
              {question.text}
            </h3>
          </div>
          
          {/* Circular Countdown Timer */}
          {!isLocked && (
            <div className="shrink-0 self-end sm:self-center">
              <CircularTimer timeLeft={timeLeft} duration={30} />
            </div>
          )}
        </div>
      </div>

      {/* Options Selection Menu */}
      <div className="space-y-3.5" id="options-stack">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === option;
          
          // Outer design status classes
          let containerBorder = "border-gray-200 hover:border-purple-300 bg-white hover:bg-purple-50/10";
          let circleColor = "border-gray-300";
          
          if (isSelected) {
            containerBorder = "border-[#7B2FF7] bg-purple-50/20 ring-2 ring-purple-100";
            circleColor = "border-[#7B2FF7] bg-[#7B2FF7]";
          }

          if (isLocked) {
            containerBorder = isSelected
              ? "border-purple-300 bg-purple-50/10 opacity-75"
              : "border-gray-200 bg-gray-50 opacity-60";
            circleColor = isSelected ? "border-purple-400 bg-purple-400" : "border-gray-200 bg-gray-100";
          }

          return (
            <button
              key={index}
              id={`option-${index}`}
              disabled={isLocked}
              onClick={() => onSelectOption(option)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-150 ${
                isLocked ? "cursor-not-allowed" : "cursor-pointer"
              } ${containerBorder}`}
            >
              <div className="flex items-center gap-4">
                {/* Radio Circle */}
                <div
                  className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${circleColor}`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  )}
                </div>
                <span className={`text-sm ${isSelected ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                  {option}
                </span>
              </div>

              {/* Show check icon if selected */}
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[#7B2FF7]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Control Actions / submits */}
      <div className="flex flex-col items-center gap-4 pt-2">
        {/* Submit Answer Button */}
        {!isLocked && (
          <button
            id="submit-answer-btn"
            disabled={!selectedOption || isSubmitting}
            onClick={onSubmit}
            className={`w-full max-w-sm font-sans font-semibold text-base py-3.5 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedOption && !isSubmitting
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-200 scale-[1.01] active:scale-[0.99]"
                : "bg-gray-100 text-gray-400 border border-gray-200 shadow-none cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Locking answer..." : "Submit Answer"}
            <Sparkles className="w-4 h-4" />
          </button>
        )}

        {/* Previous / Next pagination buttons */}
        <div className="flex justify-between items-center w-full max-w-md pt-2">
          <button
            id="prev-btn"
            disabled={!canPrev}
            onClick={onPrev}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium text-sm transition-all focus:outline-none ${
              canPrev
                ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:scale-[0.98] cursor-pointer"
                : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            id="next-btn"
            disabled={!canNext}
            onClick={onNext}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium text-sm transition-all focus:outline-none ${
              canNext
                ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:scale-[0.98] cursor-pointer"
                : "border-gray-150 bg-gray-50 text-gray-300 cursor-not-allowed"
            }`}
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
