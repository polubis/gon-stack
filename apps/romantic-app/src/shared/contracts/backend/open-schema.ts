type QuestionConstraints = {
  min?: number;
  max?: number;
  required?: boolean;
};

/** Tuple of supported question versions; only 'v1' is available for now */
type QuestionVersion = 'v1';

type UserProfileQuestion =
  | {
      id: number;
      key: string;
      version: QuestionVersion;
      question: string;
      category: string;
      constraints: QuestionConstraints;
      type: 'numeric';
      // add numeric-specific fields here
    }
  | {
      id: number;
      key: string;
      version: QuestionVersion;
      question: string;
      category: string;
      constraints: QuestionConstraints;
      type: 'select';
      // add select-specific fields here
    }
  | {
      id: number;
      key: string;
      version: QuestionVersion;
      question: string;
      category: string;
      constraints: QuestionConstraints;
      type: 'text';
      // add text-specific fields here
    }
  | {
      id: number;
      key: string;
      version: QuestionVersion;
      question: string;
      category: string;
      constraints: QuestionConstraints;
      type: 'slide';
      badges: { min: string; max: string };
    };

export type GetUserProfile = {
  path: '/config/user-profile';
  response: {
    questions: UserProfileQuestion[];
  };
};
