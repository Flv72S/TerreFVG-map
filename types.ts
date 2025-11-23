export interface Product {
  name: string;
  category: 'Wine' | 'Cheese' | 'Meat' | 'Vegetable' | 'Honey' | 'Oil';
}

export interface Owner {
  name: string;
  role: string;
  photoUrl: string;
}

export interface Farm {
  id: string;
  name: string;
  address: string;
  description: string;
  logo: string;
  owners: Owner[];
  products: Product[];
  specialty: string; // Used for AI matching
  lat: number;
  lng: number;
  connections: string[]; // IDs of other farms they work with or recommend
}

export interface ItineraryStep {
  farmId: string;
  reason: string;
}

export interface Itinerary {
  title: string;
  description: string;
  steps: ItineraryStep[];
}

export enum AppMode {
  EXPLORE = 'EXPLORE',
  AI_CONCIERGE = 'AI_CONCIERGE',
  PASSPORT = 'PASSPORT'
}