import type { Testimonial } from '../domain/models';

type OwnerProfile = {
  displayName: string | null;
  bio: string | null;
  avatar: Record<string, { src: string }> | null;
};

type CommentDto = {
  content: string;
  ownerProfile: OwnerProfile;
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

export type { CommentDto, OwnerProfile };
export { toTestimonial };
