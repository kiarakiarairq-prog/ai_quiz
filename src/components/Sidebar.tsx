import React from "react";
import { Question } from "../types";
import { CheckCircle2, Circle, HelpCircle, Trophy, User } from "lucide-react";

interface SidebarProps {
  quizTitle: string;
  questions: Question[];
  currentIdx: number;
  onSelectIdx: (index: number) => void;
  answers: { [questionId: string]: string };
  username: string;
  score: number;
}

export default function Sidebar({
  quizTitle,
  questions,
  currentIdx,
  onSelectIdx,
  answers,
  username,
  score,
}: SidebarProps) {
  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-100 flex flex-col h-full shrink-0" id="quiz-sidebar">
      {/* Quiz Info Branding Header */}
      <div className="p-6 border-b border-gray-100 bg-purple-50/20">
        <div className="text-[10px] font-mono font-bold tracking-wider text-purple-700 uppercase mb-1">
          Active Live Session
        </div>
        <h2 className="text-xl font-sans font-bold text-gray-900 tracking-tight leading-tight line-clamp-2">
          {quizTitle || "Untitled Session"}
        </h2>
      </div>

      {/* Questions Stack */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
          Question Navigator
        </h3>
        <div className="space-y-2.5" id="navigator-list">
          {questions.map((question, idx) => {
            const isCurrent = idx === currentIdx;
            const isAnswered = answers[question.id] !== undefined;

            let outlineClass = "border-gray-200 bg-white text-gray-700 hover:border-gray-300";
            let statusIcon = <Circle className="w-4 h-4 text-gray-400" />;

            if (isCurrent) {
              outlineClass = "border-[#7B2FF7] ring-4 ring-purple-100/70 text-[#7B2FF7] font-semibold bg-purple-50/20";
              statusIcon = <HelpCircle className="w-4 h-4 text-[#7B2FF7]" />;
            } else if (isAnswered) {
              outlineClass = "border-green-500 bg-green-50/40 text-green-800 font-medium";
              statusIcon = <CheckCircle2 className="w-4 h-4 text-green-600" />;
            }

            return (
              <button
                key={question.id}
                onClick={() => onSelectIdx(idx)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all cursor-pointer ${outlineClass}`}
                id={`nav-item-${idx}`}
              >
                <div className="shrink-0 font-bold font-mono text-xs opacity-75">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 truncate max-w-[150px]" title={question.text}>
                  {question.text}
                </div>
                <div className="shrink-0">{statusIcon}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Status Footer Badge */}
      <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-gray-800 truncate" id="sidebar-username">
              {username}
            </div>
            <div className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">
              Participant
            </div>
          </div>
        </div>
        <div className="bg-purple-600 text-white font-mono font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5" />
          <span>{score} PTS</span>
        </div>
      </div>
    </div>
  );
}
