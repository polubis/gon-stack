import { ReactElement } from 'react';

export type StepComponent = {
  (): ReactElement;
  label: string;
};
