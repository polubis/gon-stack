import type {
  Testimonial,
  Article,
  Material,
  ScoreStats,
} from '../domain/models';
import { toTestimonial, toScoreStats, type CommentDto } from './mappers';
import { appConfig } from '../configuration/constraints';

const TESTIMONIALS_ENDPOINT =
  'https://us-central1-markdown-b9f5e.cloudfunctions.net/getUserProfile';

type UserProfileAvatar = Record<
  'tn' | 'sm' | 'md' | 'lg',
  { w: number; h: number; id: string; src: string }
>;

type UserProfile = {
  id: string;
  cdate: string;
  mdate: string;
  displayNameSlug: string | null;
  displayName: string | null;
  bio: string | null;
  avatar: UserProfileAvatar | null;
  githubUrl: string | null;
  linkedInUrl: string | null;
  twitterUrl: string | null;
  fbUrl: string | null;
  blogUrl: string | null;
  ugly?: number;
  bad?: number;
  decent?: number;
  good?: number;
  perfect?: number;
  scoreAverage?: number;
  scoreCount?: number;
  scoreValues?: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10)[];
};

type Comment = CommentDto & {
  id: string;
  ownerProfile: UserProfile;
  cdate: string;
  mdate: string;
};

type TestimonialsResponse = {
  result: {
    profile: UserProfile;
    comments: Comment[];
  };
};

type TestimonialsData = {
  testimonials: Testimonial[];
  stats: ScoreStats | null;
};

