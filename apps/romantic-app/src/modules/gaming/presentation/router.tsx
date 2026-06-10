import { useEffect } from 'react';
import { useContext } from './context';
import { GamePlay } from './game-play/game-play';
import { GameSummary } from './game-summary/game-summary';
import { GamesWall } from './games-wall/games-wall';
import { RoomsWall } from './rooms-wall/rooms-wall';

export const Router = () => {
  const ctx = useContext();
  const activeRoomId = ctx.useActiveRoomId();
  const gameStatus = ctx.useGameStatus();
  const activeGameId = ctx.useActiveGameId();

  useEffect(() => {
    ctx.init();
  }, []);

  if (!activeRoomId) {
    return <RoomsWall />;
  }

  if (gameStatus === 'game_finished' && activeGameId) {
    return <GameSummary />;
  }

  if (gameStatus === 'game_pending') {
    return <GamePlay />;
  }

  return <GamesWall />;
};
