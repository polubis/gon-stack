import type {
  ActiveQuestion,
  Answer,
  GameSummary,
  PlayerScore,
} from '../domain/models';

export type WsServerMessage =
  | { event: 'question_start'; data: ActiveQuestion }
  | { event: 'timer_tick'; data: { questionId: string; remaining: number } }
  | { event: 'score_update'; data: { scores: PlayerScore[] } }
  | {
      event: 'game_state_change';
      data: { status: 'game_pending' | 'game_finished' };
    }
  | { event: 'game_end'; data: GameSummary };

export type WsClientMessage = {
  type: 'submit_answer';
  questionId: string;
  answer: Answer;
};
