import { CategorySelection } from './category-selection';
import { CategorySummary } from './category-summary';
import { QuestionView } from './question-view';
import { ResultsReveal } from './results-reveal';
import { SessionPaused } from './session-paused';
import { WaitingForPartner } from './waiting-for-partner';
import { WinCelebration } from './win-celebration';
import { useContext } from './context';

export const Router = () => {
  const ctx = useContext();
  const phase = ctx.$phase.use();
  const isLoading = ctx.$isLoadingQuestions.use();

  if (phase === 'session_paused') return <SessionPaused />;
  if (phase === 'win_celebration') return <WinCelebration />;
  if (phase === 'category_summary') return <CategorySummary />;
  if (phase === 'results_reveal') return <ResultsReveal />;
  if (phase === 'waiting_for_partner') return <WaitingForPartner />;
  if (phase === 'answering') return <QuestionView />;
  if (phase === 'question_loading' || isLoading)
    return <QuestionView loading />;
  return <CategorySelection />;
};
