import { EMPTY, Observable, catchError, from, switchMap, tap } from 'rxjs';
import type { Bus } from '../bus';
import type { QuizRepository, QuizRealtime } from '../../integration/contracts';
import type { Store } from '../store';

export const init = (
  store: Store,
  bus: Bus,
  deps: { repository: QuizRepository; realtime: QuizRealtime },
) =>
  bus.ofType('[TRIGGER]_INIT').pipe(
    tap(() => {
      store.$isLoading.set(true);
      store.$error.reset();
      store.$status.set('idle');
      store.$isConnected.set(false);
      store.$winnerId.reset();
      store.$lastSummary.reset();
      store.$scoreDeltas.set([]);
    }),
    switchMap(() =>
      from(deps.repository.initSession()).pipe(
        tap((session) => {
          store.$sessionId.set(session.sessionId);
          store.$localPlayerId.set(session.localPlayerId);
          store.$partnerPlayerId.set(session.partnerPlayerId);
          store.$players.set(session.players);
          store.$categories.set(session.categories);
          store.$winScore.set(session.winScore);
          store.$status.set('category-selection');

          bus.emit('[FACT]_SESSION_READY', session);
          bus.emit('[TASK]_CONNECT_REALTIME', { sessionId: session.sessionId });
        }),
        tap({
          finalize: () => store.$isLoading.reset(),
        }),
        catchError((error: unknown) => {
          store.$isLoading.reset();
          store.$error.set(
            error instanceof Error
              ? error.message
              : 'Failed to initialize the quiz session.',
          );
          bus.emit('[EFFECT]_LOG_ERROR', {
            message: 'Failed to initialize quiz session.',
          });

          return EMPTY;
        }),
      ),
    ),
  );

export const connectRealtime = (
  store: Store,
  bus: Bus,
  deps: { realtime: QuizRealtime },
) =>
  bus.ofType('[TASK]_CONNECT_REALTIME').pipe(
    switchMap(({ sessionId }) => {
      deps.realtime.connect(sessionId);
      store.$isConnected.set(true);

      return new Observable<never>((subscriber) => {
        const unsub = deps.realtime.subscribe((event) => {
          if (event.type === 'partner-answer') {
            bus.emit('[FACT]_PARTNER_ANSWER_RECEIVED', event.payload);
          }
        });

        return () => {
          unsub();
          deps.realtime.disconnect();
          store.$isConnected.set(false);
          subscriber.complete();
        };
      });
    }),
  );
