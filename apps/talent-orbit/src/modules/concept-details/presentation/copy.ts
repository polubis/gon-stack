export const copy = {
  back: 'Back',
  name: 'State Management',
  edit: 'Edit concept',
  moreOptions: 'More options',
  status: {
    added: 'Concept added',
    dismiss: 'Dismiss',
  },
  coverage: {
    label: 'Coverage',
    value:
      'Concepts and patterns for managing application state in React applications.',
  },
  parent: {
    label: 'Parent',
    bank: 'Frontend Engineering',
    concept: 'React',
  },
  childConcepts: {
    label: 'Child concepts',
    items: [
      { name: 'Hooks', count: 5 },
      { name: 'Component Lifecycle', count: 3 },
    ],
  },
  metadata: {
    label: 'Metadata',
    difficulty: { label: 'Difficulty', value: 'Intermediate' },
    tags: { label: 'Tags', value: ['React', 'State'] },
  },
} as const;
