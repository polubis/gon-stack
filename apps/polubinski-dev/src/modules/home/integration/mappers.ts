import type { ScoreStats, Testimonial } from '../domain/models';

type OwnerProfile = {
  displayName: string | null;
  bio: string | null;
  avatar: Record<string, { src: string }> | null;
};

type CommentDto = {
  content: string;
  ownerProfile: OwnerProfile;
};

type ScoreProfileDto = {
  scoreAverage?: number;
  scoreCount?: number;
  perfect?: number;
  good?: number;
  decent?: number;
  bad?: number;
  ugly?: number;
};

const toTestimonial = (comment: CommentDto): Testimonial => ({
  content: comment.content,
  avatar: comment.ownerProfile.avatar
    ? {
        url: (comment.ownerProfile.avatar as Record<string, { src: string }>)[
          'lg'
        ]!.src,
        title: comment.ownerProfile.displayName ?? 'User avatar',
        alt: comment.ownerProfile.displayName ?? 'User avatar',
      }
    : undefined,
  name: comment.ownerProfile.displayName ?? 'Anonymous',
  position: comment.ownerProfile.bio ?? undefined,
});

const toScoreStats = (profile: ScoreProfileDto): ScoreStats | null => {
  const { scoreAverage, scoreCount } = profile;
  if (!scoreAverage || !scoreCount) return null;

  return {
    average: scoreAverage,
    count: scoreCount,
    breakdown: {
      perfect: profile.perfect ?? 0,
      good: profile.good ?? 0,
      decent: profile.decent ?? 0,
      bad: profile.bad ?? 0,
      ugly: profile.ugly ?? 0,
    },
  };
};

export type { CommentDto, OwnerProfile, ScoreProfileDto };
export { toTestimonial, toScoreStats };
