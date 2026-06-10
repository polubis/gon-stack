import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';
import type { WsServerMessage } from '../../integration/ws-contracts';

export const wsConnect = (store: Store, bus: Bus, repository: IRepository) =>
  bus.ofType('[TRIGGER]_JOIN_GAME_SUCCESS').pipe(
    tap(({ gameId }) => {
      store.$ws.get()?.close();

      // Real impl: retrieve token from Supabase session
      const token = '';

      const ws = repository.connectGamePlay(gameId, token);
      store.$ws.set(ws);

      ws.onmessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data as string) as WsServerMessage;

        switch (message.event) {
          case 'question_start': {
            bus.trigger('[TRIGGER]_WS_QUESTION_STARTED', message.data);
            break;
          }
          case 'timer_tick': {
            bus.trigger('[TRIGGER]_WS_TIMER_TICKED', message.data);
            break;
          }
          case 'score_update': {
            bus.trigger('[TRIGGER]_WS_SCORES_UPDATED', message.data);
            break;
          }
          case 'game_state_change': {
            const current = store.$gamePlayState.get();
            const fullState = {
              ...(current ?? { gameId, activeQuestion: null, scores: [] }),
              status: message.data.status,
            };
            bus.trigger('[TRIGGER]_WS_GAME_STATE_CHANGED', fullState);
            break;
          }
          case 'game_end': {
            bus.trigger('[TRIGGER]_WS_GAME_ENDED', message.data);
            break;
          }
        }
      };

      store.$gamePlayState.set({
        gameId,
        status: 'game_pending',
        activeQuestion: null,
        scores: [],
      });
    }),
  );
