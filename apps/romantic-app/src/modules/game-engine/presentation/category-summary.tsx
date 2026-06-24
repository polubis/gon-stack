import { Button } from '@/libs/ui/button';
import { Card } from '@/libs/ui/card';
import { Heading } from '@/libs/ui/heading';
import { ProgressIndicator } from '@/libs/ui/progress-indicator';
import { useContext } from './context';

export const CategorySummary = () => {
  const ctx = useContext();
  const stats = ctx.$categoryStats.use();
  const category = ctx.$selectedCategory.use();

  if (!stats || !category) return null;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="variant-pill">CATEGORY COMPLETE</div>
        <Heading level={4}>{category.label}</Heading>
        <p className="b1">
          You explored {stats.answered} of {stats.totalQuestions} questions
          together.
        </p>
      </header>

      <Card className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <span className="l1 text-muted">Compatibility</span>
          <span className="t4">{stats.compatibilityPercent}%</span>
        </div>
        <ProgressIndicator
          variant="secondary"
          value={stats.compatibilityPercent}
          max={100}
        />
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col">
            <span className="l1 text-muted">Matches</span>
            <span className="t5">{stats.matched}</span>
          </div>
          <div className="flex flex-col">
            <span className="l1 text-muted">Different</span>
            <span className="t5">{stats.mismatched}</span>
          </div>
          <div className="flex flex-col">
            <span className="l1 text-muted">Skipped</span>
            <span className="t5">{stats.skipped}</span>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => ctx.trigger('[TRIGGER]_INIT')}>
          Pick another category
        </Button>
      </div>
    </div>
  );
};
