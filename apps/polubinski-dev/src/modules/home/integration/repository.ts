import type { Testimonial, Article, Material } from '../domain/models';
import { toTestimonial, type CommentDto } from './mappers';
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

const getTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const payload = {
      data: { profileId: '2eec0829-0a2f-4f3f-b2a2-a7b4b8a890e0' },
    };
    const res = await fetch(TESTIMONIALS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as TestimonialsResponse;
    return data.result.comments.map(toTestimonial);
  } catch {
    return [];
  }
};

const publicationsMock: Article[] = [
  {
    cdate: '2025-04-01T12:52:32.109Z',
    name: 'Full Tutorial on Updating Dependencies in JS Projects',
    url: 'https://4markdown.com/full-tutorial-on-updating-dependencies-in-js-projects/',
    id: '81054519-74-492584bdec6b',
  },
  {
    cdate: '2025-04-01T12:52:32.109Z',
    name: 'Full Tutorial on Updating Dependencies in JS Projects',
    url: 'https://4markdown.com/full-tutorial-on-updating-dependencies-in-js-projects/',
    id: '81054519-74d2-435b-ab584bdec6b',
  },
  {
    cdate: '2025-04-01T12:52:32.109Z',
    name: 'Full Tutorial on Updating Dependencies in JS Projects',
    url: 'https://4markdown.com/full-tutorial-on-updating-dependencies-in-js-projects/',
    id: '81054519-74d2-435b-ab2584bdec6b',
  },
  {
    cdate: '2025-04-01T12:52:32.109Z',
    name: 'Full Tutorial on Updating Dependencies in JS Projects',
    url: 'https://4markdown.com/full-tutorial-on-updating-dependencies-in-js-projects/',
    id: '81054519-74d2-4358-492584bdec6b',
  },
  {
    cdate: '2025-04-01T12:52:32.109Z',
    name: 'Full Tutorial on Updating Dependencies in JS Projects',
    url: 'https://4markdown.com/full-tutorial-on-updating-dependencies-in-js-projects/',
    id: '81054519-74d2-435ba8-492584bdec6b',
  },
  {
    cdate: '2025-04-01T12:52:32.109Z',
    name: 'Full Tutorial on Updating Dependencies in JS Projects',
    url: 'https://4markdown.com/full-tutorial-on-updating-dependencies-in-js-projects/',
    id: '81054519-74d2-435b-aba8-492584b',
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

export { getTestimonials, publicationsMock, MATERIALS_MOCK };
