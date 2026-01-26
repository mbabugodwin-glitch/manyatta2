import { createClient } from '@supabase/supabase-js';
import { SafariLocation, SafariMapInteractionPayload, SafariMapInteraction } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch all safari locations with optional filtering
 */
export const fetchSafariLocations = async (
  region?: string
): Promise<SafariLocation[]> => {
  try {
    let query = supabase.from('safari_locations').select('*').order('name');

    if (region) {
      query = query.eq('region', region);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching safari locations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching safari locations:', error);
    return [];
  }
};

/**
 * Fetch a single safari location by ID
 */
export const fetchSafariLocationById = async (
  locationId: string
): Promise<SafariLocation | null> => {
  try {
    const { data, error } = await supabase
      .from('safari_locations')
      .select('*')
      .eq('id', locationId)
      .single();

    if (error) {
      console.error('Error fetching safari location:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Unexpected error fetching safari location:', error);
    return null;
  }
};

/**
 * Fetch safari locations by region
 */
export const fetchSafariLocationsByRegion = async (
  region: string
): Promise<SafariLocation[]> => {
  try {
    const { data, error } = await supabase
      .from('safari_locations')
      .select('*')
      .eq('region', region)
      .order('name');

    if (error) {
      console.error('Error fetching safari locations by region:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching safari locations by region:', error);
    return [];
  }
};

/**
 * Get unique regions from safari locations
 */
export const fetchSafariRegions = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('safari_locations')
      .select('region')
      .order('region');

    if (error) {
      console.error('Error fetching safari regions:', error);
      return [];
    }

    // Remove duplicates
    const regions = data?.map(item => item.region) || [];
    return [...new Set(regions)];
  } catch (error) {
    console.error('Unexpected error fetching safari regions:', error);
    return [];
  }
};

/**
 * Track user interaction with safari map
 * Calls the edge function to log interactions
 */
export const trackSafariMapInteraction = async (
  payload: SafariMapInteractionPayload
): Promise<SafariMapInteraction | null> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      'safari-map-interactions',
      {
        body: {
          locationId: payload.locationId,
          interactionType: payload.interactionType,
          metadata: payload.metadata || {},
        },
      }
    );

    if (error) {
      console.error('Error tracking safari map interaction:', error);
      return null;
    }

    return data as SafariMapInteraction;
  } catch (error) {
    console.error('Unexpected error tracking interaction:', error);
    return null;
  }
};

/**
 * Search safari locations by keyword
 */
export const searchSafariLocations = async (
  searchTerm: string
): Promise<SafariLocation[]> => {
  try {
    const { data, error } = await supabase
      .from('safari_locations')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('name');

    if (error) {
      console.error('Error searching safari locations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error searching safari locations:', error);
    return [];
  }
};

/**
 * Get user's safari map interaction history
 */
export const getUserSafariInteractionHistory = async (
  limit: number = 50
): Promise<SafariMapInteraction[]> => {
  try {
    const { data, error } = await supabase
      .from('safari_map_interactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching interaction history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching interaction history:', error);
    return [];
  }
};

/**
 * Get popular safari locations based on interaction count
 */
export const getPopularSafariLocations = async (
  limit: number = 10
): Promise<{ location: SafariLocation; interactionCount: number }[]> => {
  try {
    // Use the RPC function to get popular locations
    const { data: interactions, error: interactionError } = await supabase.rpc(
      'get_popular_safari_locations',
      { p_limit: limit }
    );

    if (interactionError) {
      console.error('Error fetching interaction counts:', interactionError);
      return [];
    }

    // Get location details for each interaction
    const results = await Promise.all(
      (interactions || []).map(async (interaction) => {
        const location = await fetchSafariLocationById(interaction.location_id);
        return {
          location: location!,
          interactionCount: interaction.interaction_count || 0,
        };
      })
    );

    return results.filter(r => r.location !== null);
  } catch (error) {
    console.error('Unexpected error getting popular locations:', error);
    return [];
  }
};

/**
 * Get safari location with lodging options
 */
export const fetchSafariLocationWithLodging = async (
  locationId: string
): Promise<SafariLocation | null> => {
  return fetchSafariLocationById(locationId);
};

/**
 * Check if location has available properties for booking
 */
export const checkLocationAvailability = async (
  locationId: string,
  checkInDate: string,
  checkOutDate: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('property_id', locationId)
      .in('status', ['pending', 'confirmed'])
      .or(
        `and(check_in_date.lte.${checkOutDate},check_out_date.gte.${checkInDate})`
      );

    if (error) {
      console.error('Error checking availability:', error);
      // Return true to allow booking - the Booking page will do the final check
      return true;
    }

    // Location is available if there are no conflicting bookings
    return !data || data.length === 0;
  } catch (error) {
    console.error('Unexpected error checking availability:', error);
    // Return true to allow booking - the Booking page will do the final check
    return true;
  }
};
