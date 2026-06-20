export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];
  status: 'draft' | 'live' | 'ended';
}

export interface Participant {
  username: string;
  role: 'host' | 'player';
  score: number;
  timeSpentSec: number;
  answers: { [questionId: string]: string };
  completed: boolean;
  accuracy: number;
  joinedAt: string;
}

export interface QuizState {
  activeQuiz: Quiz | null;
  participants: Participant[];
  leaderboard: {
    username: string;
    score: number;
    accuracy: number;
    timeSpentSec: number;
  }[];
}
