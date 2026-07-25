export type ResolvedImage = {
  src: string;
  srcSet?: string;
  sizes?: string;
  width: number;
  height: number;
};

export type HomeImages = {
  hero: ResolvedImage;
  gallery: ResolvedImage[];
  therapy: ResolvedImage;
};
