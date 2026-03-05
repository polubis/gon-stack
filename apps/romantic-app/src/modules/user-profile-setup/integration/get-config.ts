import type * as Dtos from '../contracts/dtos';
import type * as Models from '../contracts/models';

export const getConfig = async (): Promise<{
  questions: Models.Question[];
}> => {
  const response = await fetch('/api/user-profile-setup/config');
  const data = (await response.json()) as Dtos.Question[];

  return {
    questions: data.map((question) => ({
      id: question.id,
      content: question.content,
      type: question.meta.type,
      min: question.meta.min,
      max: question.meta.max,
    })),
  };
};
