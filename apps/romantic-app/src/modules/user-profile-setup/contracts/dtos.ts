export type Question = {
  id: string;
  content: string;
  meta: {
    min: number;
    max: number;
    type: 'text' | 'number';
  };
};
