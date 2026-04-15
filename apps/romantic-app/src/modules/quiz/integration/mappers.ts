import type { NextQuestionResponse } from './contracts';

export const toNextQuestion = (response: NextQuestionResponse) => response.question;
