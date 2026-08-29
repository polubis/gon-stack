export const copy = {
  banner: {
    title: 'We use cookies',
    description:
      'We use essential cookies to keep Talent Orbit secure and working. Optional cookies help us understand how Talent Orbit is used and personalize your experience.',
    dismissLabel: 'Dismiss cookie notice',
    managePreferences: 'Manage preferences',
    privacyPolicyLabel: 'Read our Privacy Policy',
    rejectOptional: 'Reject optional',
    acceptAll: 'Accept all',
  },

  preferences: {
    title: 'Cookie preferences',
    description: "You're in control. Choose which optional cookies we can use.",
    backLabel: 'Back to cookie notice',
    closeLabel: 'Close cookie preferences',
    alwaysActive: 'Always active',
    rejectOptional: 'Reject optional',
    savePreferences: 'Save preferences',
    acceptAll: 'Accept all',
    categories: {
      essential: {
        title: 'Essential',
        description: 'Required for core site functionality and security.',
      },
      analytics: {
        title: 'Analytics',
        description: 'Helps us understand how you use Talent Orbit.',
      },
      personalization: {
        title: 'Personalization',
        description: 'Remembers your preferences and tailors your experience.',
      },
      marketing: {
        title: 'Marketing',
        description: 'Used to show relevant content and measure campaigns.',
      },
    },
  },

  saved: {
    message: 'Preferences saved',
    dismissLabel: 'Dismiss',
  },

  reopenTrigger: {
    ariaLabel: 'Cookie settings',
  },
} as const;
