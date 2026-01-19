import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Property {
  id: string;
  type: 'mountain' | 'safari' | 'urban';
  name: string;
  description?: string;
  location: string;
  pricePerNight: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  featuredImageUrl?: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch all properties or filter by type
 */
export const getProperties = async (type?: 'mountain' | 'safari' | 'urban'): Promise<Property[]> => {
  try {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('is_available', true);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }

    return (data || []).map(mapPropertyData);
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

/**
 * Get a single property by ID
 */
export const getPropertyById = async (propertyId: string): Promise<Property | null> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch property: ${error.message}`);
    }

    return data ? mapPropertyData(data) : null;
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
};

/**
 * Get properties by type with pagination
 */
export const getPropertiesByType = async (
  type: 'mountain' | 'safari' | 'urban',
  limit: number = 10,
  offset: number = 0
): Promise<{ properties: Property[]; total: number }> => {
  try {
    // Get count
    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('type', type)
      .eq('is_available', true);

    // Get paginated results
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('type', type)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }

    return {
      properties: (data || []).map(mapPropertyData),
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching properties by type:', error);
    throw error;
  }
};

/**
 * Get featured properties
 */
export const getFeaturedProperties = async (limit: number = 6): Promise<Property[]> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_available', true)
      .limit(limit)
      .order('rating', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch featured properties: ${error.message}`);
    }

    return (data || []).map(mapPropertyData);
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    throw error;
  }
};

/**
 * Search properties
 */
export const searchProperties = async (
  searchTerm: string,
  type?: 'mountain' | 'safari' | 'urban'
): Promise<Property[]> => {
  try {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('is_available', true)
      .or(
        `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`
      );

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.limit(20);

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    return (data || []).map(mapPropertyData);
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

/**
 * Map database property to frontend Property interface
 */
function mapPropertyData(dbProperty: any): Property {
  return {
    id: dbProperty.id,
    type: dbProperty.type,
    name: dbProperty.name,
    description: dbProperty.description,
    location: dbProperty.location,
    pricePerNight: parseFloat(dbProperty.price_per_night),
    capacity: dbProperty.capacity,
    bedrooms: dbProperty.bedrooms,
    bathrooms: dbProperty.bathrooms,
    amenities: dbProperty.amenities || [],
    images: dbProperty.images || [],
    featuredImageUrl: dbProperty.featured_image_url,
    rating: parseFloat(dbProperty.rating || '0'),
    reviewCount: dbProperty.review_count || 0,
    isAvailable: dbProperty.is_available,
    createdAt: dbProperty.created_at,
    updatedAt: dbProperty.updated_at,
  };
}
