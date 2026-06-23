type Article = {
  id: string;
  cdate: string;
  name: string;
  url: string;
};

type TestimonialAvatar = {
  url: string;
  title: string;
  alt: string;
};

type Testimonial = {
  content: string;
  avatar?: TestimonialAvatar;
  name: string;
  position?: string;
};

type Material = {
  id: string;
  title: string;
  description: string;
  price: string;
  url: string;
};

type PlanKey =
  | 'cvMastering'
  | 'introductoryMeeting'
  | 'seniorInYear'
  | 'mockedTechInterview'
  | 'quickCall'
  | 'custom';

type PlanType = PlanKey | 'default';

export type {
  Article,
  Testimonial,
  TestimonialAvatar,
  Material,
  PlanKey,
  PlanType,
};
