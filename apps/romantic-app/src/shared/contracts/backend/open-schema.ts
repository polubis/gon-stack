type QuestionConstraints = {
  min: number;
  max: number;
  required: boolean;
};

type UserProfileQuestion =
  | {
      id: number;
      key: string;
      question: string;
      category: string;
      constraints: QuestionConstraints;
      type: 'numeric';
      // add numeric-specific fields here
    }
  | {
      id: number;
      key: string;

      question: string;
      category: string;
      constraints: QuestionConstraints;
      type: 'select';
      options: { value: string; label: string }[];
    }
  | {
      id: number;
      key: string;

      question: string;
      category: string;
      constraints: QuestionConstraints;
      type: 'text';
      // add text-specific fields here
    }
  | {
      id: number;
      key: string;
      question: string;
      category: string;
      constraints: QuestionConstraints;
      type: 'slide';
      badges: { min: string; max: string };
    };

export type GetUserProfile = {
  path: '/config/user-profile';
  response: {
    groups: {
      id: number;
      key: string;
      label: string;
      description: string;
      questions: UserProfileQuestion[];
    }[];
  };
};
