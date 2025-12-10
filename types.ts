export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  emoji: string;
  explanation?: string;
  difficulty: Difficulty;
}

export interface UserAnswer {
  question: Question;
  selectedOption: number;
  isCorrect: boolean;
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  showResults: boolean;
  isAnswered: boolean;
  selectedOption: number | null;
  isCorrect: boolean | null;
  difficulty: Difficulty;
}

export enum GameStage {
  START,
  DIFFICULTY_SELECT,
  PLAYING,
  FINISHED,
  REVIEW
}