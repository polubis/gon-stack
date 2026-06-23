export const FEATURE_NAME = 'Home';

const appConfig = {
  aboutSection: {
    id: 'about',
  },
  opinionsSection: {
    id: 'opinions',
  },
  faqSection: {
    id: 'faq',
  },
  materialsSection: {
    id: 'materials',
    link: 'https://4markdown.com/education-zone/',
  },
  learningProcessSection: {
    id: 'learning-process',
  },
  plansSection: {
    id: 'plans',
    plans: {
      introductoryMeeting: {
        cost: 'Bezpłatne',
        currency: '',
        label: 'Spotkanie zapoznawcze',
      },
      seniorInYear: {
        cost: '4920',
        currency: 'PLN',
        label: 'Senior w Rok',
      },
      mockedTechInterview: {
        cost: '369',
        currency: 'PLN',
        label: 'Mocked Technical Interview',
      },
      quickCall: {
        cost: '123',
        currency: 'PLN',
        label: 'Konsultacja 1h',
      },
      custom: {
        cost: 'Do ustalenia',
        currency: 'PLN',
        label: 'Własny Plan',
      },
      cvMastering: {
        cost: '246',
        currency: 'PLN',
        label: 'CV Mastering',
      },
    },
  },
  specializationsSection: {
    id: 'specializations',
    technologiesLink:
      'https://4markdown.com/document-preview/?id=7de38215-335d-4ed5-8daf-c247626aee72',
  },
  contactSection: {
    id: 'contact',
    calendarLink: 'https://calendar.app.google/unoaL2rV1MhKvVvZ8',
    linkedInLink:
      'https://www.linkedin.com/in/adrian-po%C5%82ubi%C5%84ski-281ab2172/',
  },
} as const;

export { appConfig };
