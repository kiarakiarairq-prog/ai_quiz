import React from "react";
import { Timer } from "lucide-react";

interface CircularTimerProps {
  timeLeft: number;
  duration: number;
}

export default function CircularTimer({ timeLeft, duration }: CircularTimerProps) {
  const percent = timeLeft / duration;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - percent * circumference;

  // Color selection based on seconds remaining
  let colorClass = "stroke-green-500 text-green-600";
  let bgClass = "bg-green-50 text-green-700";

  if (timeLeft <= 5) {
    colorClass = "stroke-red-500 text-red-600 animate-pulse";
    bgClass = "bg-red-50 text-red-700";
  } else if (timeLeft <= 12) {
    colorClass = "stroke-amber-500 text-amber-600";
    bgClass = "bg-amber-50 text-amber-700";
  }

  const formatTime = (sec: number) => {
    const s = Math.max(0, Math.floor(sec));
    return `00:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm" id="circular-timer-container">
      {/* Icon feedback */}
      <div className={`p-2 rounded-xl ${bgClass} transition-colors duration-300`}>
        <Timer className="w-5 h-5" />
      </div>

      {/* SVG Circular Canvas */}
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            className="stroke-gray-100 fill-none"
            strokeWidth="3.5"
          />
          {/* Foreground animated indicator */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            className={`fill-none transition-all duration-1000 ease-linear ${colorClass}`}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Absolute duration overlay text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-mono font-bold text-gray-400">
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Numerical display */}
      <div className="text-right pr-1">
        <div className="text-[10px] uppercase tracking-wider font-mono font-bold text-gray-400">
          Remaining
        </div>
        <div className="text-sm font-mono font-bold text-gray-800" id="timer-text">
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
}
