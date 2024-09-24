// src/types/Quiz.ts
export interface Quiz {
  id: string;
  title: string;
  image: string;
  questionsCount: number;
  grade: string;
}

export interface QuizCategory {
  name: string;
  image: string;
}
export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: string;
}