const getTestimonialsData = async (): Promise<TestimonialsData> => {
  try {
    const payload = {
      data: { profileId: appConfig.opinionsSection.profileId },
    };
    const res = await fetch(TESTIMONIALS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { testimonials: [], stats: null };
    const data = (await res.json()) as TestimonialsResponse;
    return {
      testimonials: data.result.comments.map(toTestimonial),
      stats: toScoreStats(data.result.profile),
    };
  } catch {
    return { testimonials: [], stats: null };
  }
};

const ARTICLES: Article[] = [
  {
    id: '4md-intl-api-a-native-lightweight-alternativ',
    cdate: '2026-01-15T12:00:00.000Z',
    name: 'Intl API: A Native, Lightweight Alternative to Formatting Libraries',
    url: 'https://4markdown.com/intl-api-a-native-lightweight-alternative-to-formatting-libraries/',
  },
  {
    id: '4md-fixing-intellisense-performance-issues-i',
    cdate: '2025-12-15T12:00:00.000Z',
    name: 'Fixing IntelliSense Performance Issues in Nx and Turborepo',
    url: 'https://4markdown.com/fixing-intellisense-performance-issues-in-nx-and-turborepo/',
  },
  {
    id: '4md-react-useeffectevent-a-new-dimension-for',
    cdate: '2025-12-06T12:00:00.000Z',
    name: 'React useEffectEvent: A New Dimension for Reusable Hooks',
    url: 'https://4markdown.com/react-useeffectevent-a-new-dimension-for-reusable-hooks/',
  },
  {
    id: '4md-5-game-changing-typescript-utility-types',
    cdate: '2025-09-15T12:00:00.000Z',
    name: '5 Game-Changing TypeScript Utility Types You Should Master',
    url: 'https://4markdown.com/5-game-changing-typescript-utility-types-you-should-master/',
  },
  {
    id: '4md-full-guide-to-javascript-modules-from-ch',
    cdate: '2025-07-15T12:00:00.000Z',
    name: 'Full Guide to JavaScript Modules: From Chaos to Clarity',
    url: 'https://4markdown.com/full-guide-to-javascript-modules-from-chaos-to-clarity/',
  },
  {
    id: '4md-full-tutorial-on-updating-dependencies-i',
    cdate: '2025-06-30T12:00:00.000Z',
    name: 'Full Tutorial on Updating Dependencies in JS Projects',
    url: 'https://4markdown.com/full-tutorial-on-updating-dependencies-in-js-projects/',
  },
  {
    id: '4md-web-styling-time-travel-what-is-making-t',
    cdate: '2025-06-24T12:00:00.000Z',
    name: 'Web Styling Time Travel: What Is Making Tailwind Top 1 Today?',
    url: 'https://4markdown.com/web-styling-time-travel-what-is-making-tailwind-top-1-today/',
  },
  {
    id: '4md-1-prod-ready-react-usefeature-and-usesim',
    cdate: '2025-06-15T12:00:00.000Z',
    name: '(1) Prod Ready React: useFeature and useSimpleFeature hooks',
    url: 'https://4markdown.com/1-prod-ready-react-usefeature-and-usesimplefeature-hooks/',
  },
  {
    id: '4md-how-to-deploy-an-nx-crafted-next-js-app',
    cdate: '2025-04-15T12:00:00.000Z',
    name: 'How to Deploy an NX-Crafted Next.js App on Vercel',
    url: 'https://4markdown.com/how-to-deploy-an-nx-crafted-next-js-app-on-vercel/',
  },
  {
    id: '4md-it-s-not-the-tech-stack-people-are-the-r',
    cdate: '2025-04-06T12:00:00.000Z',
    name: "It's Not the Tech Stack—People Are the Real Challenge in IT",
    url: 'https://4markdown.com/it-s-not-the-tech-stack-people-are-the-real-challenge-in-it/',
  },
  {
    id: '4md-how-to-be-productive-as-a-software-engin',
    cdate: '2025-03-28T12:00:00.000Z',
    name: 'How to be productive as a software engineer',
    url: 'https://4markdown.com/how-to-be-productive-as-a-software-engineer/',
  },
  {
    id: '4md-exhaustiveness-checking-and-discriminant',
    cdate: '2025-03-19T12:00:00.000Z',
    name: 'Exhaustiveness checking and discriminant property: the complete guide',
    url: 'https://4markdown.com/exhaustiveness-checking-and-discriminant-property-the-complete-guide/',
  },
  {
    id: '4md-rxjs-observables-vs-promises-in-javascri',
    cdate: '2025-03-09T12:00:00.000Z',
    name: 'RxJS Observables Vs Promises In JavaScript: What You Need To Know',
    url: 'https://4markdown.com/rxjs-observables-vs-promises-in-javascript-what-you-need-to-know/',
  },
  {
    id: '4md-understanding-flat-routing-technique',
    cdate: '2025-02-28T12:00:00.000Z',
    name: 'Understanding flat routing technique',
    url: 'https://4markdown.com/understanding-flat-routing-technique/',
  },
  {
    id: '4md-crafting-solid-and-type-safe-apis-in-nod',
    cdate: '2025-02-19T12:00:00.000Z',
    name: 'Crafting SOLID and type safe APIs in Node and TypeScript',
    url: 'https://4markdown.com/crafting-solid-and-type-safe-apis-in-node-and-typescript/',
  },
  {
    id: '4md-everything-about-barrel-exports-in-javas',
    cdate: '2025-02-12T12:00:00.000Z',
    name: 'Everything about barrel exports in JavaScript',
    url: 'https://4markdown.com/everything-about-barrel-exports-in-javascript/',
  },
  {
    id: '4md-searching-for-the-holy-grail-in-validati',
    cdate: '2025-02-03T12:00:00.000Z',
    name: 'Searching for the Holy Grail in validation world',
    url: 'https://4markdown.com/searching-for-the-holy-grail-in-validation-world/',
  },
  {
    id: '4md-creating-own-state-manager-for-react',
    cdate: '2025-01-25T12:00:00.000Z',
    name: 'Creating own state manager for React',
    url: 'https://4markdown.com/creating-own-state-manager-for-react/',
  },
  {
    id: '4md-dependency-injection-does-not-need-to-be',
    cdate: '2024-09-15T12:00:00.000Z',
    name: 'Dependency injection does not need to be complex',
    url: 'https://4markdown.com/dependency-injection-does-not-need-to-be-complex/',
  },
  {
    id: '4md-reflections-on-test-coverage-in-web-deve',
    cdate: '2024-09-06T12:00:00.000Z',
    name: 'Reflections on test coverage in web development',
    url: 'https://4markdown.com/reflections-on-test-coverage-in-web-development/',
  },
  {
    id: '4md-putting-users-first-in-web-development',
    cdate: '2024-08-28T12:00:00.000Z',
    name: 'Putting users first in web development',
    url: 'https://4markdown.com/putting-users-first-in-web-development/',
  },
  {
    id: '4md-dealing-with-tech-debt-in-applications',
    cdate: '2024-08-19T12:00:00.000Z',
    name: 'Dealing with tech debt in applications',
    url: 'https://4markdown.com/dealing-with-tech-debt-in-applications/',
  },
  {
    id: '4md-consider-using-type-imports-in-typescrip',
    cdate: '2024-08-09T12:00:00.000Z',
    name: 'Consider using type imports in TypeScript',
    url: 'https://4markdown.com/consider-using-type-imports-in-typescript/',
  },
  {
    id: '4md-ugly-relationship-between-tuples-in-type',
    cdate: '2024-07-31T12:00:00.000Z',
    name: 'Ugly relationship between tuples in TypeScript and JavaScript',
    url: 'https://4markdown.com/ugly-relationship-between-tuples-in-typescript-and-javascript/',
  },
  {
    id: '4md-inferring-iterables-with-typescript',
    cdate: '2024-07-15T12:00:00.000Z',
    name: 'Inferring iterables with TypeScript',
    url: 'https://4markdown.com/inferring-iterables-with-typescript/',
  },
  {
    id: '4md-command-query-separation-principle',
    cdate: '2024-07-06T12:00:00.000Z',
    name: 'Command Query Separation principle',
    url: 'https://4markdown.com/command-query-separation-principle/',
  },
  {
    id: '4md-mediator-pattern-in-typescript',
    cdate: '2024-06-27T12:00:00.000Z',
    name: 'Mediator pattern in TypeScript',
    url: 'https://4markdown.com/mediator-pattern-in-typescript/',
  },
  {
    id: '4md-writing-a-parsing-utility-for-zod',
    cdate: '2024-06-18T12:00:00.000Z',
    name: 'Writing a parsing utility for Zod',
    url: 'https://4markdown.com/writing-a-parsing-utility-for-zod/',
  },
  {
    id: '4md-dealing-with-property-is-not-matching-in',
    cdate: '2024-06-09T12:00:00.000Z',
    name: 'Dealing with property is not matching index signature',
    url: 'https://4markdown.com/dealing-with-property-is-not-matching-index-signature/',
  },
  {
    id: '4md-all-about-javascript-promises',
    cdate: '2024-05-31T12:00:00.000Z',
    name: 'All about JavaScript promises',
    url: 'https://4markdown.com/all-about-javascript-promises/',
  },
  {
    id: '4md-why-you-should-start-using-zod',
    cdate: '2024-05-22T12:00:00.000Z',
    name: 'Why you should start using Zod',
    url: 'https://4markdown.com/why-you-should-start-using-zod/',
  },
  {
    id: '4md-using-zod-and-typescript-to-write-type-s',
    cdate: '2024-05-12T12:00:00.000Z',
    name: 'Using Zod and TypeScript to write type safe code',
    url: 'https://4markdown.com/using-zod-and-typescript-to-write-type-safe-code/',
  },
  {
    id: '4md-implementing-queue-in-javascript',
    cdate: '2024-05-03T12:00:00.000Z',
    name: 'Implementing Queue in JavaScript',
    url: 'https://4markdown.com/implementing-queue-in-javascript/',
  },
  {
    id: '4md-be-careful-with-the-spread-operator-in-j',
    cdate: '2024-04-24T12:00:00.000Z',
    name: 'Be Careful with the Spread Operator in JavaScript',
    url: 'https://4markdown.com/be-careful-with-the-spread-operator-in-javascript/',
  },
  {
    id: '4md-nested-lists-with-css-and-markdowntojsx',
    cdate: '2024-04-15T12:00:00.000Z',
    name: 'Nested lists with CSS and MarkdownToJSX',
    url: 'https://4markdown.com/nested-lists-with-css-and-markdowntojsx/',
  },
  {
    id: '4md-naming-generics-in-typescript',
    cdate: '2024-04-06T12:00:00.000Z',
    name: 'Naming generics in TypeScript',
    url: 'https://4markdown.com/naming-generics-in-typescript/',
  },
  {
    id: '4md-mapped-types-in-typescript',
    cdate: '2024-03-28T12:00:00.000Z',
    name: 'Mapped types in TypeScript',
    url: 'https://4markdown.com/mapped-types-in-typescript/',
  },
  {
    id: '4md-complete-gitflow-tutorial',
    cdate: '2024-03-19T12:00:00.000Z',
    name: 'Complete GitFlow tutorial',
    url: 'https://4markdown.com/complete-gitflow-tutorial/',
  },
  {
    id: '4md-prevent-unwanted-overrides-by-using-modi',
    cdate: '2024-03-09T12:00:00.000Z',
    name: 'Prevent unwanted overrides by using modification dates',
    url: 'https://4markdown.com/prevent-unwanted-overrides-by-using-modification-dates/',
  },
  {
    id: '4md-creating-reusable-and-framework-agnostic',
    cdate: '2024-02-26T12:00:00.000Z',
    name: 'Creating reusable and framework agnostic link component',
    url: 'https://4markdown.com/creating-reusable-and-framework-agnostic-link-component/',
  },
  {
    id: '4md-crafting-git-aliases-to-enhance-daily-wo',
    cdate: '2024-02-15T12:00:00.000Z',
    name: 'Crafting Git aliases to enhance daily workflow',
    url: 'https://4markdown.com/crafting-git-aliases-to-enhance-daily-workflow/',
  },
  {
    id: '4md-publishing-nx-generated-typescript-libra',
    cdate: '2024-02-03T12:00:00.000Z',
    name: 'Publishing Nx generated TypeScript libraries on Npm',
    url: 'https://4markdown.com/publishing-nx-generated-typescript-libraries-on-npm/',
  },
  {
    id: '4md-using-zustand-with-react-context',
    cdate: '2024-01-22T12:00:00.000Z',
    name: 'Using Zustand with React Context',
    url: 'https://4markdown.com/using-zustand-with-react-context/',
  },
  {
    id: '4md-uploading-images-with-firebase-and-react',
    cdate: '2024-01-09T12:00:00.000Z',
    name: 'Uploading images with Firebase and React',
    url: 'https://4markdown.com/uploading-images-with-firebase-and-react/',
  },
  {
    id: '4md-how-to-maintain-environment-variables',
    cdate: '2023-12-28T12:00:00.000Z',
    name: 'How to maintain environment variables',
    url: 'https://4markdown.com/how-to-maintain-environment-variables/',
  },
  {
    id: '4md-managing-legacy-urls-on-netlify',
    cdate: '2023-12-15T12:00:00.000Z',
    name: 'Managing legacy URLs on Netlify',
    url: 'https://4markdown.com/managing-legacy-urls-on-netlify/',
  },
  {
    id: '4md-modal-in-react-and-tailwind',
    cdate: '2023-12-03T12:00:00.000Z',
    name: 'Modal in React and Tailwind',
    url: 'https://4markdown.com/modal-in-react-and-tailwind/',
  },
  {
    id: '4md-folder-and-file-naming-conventions-go-wi',
    cdate: '2023-11-21T12:00:00.000Z',
    name: 'Folder and file naming conventions go wild',
    url: 'https://4markdown.com/folder-and-file-naming-conventions-go-wild/',
  },
  {
    id: '4md-firebase-cli-cheatsheet',
    cdate: '2023-11-09T12:00:00.000Z',
    name: 'Firebase CLI cheatsheet',
    url: 'https://4markdown.com/firebase-cli-cheatsheet/',
  },
  {
    id: '4md-the-use-case-for-facade-pattern',
    cdate: '2023-10-28T12:00:00.000Z',
    name: 'The use case for Facade pattern',
    url: 'https://4markdown.com/the-use-case-for-facade-pattern/',
  },
  {
    id: '4md-what-does-it-mean-to-be-a-senior-in-some',
    cdate: '2023-10-15T12:00:00.000Z',
    name: 'What does it mean to be a Senior in something',
    url: 'https://4markdown.com/what-does-it-mean-to-be-a-senior-in-something/',
  },
  {
    id: '4md-tailwind-is-real-game-changer',
    cdate: '2023-10-03T12:00:00.000Z',
    name: 'Tailwind is real game changer',
    url: 'https://4markdown.com/tailwind-is-real-game-changer/',
  },
  {
    id: '4md-be-careful-with-micro-frontends',
    cdate: '2023-09-21T12:00:00.000Z',
    name: 'Be careful with Micro Frontends',
    url: 'https://4markdown.com/be-careful-with-micro-frontends/',
  },
  {
    id: '4md-styled-components-to-tailwind-migration',
    cdate: '2023-09-09T12:00:00.000Z',
    name: 'Styled components to Tailwind migration guide',
    url: 'https://4markdown.com/styled-components-to-tailwind-migration-guide/',
  },
  {
    id: '4md-how-to-pass-component-as-prop-in-react-a',
    cdate: '2023-08-28T12:00:00.000Z',
    name: 'How to pass component as prop in React and TypeScript',
    url: 'https://4markdown.com/how-to-pass-component-as-prop-in-react-and-typescript/',
  },
  {
    id: '4md-be-careful-when-using-design-patterns',
    cdate: '2023-08-15T12:00:00.000Z',
    name: 'Be careful when using design patterns',
    url: 'https://4markdown.com/be-careful-when-using-design-patterns/',
  },
  {
    id: '4md-proxy-pattern-in-typescript',
    cdate: '2023-08-03T12:00:00.000Z',
    name: 'Proxy Pattern in TypeScript',
    url: 'https://4markdown.com/proxy-pattern-in-typescript/',
  },
  {
    id: '4md-coupling-explained-in-typescript',
    cdate: '2023-07-22T12:00:00.000Z',
    name: 'Coupling Explained in TypeScript',
    url: 'https://4markdown.com/coupling-explained-in-typescript/',
  },
  {
    id: '4md-all-about-high-cohesion',
    cdate: '2023-07-09T12:00:00.000Z',
    name: 'All about high cohesion',
    url: 'https://4markdown.com/all-about-high-cohesion/',
  },
  {
    id: '4md-facade-pattern-in-typescript',
    cdate: '2023-06-27T12:00:00.000Z',
    name: 'Facade pattern in TypeScript',
    url: 'https://4markdown.com/facade-pattern-in-typescript/',
  },
  {
    id: '4md-observer-pattern-in-typescript',
    cdate: '2023-06-15T12:00:00.000Z',
    name: 'Observer pattern in TypeScript',
    url: 'https://4markdown.com/observer-pattern-in-typescript/',
  },
  {
    id: '4md-creating-transaction-utility-type-in-typ',
    cdate: '2023-06-03T12:00:00.000Z',
    name: 'Creating transaction utility type in TypeScript',
    url: 'https://4markdown.com/creating-transaction-utility-type-in-typescript/',
  },
  {
    id: '4md-singleton-pattern-in-typescript',
    cdate: '2023-05-22T12:00:00.000Z',
    name: 'Singleton pattern in TypeScript',
    url: 'https://4markdown.com/singleton-pattern-in-typescript/',
  },
  {
    id: '4md-chain-of-responsibility-pattern-in-types',
    cdate: '2023-05-09T12:00:00.000Z',
    name: 'Chain of Responsibility Pattern in TypeScript',
    url: 'https://4markdown.com/chain-of-responsibility-pattern-in-typescript/',
  },
  {
    id: '4md-rapid-api-mocking-for-development',
    cdate: '2023-04-27T12:00:00.000Z',
    name: 'Rapid API Mocking for Development',
    url: 'https://4markdown.com/rapid-api-mocking-for-development/',
  },
  {
    id: '4md-how-to-stabilize-useid-testing-with-glob',
    cdate: '2023-04-15T12:00:00.000Z',
    name: 'How to Stabilize useId Testing with Global Mocking',
    url: 'https://4markdown.com/how-to-stabilize-useid-testing-with-global-mocking/',
  },
  {
    id: '4md-improve-code-reviews-in-10-steps',
    cdate: '2023-04-03T12:00:00.000Z',
    name: 'Improve code reviews in 10 steps',
    url: 'https://4markdown.com/improve-code-reviews-in-10-steps/',
  },
  {
    id: '4md-why-i-crafted-my-own-gherkin-interpreter',
    cdate: '2023-03-22T12:00:00.000Z',
    name: 'Why I crafted my own Gherkin interpreter for e2e tests',
    url: 'https://4markdown.com/why-i-crafted-my-own-gherkin-interpreter-for-e2e-tests/',
  },
  {
    id: '4md-javascript-symbols-guide',
    cdate: '2023-03-09T12:00:00.000Z',
    name: 'JavaScript symbols guide',
    url: 'https://4markdown.com/javascript-symbols-guide/',
  },
  {
    id: '4md-javascript-object-methods-cheatsheet',
    cdate: '2023-02-25T12:00:00.000Z',
    name: 'JavaScript object methods cheatsheet',
    url: 'https://4markdown.com/javascript-object-methods-cheatsheet/',
  },
  {
    id: '4md-javascript-array-methods-cheatsheet',
    cdate: '2023-02-15T12:00:00.000Z',
    name: 'JavaScript array methods cheatsheet',
    url: 'https://4markdown.com/javascript-array-methods-cheatsheet/',
  },
  {
    id: '4md-understanding-repository-pattern-in-node',
    cdate: '2023-02-03T12:00:00.000Z',
    name: 'Understanding Repository Pattern in NodeJS and TypeScript',
    url: 'https://4markdown.com/understanding-repository-pattern-in-nodejs-and-typescript/',
  },
];

const MATERIALS_MOCK: Material[] = [
  {
    id: 'senior-in-year-mindmap',
    title: 'Senior w Rok - Mindmapa',
    description:
      'Materiał premium – prezentuje zaledwie 1 moduł kursu (JavaScript).',
    price: 'PREMIUM (DEMO)',
    url: 'https://4markdown.com/mindmap-preview/?mindmapId=150353b58d7c&authorId=Xbkvo5Su6GgW3QMO6F4Fw7MDJMb2',
  },
  {
    id: 'react-hooks-spellbook',
    title: 'React hooks spellbook',
    description: 'Kurs skupiający się na tworzeniu Reactowych hooków.',
    price: 'FREE',
    url: 'https://greenonsoftware.com/courses/react-hooks-spellbook/',
  },
  {
    id: 'react-testing-spellbook',
    title: 'React testing spellbook',
    description:
      'Kurs o tym jak testować Reactowe aplikacje (unit/integration/e2e).',
    price: 'FREE',
    url: 'https://greenonsoftware.com/courses/react-testing-spellbook/',
  },
  {
    id: 'modern-gatsby5-ecosystem-project-setup',
    title: 'Modern Gatsby5 ecosystem project setup',
    description:
      'Kompletny przewodnik po tworzeniu idealnego projektu w Gatsby5.',
    price: 'FREE',
    url: 'https://greenonsoftware.com/courses/modern-gatsby5-ecosystem-project-setup/',
  },
  {
    id: 'education-zone',
    title: 'Education zone',
    description: 'Zestaw kilkudziesięciu artykułów z różnych obszarów IT.',
    price: 'FREE',
    url: appConfig.materialsSection.link,
  },
  {
    id: 'blog-pack',
    title: 'Blog pack',
    description: 'Zestaw kilkudziesięciu artykułów o programowaniu.',
    price: 'FREE',
    url: 'https://greenonsoftware.com/articles/',
  },
  {
    id: 'up2date',
    title: 'Up 2 date',
    description:
      'Mój profil na LinkedIn z codzienną dawką skondensowanej wiedzy.',
    price: 'FREE',
    url: appConfig.contactSection.linkedInLink,
  },
];

const getArticles = async (): Promise<Article[]> => {
  // TODO: replace with a real call once the articles endpoint exists.
  return ARTICLES;
};

export { getTestimonialsData, getArticles, MATERIALS_MOCK };
export type { TestimonialsData };
