import { Control, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import type { Answers, Question } from '../contracts/models';

export type QuestionInputProps = {
  question: Question;
  control: Control<Answers>;
  register: UseFormRegister<Answers>;
  setValue: UseFormSetValue<Answers>;
};
