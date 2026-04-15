import { useContext } from './context';
import { CategorySelection } from './screens/category-selection';
import { CategorySummary } from './screens/category-summary';
import { GameOver } from './screens/game-over';
import { Paused } from './screens/paused';
import { QuestionRound } from './screens/question-round';
import { Reveal } from './screens/reveal';

export const Router = () => {
  const ctx = useContext();
  const status = ctx.useStatus();
  const error = ctx.useError();

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (status === 'idle') {
    return <p className="text-sm opacity-80">Preparing your quiz room...</p>;
  }

  if (status === 'category-selection') {
    return <CategorySelection />;
  }

  if (status === 'answering') {
    return <QuestionRound />;
  }

  if (status === 'revealing') {
    return <Reveal />;
  }

  if (status === 'category-summary') {
    return <CategorySummary />;
  }

  if (status === 'paused') {
    return <Paused />;
  }

  return <GameOver />;
};
