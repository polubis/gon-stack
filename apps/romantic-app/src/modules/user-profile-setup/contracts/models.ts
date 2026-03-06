import { Key } from '../../../libs/ts-more';
import { GetUserProfile } from '../../../shared/contracts/backend/open-schema';

export type Step = number;

export type QuestionGroups = GetUserProfile['response']['groups'];

export type QuestionGroup = GetUserProfile['response']['groups'][number];

export type Question = QuestionGroup['questions'][number];

export type QuestionKey = Key<'user-profile.display-name' | 'user-profile.age'>;

export type QuestionValue = string | number;

export type Answers = Record<QuestionKey, QuestionValue>;
