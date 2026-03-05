import { ReactNode } from 'react';

export type Step = number;
export type QuestionId = string;

type QuestionBase = {
  id: QuestionId;
  content: string;
};

export type TextQuestion = QuestionBase & {
  type: 'text';
  min: number;
  max: number;
};

export type NumberQuestion = QuestionBase & {
  type: 'number';
  min: number;
  max: number;
};

export type Question = TextQuestion | NumberQuestion;

export type StepsAsComponents = Record<Step, ReactNode>;
