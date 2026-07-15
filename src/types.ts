export interface PropertyAgent {
  name: string;
  title: string;
  image: string;
  phone: string;
  whatsapp: string;
}

export interface NearbyPlace {
  category: 'Schools' | 'Hospitals' | 'Malls';
  name: string;
  distance: string;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number; // in numeric value
  currency: 'INR' | 'USD';
  priceFormatted: string; // e.g., "1.25 Cr" or "$4,250,000"
  areaSqft: number;
  propertyType: 'Apartment' | 'Independent Villa' | 'Penthouse' | 'Commercial';
  listingStatus: 'New Launch' | 'Ready to Move' | 'Resale';
  bedrooms: number;
  bathrooms: number;
  parking: number;
  isFeatured: boolean;
  isVerified: boolean;
  isNewListing: boolean;
  isFurnished: boolean;
  isGatedCommunity: boolean;
  amenities: string[];
  description: string;
  images: string[];
  agent: PropertyAgent;
  nearby: NearbyPlace[];
  video?: string;
}

export const INITIAL_PROPERTIES: Property[] = [];
