import { EMPTY, catchError, from, merge, switchMap, tap } from 'rxjs';
import type { Bus } from '../bus';
import type {
  QuizRealtime,
  QuizRepository,
  RealtimeOutboundEvent,
} from '../../integration/contracts';
import type { Store } from '../store';
import { resolveCurrentRound } from '../round';

export const submitAnswer = (
  store: Store,
  bus: Bus,
  deps: { repository: QuizRepository; realtime: QuizRealtime },
) => {
  const submit$ = bus.ofType('[TRIGGER]_SUBMIT_ANSWER').pipe(
    switchMap(({ answer }) => {
      const status = store.$status.get();
      const question = store.$activeQuestion.get();
      const sessionId = store.$sessionId.get();
      const categoryId = store.$activeCategoryId.get();

      if (
        status !== 'answering' ||
        !question ||
        !sessionId ||
        !categoryId ||
        store.$localAnswer.get() !== null
      ) {
        return EMPTY;
      }

      store.$localAnswer.set(answer);
      store.$isRoundLocked.set(true);

      const outbound: RealtimeOutboundEvent = {
        type: 'local-answer-submitted',
        payload: {
          questionId: question.id,
          answer,
          answerType: question.answerType,
          options: question.answerType === 'multiple-choice' ? question.options : undefined,
        },
      };

      return from(
        deps.repository.submitAnswer({
          sessionId,
          categoryId,
          questionId: question.id,
          answer,
        }),
      ).pipe(
        tap(() => {
          deps.realtime.publish(outbound);
          if (store.$partnerAnswer.get() !== null) {
            resolveCurrentRound(store, bus);
          }
        }),
        catchError((error: unknown) => {
          store.$error.set(
            error instanceof Error ? error.message : 'Failed to submit answer.',
          );
          return EMPTY;
        }),
      );
    }),
  );

  const partner$ = bus.ofType('[FACT]_PARTNER_ANSWER_RECEIVED').pipe(
    tap(({ questionId, answer }) => {
      const question = store.$activeQuestion.get();
      if (!question || question.id !== questionId) {
        return;
      }

      store.$partnerAnswer.set(answer);
      if (store.$localAnswer.get() !== null) {
        resolveCurrentRound(store, bus);
      }
    }),
  );

  return merge(submit$, partner$);
};
