export interface Question {
  id: number;
  text: string;
  points: number;
}

export interface Answer {
  id: number;
  question_id: number;
  text: string;
  is_correct: boolean;
}

export interface User {
  id: number;
  name: string;
  score: number;
}

export interface QuestionWithAnswers extends Question {
  answers: Answer[];
}

export interface QuizSubmission {
  name: string;
  answers: Array<{
    questionId: number;
    answerId: number;
  }>;
}

export interface QuizResult {
  gained: number;
  user: User;
}

export interface ErrorResponse {
  error: string;
}