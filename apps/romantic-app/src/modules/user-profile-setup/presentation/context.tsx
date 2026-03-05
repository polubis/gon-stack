import { useState } from 'react';
import { createHookContext } from '../../../libs/power-context';
import { createStore } from '../core/store';

export const [Provider, useContext] = createHookContext(
  'UserProfile',
  () => useState(createStore)[0],
);
