export type EventId = string;

export type EventCategory =
  | 'Concert'
  | 'Festival'
  | 'Sports'
  | 'Culture'
  | 'Theatre'
  | 'Food & Drink';

export type Coordinates = { lat: number; lng: number };

export type EventAddress = {
  street: string;
  number: string;
  postalCode: string;
  city: string;
};

export type GeoStatus = 'idle' | 'loading' | 'success' | 'error';

export type CreateEventData = {
  name: string;
  description?: string;
  category: EventCategory;
  startDateTime: string;
  endDateTime?: string;
  address: EventAddress;
  coordinates: Coordinates;
  externalLink?: string;
  imageUrl?: string;
  keywords: string[];
  organizerInfo?: string;
};
