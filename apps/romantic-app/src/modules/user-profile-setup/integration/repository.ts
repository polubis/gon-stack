import type { GetUserProfile } from '../../../shared/contracts/backend/open-schema';
import type * as Models from '../contracts/models';

export const getConfig = async (): Promise<{
  groups: Models.QuestionGroups;
}> => {
  const response = await fetch('/api/config/user-profile');
  const data = (await response.json()) as GetUserProfile['response'];
  return { groups: data.groups };
};
