import type { SessionId } from '../domain/models';
import type {
  QuizRealtime,
  RealtimeInboundEvent,
  RealtimeOutboundEvent,
} from './contracts';

const resolvePartnerAnswer = (event: RealtimeOutboundEvent): RealtimeInboundEvent => {
  const hash = event.payload.questionId
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  const shouldMatch = hash % 2 === 0;

  if (shouldMatch) {
    return {
      type: 'partner-answer',
      payload: {
        questionId: event.payload.questionId,
        answer: event.payload.answer,
      },
    };
  }

  if (event.payload.answerType === 'multiple-choice' && event.payload.options) {
    const fallback =
      event.payload.options.find((option) => option.value !== event.payload.answer) ??
      event.payload.options[0];

    return {
      type: 'partner-answer',
      payload: {
        questionId: event.payload.questionId,
        answer: fallback.value,
      },
    };
  }

  if (event.payload.answerType === 'yes-no') {
    return {
      type: 'partner-answer',
      payload: {
        questionId: event.payload.questionId,
        answer: event.payload.answer === true ? false : true,
      },
    };
  }

  if (event.payload.answerType === 'scale') {
    const numeric = typeof event.payload.answer === 'number' ? event.payload.answer : 3;
    const fallback = numeric === 5 ? 4 : 5;

    return {
      type: 'partner-answer',
      payload: {
        questionId: event.payload.questionId,
        answer: fallback,
      },
    };
  }

  return {
    type: 'partner-answer',
    payload: {
      questionId: event.payload.questionId,
      answer: 'Different perspective',
    },
  };
};

export const createMockRealtime = (): QuizRealtime => {
  const listeners = new Set<(event: RealtimeInboundEvent) => void>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  return {
    connect: (_sessionId: SessionId) => undefined,
    disconnect: () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      listeners.clear();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    publish: (event) => {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        const incoming = resolvePartnerAnswer(event);
        listeners.forEach((listener) => listener(incoming));
      }, 1200);
    },
  };
};
