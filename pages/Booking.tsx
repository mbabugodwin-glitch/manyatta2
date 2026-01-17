import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, CreditCard, AlertCircle, CheckCircle, Loader, ArrowLeft } from 'lucide-react';
import { useAuth } from '../src/auth/AuthContext';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, TRANSITIONS, SHADOWS, SPACING } from '../tokens';
import { PropertyType } from '../types';

interface BookingData {
  propertyId: string;
  propertyType: PropertyType;
  propertyName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  currency: string;
  specialRequests?: string;
}

const Booking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'confirmation'>('details');

  // Initialize booking data from route state or search params
  useEffect(() => {
    const state = location.state as BookingData | null;
    
    if (state) {
      setBookingData(state);
    } else if (searchParams.has('propertyId')) {
      // Reconstruct from search params if needed
      const data: BookingData = {
        propertyId: searchParams.get('propertyId') || '',
        propertyType: (searchParams.get('propertyType') as PropertyType) || 'mountain',
        propertyName: searchParams.get('propertyName') || '',
        checkInDate: searchParams.get('checkInDate') || '',
        checkOutDate: searchParams.get('checkOutDate') || '',
        numberOfGuests: parseInt(searchParams.get('numberOfGuests') || '1'),
        totalPrice: parseFloat(searchParams.get('totalPrice') || '0'),
        currency: searchParams.get('currency') || 'KES',
        specialRequests: searchParams.get('specialRequests') || '',
      };
      setBookingData(data);
    } else {
      navigate('/');
    }
  }, [location.state, searchParams, navigate]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleCreateBooking = async () => {
    if (!bookingData || !user) return;

    try {
      setError(null);
      setIsSubmitting(true);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/create_booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          property_id: bookingData.propertyId,
          property_type: bookingData.propertyType,
          check_in_date: bookingData.checkInDate,
          check_out_date: bookingData.checkOutDate,
          number_of_guests: bookingData.numberOfGuests,
          total_price: bookingData.totalPrice,
          currency: bookingData.currency,
          special_requests: bookingData.specialRequests || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      setSuccess(true);
      setCurrentStep('confirmation');

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/profile', { replace: true });
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create booking';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !bookingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full"
        />
      </div>
    );
  }

  const nights = Math.ceil(
    (new Date(bookingData.checkOutDate).getTime() - new Date(bookingData.checkInDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-32 pb-16">
      <Helmet>
        <title>Confirm Booking | New Manyatta Kenya</title>
        <meta name="description" content="Complete your booking at New Manyatta Kenya" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ x: -4 }}
          className="mb-8 flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {currentStep === 'details' ? 'Review Your Booking' : 'Booking Confirmed!'}
          </h1>
          <p className="text-gray-600">
            {currentStep === 'details' 
              ? 'Please review your booking details before confirming' 
              : 'Your booking has been successfully created'}
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        {currentStep === 'details' ? (
          <>
            {/* Booking Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-8 mb-6"
            >
              {/* Property Info */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h2 className="text-2xl font-serif text-gray-900 mb-2">{bookingData.propertyName}</h2>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin size={16} />
                  <span className="capitalize">{bookingData.propertyType} Property</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Check-in */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-primary" />
                    <label className="text-xs font-semibold text-gray-500 uppercase">Check-In</label>
                  </div>
                  <p className="text-lg font-serif text-gray-900">
                    {new Date(bookingData.checkInDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Check-out */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-primary" />
                    <label className="text-xs font-semibold text-gray-500 uppercase">Check-Out</label>
                  </div>
                  <p className="text-lg font-serif text-gray-900">
                    {new Date(bookingData.checkOutDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Guests */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-primary" />
                    <label className="text-xs font-semibold text-gray-500 uppercase">Guests</label>
                  </div>
                  <p className="text-lg font-serif text-gray-900">{bookingData.numberOfGuests}</p>
                </div>

                {/* Duration */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-primary" />
                    <label className="text-xs font-semibold text-gray-500 uppercase">Duration</label>
                  </div>
                  <p className="text-lg font-serif text-gray-900">{nights} night{nights !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Special Requests */}
              {bookingData.specialRequests && (
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Special Requests</label>
                  <p className="text-gray-700 leading-relaxed">{bookingData.specialRequests}</p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {bookingData.currency} {(bookingData.totalPrice / nights).toFixed(2)} × {nights} night{nights !== 1 ? 's' : ''}
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {bookingData.currency} {bookingData.totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-primary/20 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        {bookingData.currency} {bookingData.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.button
                onClick={() => navigate(-1)}
                whileHover={{ y: -2 }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleCreateBooking}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg transition-colors hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Creating Booking...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Confirm Booking
                  </>
                )}
              </motion.button>
            </div>
          </>
        ) : (
          <>
            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-8 text-center mb-6"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full"
              >
                <CheckCircle className="w-8 h-8 text-green-600" />
              </motion.div>

              <h2 className="text-2xl font-serif text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-6">
                Your booking has been successfully created. A confirmation email has been sent to {user?.email}
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Booking Reference</p>
                <p className="font-mono font-bold text-gray-900 text-lg">
                  {bookingData.propertyId.toUpperCase().slice(0, 8)}
                </p>
              </div>

              <p className="text-sm text-gray-500">
                Redirecting to your profile in a moment...
              </p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Booking;
