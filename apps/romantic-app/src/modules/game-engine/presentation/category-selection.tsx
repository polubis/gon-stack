import { Alert } from '@/libs/ui/alert';
import { Button } from '@/libs/ui/button';
import { Card } from '@/libs/ui/card';
import { Heading } from '@/libs/ui/heading';
import { Spinner } from '@/libs/ui/spinner';
import type { CategoryId } from '../contracts/models';
import { useContext } from './context';

export const CategorySelection = () => {
  const ctx = useContext();
  const categories = ctx.$categories.use();
  const error = ctx.$error.use();

  const onPick = (id: CategoryId) => {
    ctx.trigger('[TRIGGER]_SELECT_CATEGORY', id);
  };

  if (categories.length === 0 && !error) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <Spinner variant="secondary" />
        <p className="b1">Loading categories…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="variant-pill">PICK A CATEGORY</div>
        <Heading level={4}>Where would you like to start?</Heading>
        <p className="b1">
          Each category explores a different dimension of your connection.
        </p>
      </header>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {categories.map((cat) => (
          <Card key={cat.id} className="flex flex-col gap-3">
            <Heading as="h3" level={6}>
              {cat.label}
            </Heading>
            <p className="b2">{cat.description}</p>
            <div className="flex items-center justify-between">
              <span className="l1 text-muted">
                {cat.questionCount} questions
              </span>
              <Button onClick={() => onPick(cat.id)}>Start</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
