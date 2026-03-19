type QuestionConstraints = {
  min: number;
  max: number;
  required: boolean;
};

type UserProfileQuestion =
  | {
      id: number;
      key: string;
      label: string;
      category: string;
      constraints: QuestionConstraints;
      value: number;
      type: 'numeric';
    }
  | {
      id: number;
      key: string;
      label: string;
      category: string;
      constraints: QuestionConstraints;
      type: 'select';
      options: { value: string; label: string }[];
      value: string;
    }
  | {
      id: number;
      key: string;
      label: string;
      category: string;
      constraints: QuestionConstraints;
      type: 'text';
      value: string;
    }
  | {
      id: number;
      key: string;
      label: string;
      category: string;
      constraints: QuestionConstraints;
      type: 'slide';
      badges: { min: string; max: string };
      value: number;
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
