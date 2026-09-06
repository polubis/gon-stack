export const copy = {
  brand: {
    name: 'Talent Orbit',
  },
  nav: {
    home: 'Home',
    assessments: 'Assessments',
    users: 'Users',
    invites: 'Invites',
    supportCenter: 'Support center',
    settings: 'Settings',
  },
  mobileMenuLabel: 'Open menu',
  notificationsLabel: 'Notifications',
  list: {
    title: 'Users',
    searchPlaceholder: 'Search users...',
    filters: ['All', 'Candidate', 'Recruiter', 'Interviewer', 'Admin'],
    columns: { user: 'User', role: 'Role', status: 'Status' },
    users: [
      { id: 'USER-1842', role: 'Candidate', status: 'Active', selected: true },
      { id: 'USER-2071', role: 'Recruiter', status: 'Active', selected: false },
      {
        id: 'USER-3198',
        role: 'Interviewer',
        status: 'Active',
        selected: false,
      },
      { id: 'USER-4550', role: 'Admin', status: 'Invited', selected: false },
    ],
  },
  assign: {
    back: 'Back',
    title: 'Assign role',
    subtitle: 'USER-1842',
    currentBadge: 'Current',
    warning: 'Full platform access',
    submit: 'Save role',
    roles: [
      {
        name: 'candidate',
        title: 'Candidate',
        description: 'Takes assessments and participates in interviews',
        current: true,
      },
      {
        name: 'recruiter',
        title: 'Recruiter',
        description: 'Manages job openings and candidates',
        current: false,
      },
      {
        name: 'interviewer',
        title: 'Interviewer',
        description: 'Conducts interviews and provides feedback',
        current: false,
      },
      {
        name: 'admin',
        title: 'Admin',
        description: 'Full platform access and configuration',
        current: false,
      },
    ],
    selected: 'interviewer',
  },
  confirmation: {
    title: 'Role updated',
    subtitle: "The user's role has been updated successfully.",
    userLabel: 'User',
    userId: 'USER-1842',
    newRoleLabel: 'New role',
    newRole: 'Interviewer',
    recordedTitle: 'Recorded anonymously',
    recordedSubtitle:
      'This action has been logged to our audit trail without exposing identities.',
    done: 'Done',
  },
} as const;
