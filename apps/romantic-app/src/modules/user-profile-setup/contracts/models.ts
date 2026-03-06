import { ReactNode } from 'react';

export type Step = number;
export type QuestionId = string;
export type Age = number;
export type Name = string;

type QuestionBase = {
  id: QuestionId;
  category: string;
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
