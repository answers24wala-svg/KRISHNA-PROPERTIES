import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Property } from './types';

// Map database row (snake_case) to Frontend Property object (camelCase)
function mapRowToProperty(row: any): Property {
  return {
    id: String(row.id),
    title: row.title,
    location: row.location,
    price: Number(row.price),
    currency: row.currency || 'INR',
    priceFormatted: row.price_formatted,
    areaSqft: Number(row.area_sqft),
    propertyType: row.property_type,
    listingStatus: row.listing_status,
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    parking: Number(row.parking),
    isFeatured: Boolean(row.is_featured),
    isVerified: Boolean(row.is_verified),
    isNewListing: Boolean(row.is_new_listing),
    isFurnished: Boolean(row.is_furnished),
    isGatedCommunity: Boolean(row.is_gated_community),
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    description: row.description,
    images: Array.isArray(row.images) ? row.images : [],
    agent: typeof row.agent === 'object' && row.agent !== null ? row.agent : { name: '', title: '', image: '', phone: '', whatsapp: '' },
    nearby: Array.isArray(row.nearby) ? row.nearby : [],
    video: row.video || undefined,
  };
}

// Map Frontend Property object (camelCase) to database row (snake_case)
function mapPropertyToRow(prop: Property): any {
  return {
    id: prop.id,
    title: prop.title,
    location: prop.location,
    price: prop.price,
    currency: prop.currency,
    price_formatted: prop.priceFormatted,
    area_sqft: prop.areaSqft,
    property_type: prop.propertyType,
    listing_status: prop.listingStatus,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    parking: prop.parking,
    is_featured: prop.isFeatured,
    is_verified: prop.isVerified,
    is_new_listing: prop.isNewListing,
    is_furnished: prop.isFurnished,
    is_gated_community: prop.isGatedCommunity,
    amenities: prop.amenities,
    description: prop.description,
    images: prop.images,
    agent: prop.agent,
    nearby: prop.nearby,
    video: prop.video
  };
}

export const dbService = {
  isLiveDb(): boolean {
    return isSupabaseConfigured && supabase !== null;
  },

  // Read all properties
  async fetchProperties(): Promise<{ properties: Property[]; isFallback: boolean; error?: string }> {
    if (!this.isLiveDb()) {
      return { properties: [], isFallback: false, error: 'Supabase is not configured' };
    }

    try {
      const { data, error } = await supabase!
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { properties: [], isFallback: false, error: error.message };
      }

      const mapped = data ? data.map(mapRowToProperty) : [];
      return { properties: mapped, isFallback: false };
    } catch (err: any) {
      return { properties: [], isFallback: false, error: err?.message || String(err) };
    }
  },

  // Create/Add a property
  async addProperty(newProperty: Property): Promise<{ success: boolean; error?: string }> {
    if (!this.isLiveDb()) {
      return { success: false, error: 'Supabase is not configured' };
    }

    try {
      const dbRow = mapPropertyToRow(newProperty);
      const { error } = await supabase!
        .from('properties')
        .insert([dbRow]);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  },

  // Update a property
  async updateProperty(updatedProperty: Property): Promise<{ success: boolean; error?: string }> {
    if (!this.isLiveDb()) {
      return { success: false, error: 'Supabase is not configured' };
    }

    try {
      const dbRow = mapPropertyToRow(updatedProperty);
      const { error } = await supabase!
        .from('properties')
        .update(dbRow)
        .eq('id', updatedProperty.id);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  },

  // Delete a property
  async deleteProperty(id: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isLiveDb()) {
      return { success: false, error: 'Supabase is not configured' };
    }

    try {
      const { error } = await supabase!
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  }
};
