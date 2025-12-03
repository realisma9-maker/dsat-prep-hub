export type QuestionType = 'mcq' | 'free-response';

export interface Question {
  id: number;
  question: string;
  type: QuestionType;
  options?: string[];
  answer: string;
  explanation: string;
  topic: string;
  referenceImage?: string;
  markedForReview?: boolean;
}

export interface TopicData {
  id: string;
  name: string;
  icon: string;
  color: string;
  questionCount: number;
  dataFile: string;
}

export interface UserProgress {
  topic: string;
  currentIndex: number;
  answers: Record<number, string>;
  markedForReview: number[];
  timeSpent: Record<number, number>;
}
