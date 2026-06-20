import React from "react";
import { Trophy, Medal, Clock, Layers, Award, UserCheck } from "lucide-react";

interface LeaderboardEntry {
  username: string;
  score: number;
  accuracy: number;
  timeSpentSec: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUser: string;
}

export default function Leaderboard({ entries, currentUser }: LeaderboardProps) {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-amber-200">
            <Trophy className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Gold</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center gap-1.5 bg-slate-50 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-slate-200">
            <Medal className="w-3.5 h-3.5 fill-slate-400 text-slate-400" />
            <span>Silver</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center gap-1.5 bg-orange-50/70 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-orange-200">
            <Medal className="w-3.5 h-3.5 fill-orange-600 text-orange-600" />
            <span>Bronze</span>
          </div>
        );
      default:
        return <span className="text-gray-500 font-mono font-bold text-sm">#{rank}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="leaderboard-panel">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-sans font-bold text-gray-950 tracking-tight flex items-center gap-2">
            🏆 Arena High Scores
          </h2>
          <p className="text-gray-500 text-xs mt-0.5">
            Real-time rankings sorted by Correct Answers, then by completion speed.
          </p>
        </div>
        <div className="bg-purple-50 text-purple-700 font-sans text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
          <Award className="w-4 h-4" />
          <span>Active Session</span>
        </div>
      </div>

      {/* Podium spotlight widgets */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2" id="leaderboard-podium">
          {/* Rank 2 */}
          {entries[1] && (
            <div className="bg-white border border-gray-150 p-5 rounded-2xl flex flex-col items-center text-center relative order-2 md:order-1">
              <div className="absolute top-3 left-3">{getBadge(2)}</div>
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-lg font-bold mb-3 font-mono mt-2">
                2
              </div>
              <div className="font-sans font-bold text-gray-800 line-clamp-1">
                {entries[1].username}
              </div>
              <div className="text-sm font-mono text-gray-500 mt-1">
                {entries[1].score} pts · {entries[1].accuracy}% acc
              </div>
            </div>
          )}

          {/* Rank 1 */}
          {entries[0] && (
            <div className="bg-gradient-to-b from-amber-50/50 to-white border-2 border-amber-300 p-6 rounded-2xl flex flex-col items-center text-center relative order-1 md:order-2 scale-102 shadow-md">
              <div className="absolute top-3 left-3">{getBadge(1)}</div>
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-xl font-bold mb-3 font-mono mt-2 ring-4 ring-amber-50">
                1
              </div>
              <div className="font-sans font-bold text-gray-950 text-md truncate max-w-full">
                {entries[0].username}
              </div>
              <div className="text-sm font-mono text-amber-850 font-bold mt-1">
                {entries[0].score} pts · {entries[0].accuracy}% acc
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {entries[2] && (
            <div className="bg-white border border-gray-150 p-5 rounded-2xl flex flex-col items-center text-center relative order-3">
              <div className="absolute top-3 left-3">{getBadge(3)}</div>
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-700 text-lg font-bold mb-3 font-mono mt-2">
                3
              </div>
              <div className="font-sans font-bold text-gray-800 line-clamp-1">
                {entries[2].username}
              </div>
              <div className="text-sm font-mono text-gray-500 mt-1">
                {entries[2].score} pts · {entries[2].accuracy}% acc
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main rankings table */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden" id="leaderboard-table-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left border-b border-gray-100">
                <th className="py-4 px-6 text-xs uppercase tracking-wider font-mono text-gray-500 font-bold">Rank</th>
                <th className="py-4 px-6 text-xs uppercase tracking-wider font-mono text-gray-500 font-bold">Participant</th>
                <th className="py-4 px-6 text-xs uppercase tracking-wider font-mono text-gray-500 font-bold text-center">Score</th>
                <th className="py-4 px-6 text-xs uppercase tracking-wider font-mono text-gray-500 font-bold text-center">Accuracy</th>
                <th className="py-4 px-6 text-xs uppercase tracking-wider font-mono text-gray-500 font-bold text-center">Time Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry, index) => {
                const isMe = entry.username.toLowerCase() === currentUser.toLowerCase();
                const rank = index + 1;

                return (
                  <tr
                    key={entry.username}
                    className={`transition-colors ${
                      isMe ? "bg-purple-50/40 text-purple-950 font-medium" : "hover:bg-gray-50"
                    }`}
                    id={`row-${index}`}
                  >
                    {/* Rank */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getBadge(rank)}
                    </td>

                    {/* Participant name */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-bold">{entry.username}</span>
                        {isMe && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wide flex items-center gap-0.5">
                            <UserCheck className="w-2.5 h-2.5" /> Me
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-4 px-6 whitespace-nowrap text-center font-mono font-bold text-sm">
                      {entry.score} pts
                    </td>

                    {/* Accuracy bar */}
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden shrink-0 hidden sm:block">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${entry.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="font-mono font-bold text-sm text-gray-800">
                          {entry.accuracy}%
                        </span>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="py-4 px-6 whitespace-nowrap text-center font-mono text-xs text-gray-500 font-bold">
                      {formatTime(entry.timeSpentSec)}
                    </td>
                  </tr>
                );
              })}

              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 font-mono text-sm leading-relaxed">
                    No participants have completed the quiz yet.<br />
                    Be the first to finish and claim the gold crown! 👑
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
