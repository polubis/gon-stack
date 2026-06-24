import { useState } from 'react';
import { Alert } from '@/libs/ui/alert';
import { Button } from '@/libs/ui/button';
import { Heading } from '@/libs/ui/heading';
import { ProgressIndicator } from '@/libs/ui/progress-indicator';
import { Spinner } from '@/libs/ui/spinner';
import { Textarea } from '@/libs/ui/textarea';
import type { AnswerValue, QuestionOption } from '../contracts/models';
import { useContext } from './context';

type Props = {
  loading?: boolean;
};

export const QuestionView = ({ loading }: Props) => {
  const ctx = useContext();
  const question = ctx.$currentQuestion.use();
  const remaining = ctx.$timerRemaining.use();
  const percent = ctx.$timerPercent.use();
  const error = ctx.$error.use();
  const category = ctx.$selectedCategory.use();
  const index = ctx.$currentQuestionIndex.use();
  const totalQuestions = ctx.$questions.use().length;

  const [draft, setDraft] = useState<AnswerValue>(null);

  if (loading || !question) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <Spinner variant="secondary" />
        <p className="b1">Preparing your question…</p>
        {error ? <Alert variant="error">{error}</Alert> : null}
      </div>
    );
  }

  const submit = () => {
    if (draft === null || draft === '') return;
    ctx.trigger('[TRIGGER]_SUBMIT_ANSWER', draft);
    setDraft(null);
  };

  const skip = () => {
    ctx.trigger('[TRIGGER]_SKIP_QUESTION');
    setDraft(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="variant-pill">{category?.label ?? 'Category'}</div>
          <span className="l1 text-muted">
            Question {index + 1} of {totalQuestions}
          </span>
        </div>
        <Heading level={5}>{question.text}</Heading>
        <div className="flex items-center gap-3">
          <ProgressIndicator
            variant={remaining > 10 ? 'secondary' : 'primary'}
            value={percent}
            max={100}
            size="sm"
          />
          <span className="l1 text-muted">{remaining}s</span>
        </div>
      </header>

      {question.type === 'yes_no' ? (
        <div className="grid gap-3 md:grid-cols-2">
          {(['yes', 'no'] as const).map((v) => (
            <Button
              key={v}
              variant={draft === v ? 'primary' : 'secondary'}
              onClick={() => setDraft(v)}
            >
              {v === 'yes' ? 'Yes' : 'No'}
            </Button>
          ))}
        </div>
      ) : null}

      {question.type === 'multiple_choice' && question.options ? (
        <div className="grid gap-3 md:grid-cols-2">
          {question.options.map((opt: QuestionOption) => (
            <Button
              key={opt.value}
              variant={draft === opt.value ? 'primary' : 'secondary'}
              onClick={() => setDraft(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      ) : null}

      {question.type === 'scale' ? (
        <div className="flex items-center gap-2">
          {Array.from(
            { length: (question.scaleMax ?? 5) - (question.scaleMin ?? 1) + 1 },
            (_, i) => (question.scaleMin ?? 1) + i,
          ).map((n) => (
            <Button
              key={n}
              variant={draft === n ? 'primary' : 'secondary'}
              onClick={() => setDraft(n)}
            >
              {n}
            </Button>
          ))}
        </div>
      ) : null}

      {question.type === 'open_text' ? (
        <Textarea
          value={typeof draft === 'string' ? draft : ''}
          maxLength={question.maxLength ?? 200}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write your answer…"
        />
      ) : null}

      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={skip}>
          Skip
        </Button>
        <Button onClick={submit} disabled={draft === null || draft === ''}>
          Submit
        </Button>
      </div>
    </div>
  );
};
