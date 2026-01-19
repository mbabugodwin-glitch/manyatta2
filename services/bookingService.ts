import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface BookingPayload {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  currency: string;
  specialRequests?: string;
}

export interface BookingResponse {
  id: string;
  userId: string;
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface AvailabilityCheckPayload {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
}

/**
 * Check property availability across bookings and unavailability table
 */
export const checkPropertyAvailability = async (
  payload: AvailabilityCheckPayload
): Promise<{ available: boolean; reason?: string }> => {
  try {
    // Check against bookings table for confirmed/pending bookings
    const { data: conflictingBookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('property_id', payload.propertyId)
      .in('status', ['pending', 'confirmed'])
      .or(
        `and(check_in_date.lte.${payload.checkOutDate},check_out_date.gte.${payload.checkInDate})`
      );

    if (bookingError) {
      console.error('Booking availability check error:', bookingError);
      return { available: false, reason: 'Unable to check availability' };
    }

    if (conflictingBookings && conflictingBookings.length > 0) {
      return { available: false, reason: 'Property is already booked for these dates' };
    }

    // Check against property_unavailability table
    const { data: unavailablePeriods, error: unavailabilityError } = await supabase
      .from('property_unavailability')
      .select('id')
      .eq('property_id', payload.propertyId)
      .or(
        `and(start_date.lte.${payload.checkOutDate},end_date.gte.${payload.checkInDate})`
      );

    if (unavailabilityError) {
      console.error('Unavailability check error:', unavailabilityError);
      return { available: false, reason: 'Unable to check availability' };
    }

    if (unavailablePeriods && unavailablePeriods.length > 0) {
      return { available: false, reason: 'Property is unavailable for these dates' };
    }

    return { available: true };
  } catch (error) {
    console.error('Unexpected error checking availability:', error);
    return { available: false, reason: 'Unexpected error checking availability' };
  }
};

/**
 * Create a new booking with payment and history records
 * This should ideally be called via a Supabase RPC function for atomicity
 */
export const createBooking = async (
  userId: string,
  payload: BookingPayload
): Promise<BookingResponse> => {
  try {
    // First check availability
    const availability = await checkPropertyAvailability({
      propertyId: payload.propertyId,
      checkInDate: payload.checkInDate,
      checkOutDate: payload.checkOutDate,
    });

    if (!availability.available) {
      throw new Error(availability.reason || 'Property is not available for selected dates');
    }

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        property_id: payload.propertyId,
        check_in_date: payload.checkInDate,
        check_out_date: payload.checkOutDate,
        number_of_guests: payload.numberOfGuests,
        total_price: payload.totalPrice,
        currency: payload.currency,
        special_requests: payload.specialRequests || null,
        status: 'pending',
      })
      .select()
      .single();

    if (bookingError) {
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from('booking_payments')
      .insert({
        booking_id: booking.id,
        amount: payload.totalPrice,
        currency: payload.currency,
        payment_method: 'pending',
        payment_status: 'pending',
        created_at: new Date().toISOString(),
      });

    if (paymentError) {
      console.error('Payment record creation failed:', paymentError);
      // Don't throw - payment record can be created separately
    }

    // Create booking history entry
    const { error: historyError } = await supabase
      .from('booking_history')
      .insert({
        booking_id: booking.id,
        action: 'created',
        previous_status: null,
        new_status: 'pending',
        timestamp: new Date().toISOString(),
        notes: 'Booking created by user',
      });

    if (historyError) {
      console.error('Booking history record creation failed:', historyError);
      // Don't throw - history is non-critical
    }

    return {
      id: booking.id,
      userId: booking.user_id,
      propertyId: booking.property_id,
      checkInDate: booking.check_in_date,
      checkOutDate: booking.check_out_date,
      status: booking.status,
      createdAt: booking.created_at,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create booking';
    throw new Error(message);
  }
};

/**
 * Get user's bookings
 */
export const getUserBookings = async (userId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, properties(name, location)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return data;
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (updateError) {
      throw new Error(`Failed to cancel booking: ${updateError.message}`);
    }

    // Add history entry
    const { error: historyError } = await supabase
      .from('booking_history')
      .insert({
        booking_id: bookingId,
        action: 'cancelled',
        previous_status: 'pending',
        new_status: 'cancelled',
        timestamp: new Date().toISOString(),
        notes: 'Booking cancelled by user',
      });

    if (historyError) {
      console.error('Failed to create cancellation history:', historyError);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cancel booking';
    throw new Error(message);
  }
};
