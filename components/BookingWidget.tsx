import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, ChevronDown, AlertCircle, CheckCircle, Loader, Zap } from 'lucide-react';
import { PropertyType } from '../types';
import { COLORS, TYPOGRAPHY, TRANSITIONS, SPACING } from '../tokens';
// import { useAuth } from '../src/auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { checkPropertyAvailability } from '../services/bookingService';

interface PropertyPricing {
  pricePerNight: number;
  currency: string;
  label: string;
}

const PROPERTY_PRICING: Record<PropertyType, PropertyPricing> = {
  mountain: { pricePerNight: 60000, currency: 'KES', label: 'per night' },
  safari: { pricePerNight: 1450, currency: 'USD', label: 'per person' },
  urban: { pricePerNight: 8700, currency: 'KES', label: 'per night' },
};

const SAMPLE_PROPERTY_IDS: Record<PropertyType, string> = {
  mountain: '550e8400-e29b-41d4-a716-446655440001',
  safari: '550e8400-e29b-41d4-a716-446655440005',
  urban: '550e8400-e29b-41d4-a716-446655440003',
};

const BookingWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PropertyType>('mountain');
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [numberOfGuests, setNumberOfGuests] = useState<number>(1);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [availabilityMessage, setAvailabilityMessage] = useState<string>('');
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);
  const [numberOfNights, setNumberOfNights] = useState<number>(0);
  const [formError, setFormError] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  // Calculate estimated price and nights
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        setNumberOfNights(nights);
        const pricing = PROPERTY_PRICING[activeTab];
        setEstimatedPrice(nights * pricing.pricePerNight);
      } else {
        setNumberOfNights(0);
        setEstimatedPrice(0);
      }
    } else {
      setNumberOfNights(0);
      setEstimatedPrice(0);
    }
  }, [checkInDate, checkOutDate, activeTab]);

  // Check availability when dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!checkInDate || !checkOutDate) {
        setAvailabilityStatus('idle');
        setAvailabilityMessage('');
        return;
      }

      if (new Date(checkInDate) >= new Date(checkOutDate)) {
        setAvailabilityStatus('unavailable');
        setAvailabilityMessage('Check-out date must be after check-in date');
        return;
      }

      setAvailabilityStatus('checking');
      setIsCheckingAvailability(true);
      setFormError('');

      try {
        const result = await checkPropertyAvailability({
          propertyId: SAMPLE_PROPERTY_IDS[activeTab],
          checkInDate,
          checkOutDate,
        });

        if (result.available) {
          setAvailabilityStatus('available');
          setAvailabilityMessage(`✓ Available for ${numberOfNights} night${numberOfNights > 1 ? 's' : ''}`);
        } else {
          setAvailabilityStatus('unavailable');
          setAvailabilityMessage(result.reason || 'Property is not available for these dates');
        }
      } catch (error) {
        setAvailabilityStatus('unavailable');
        setAvailabilityMessage('Unable to check availability');
        console.error('Availability check error:', error);
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    const timer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timer);
  }, [checkInDate, checkOutDate, activeTab, numberOfNights]);

  const handleCheckAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Validate dates
    if (!checkInDate || !checkOutDate) {
      setFormError('Please select both check-in and check-out dates');
      return;
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      setFormError('Check-out date must be after check-in date');
      return;
    }

    if (availabilityStatus !== 'available') {
      setFormError('Please select dates when the property is available');
      return;
    }

    // Navigate to property page with booking params
    const propertyRoutes = {
      mountain: '/mountain-villas',
      safari: '/safaris',
      urban: '/urban-apartments',
    };

    const route = propertyRoutes[activeTab] || '/';
    navigate(route, {
      state: {
        checkInDate,
        checkOutDate,
        numberOfGuests,
        estimatedPrice,
      }
    });
  };

  return (
    <div className="hidden lg:block fixed right-8 top-32 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 z-40">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={20} style={{ color: COLORS.primary }} />
          <h3 style={{ color: COLORS.primary, fontFamily: TYPOGRAPHY.fontFamily.serif, fontSize: '1.5rem', fontWeight: 700 }} className="font-bold">
            Check Availability
          </h3>
        </div>
        <p style={{ color: COLORS.gray[600], fontSize: '0.875rem', lineHeight: TYPOGRAPHY.lineHeight.normal }}>
          Find your perfect escape
        </p>
      </div>

      <form onSubmit={handleCheckAvailability} className="p-6 space-y-5">
        {/* Property Type Tabs */}
        <div className="flex gap-3">
          {(['mountain', 'safari', 'urban'] as PropertyType[]).map((tab) => (
            <motion.button
              key={tab}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              onClick={() => {
                setActiveTab(tab);
                setAvailabilityStatus('idle');
                setCheckInDate('');
                setCheckOutDate('');
              }}
              style={{
                backgroundColor: activeTab === tab ? COLORS.primary : COLORS.primaryBg,
                color: activeTab === tab ? 'white' : COLORS.dark,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
              className="flex-1 py-2.5 rounded-lg font-medium transition-all border border-gray-200 capitalize hover:border-gray-300"
            >
              {tab}
            </motion.button>
          ))}
        </div>

        {/* Check-In Date */}
        <div className="space-y-2">
          <label style={{ color: COLORS.dark, fontSize: '0.875rem', fontWeight: 500 }} className="block font-medium">
            Check-In
          </label>
          <div className="relative">
            <Calendar
              size={18}
              style={{ color: COLORS.primary }}
              className="absolute left-3 top-3.5"
            />
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
              style={{
                borderColor: COLORS.gray[200],
                '--tw-ring-color': COLORS.primary,
              } as any}
              aria-label="Check in date"
            />
          </div>
        </div>

        {/* Check-Out Date */}
        <div className="space-y-2">
          <label style={{ color: COLORS.dark, fontSize: '0.875rem', fontWeight: 500 }} className="block font-medium">
            Check-Out
          </label>
          <div className="relative">
            <Calendar
              size={18}
              style={{ color: COLORS.primary }}
              className="absolute left-3 top-3.5"
            />
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
              style={{
                borderColor: COLORS.gray[200],
                '--tw-ring-color': COLORS.primary,
              } as any}
              aria-label="Check out date"
            />
          </div>
        </div>

        {/* Number of Guests */}
        <div className="space-y-2">
          <label style={{ color: COLORS.dark, fontSize: '0.875rem', fontWeight: 500 }} className="block font-medium">
            Guests
          </label>
          <div className="relative">
            <Users
              size={18}
              style={{ color: COLORS.primary }}
              className="absolute left-3 top-3.5"
            />
            <select
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(Number(e.target.value))}
              className="w-full pl-10 pr-10 py-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-1 appearance-none transition-all"
              style={{
                borderColor: COLORS.gray[200],
                '--tw-ring-color': COLORS.primary,
              } as any}
              aria-label="Number of guests"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              style={{ color: COLORS.gray[600] }}
              className="absolute right-3 top-3.5 pointer-events-none"
            />
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {formError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200"
            >
              <AlertCircle size={16} style={{ color: '#ef4444' }} />
              <p style={{ color: '#ef4444', fontSize: '0.75rem' }} className="font-medium text-sm">
                {formError}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Availability Status */}
        <AnimatePresence>
          {isCheckingAvailability && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <Loader size={16} className="animate-spin" style={{ color: COLORS.primary }} />
              <p style={{ color: COLORS.primary, fontSize: '0.75rem' }}>
                Checking availability...
              </p>
            </motion.div>
          )}

          {!isCheckingAvailability && availabilityStatus === 'available' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200"
            >
              <CheckCircle size={16} style={{ color: '#10b981' }} />
              <p style={{ color: '#10b981', fontSize: '0.75rem' }} className="font-medium">
                {availabilityMessage}
              </p>
            </motion.div>
          )}

          {!isCheckingAvailability && availabilityStatus === 'unavailable' && availabilityMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200"
            >
              <AlertCircle size={16} style={{ color: '#ef4444' }} />
              <p style={{ color: '#ef4444', fontSize: '0.75rem' }} className="font-medium text-sm">
                {availabilityMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Price Estimate */}
        <AnimatePresence>
          {numberOfNights > 0 && estimatedPrice > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-amber-50 rounded-lg border border-amber-100"
            >
              <div className="flex justify-between items-center mb-2">
                <span style={{ color: COLORS.gray[600], fontSize: '0.75rem' }}>
                  {numberOfNights} night{numberOfNights > 1 ? 's' : ''} × {PROPERTY_PRICING[activeTab].pricePerNight.toLocaleString()} {PROPERTY_PRICING[activeTab].currency}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-amber-200">
                <span style={{ color: COLORS.dark, fontSize: '0.875rem', fontWeight: 600 }} className="font-semibold">
                  Estimated Total:
                </span>
                <span style={{ color: COLORS.primary, fontFamily: TYPOGRAPHY.fontFamily.serif, fontSize: '1.5rem', fontWeight: 700 }} className="font-bold">
                  {PROPERTY_PRICING[activeTab].currency} {estimatedPrice.toLocaleString()}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          whileHover={{ y: availabilityStatus === 'available' ? -2 : 0 }}
          whileTap={{ y: 0 }}
          type="submit"
          disabled={availabilityStatus !== 'available'}
          style={{
            backgroundColor: availabilityStatus === 'available' ? COLORS.primary : COLORS.gray[200],
            color: availabilityStatus === 'available' ? 'white' : COLORS.gray[600],
            fontSize: '1rem',
            fontWeight: 600,
          }}
          className={`w-full py-4 rounded-lg font-semibold transition-all ${
            availabilityStatus === 'available'
              ? 'hover:shadow-lg cursor-pointer'
              : 'cursor-not-allowed opacity-60'
          }`}
        >
          {availabilityStatus === 'available' ? 'Continue to Property' : 'Select Valid Dates'}
        </motion.button>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <span style={{ color: COLORS.gray[600], fontSize: '0.75rem' }} className="flex items-center gap-1">
            <CheckCircle size={14} style={{ color: '#10b981' }} />
            Secure booking
          </span>
          <span className="text-gray-300">•</span>
          <span style={{ color: COLORS.gray[600], fontSize: '0.75rem' }} className="flex items-center gap-1">
            <Zap size={14} style={{ color: COLORS.primary }} />
            Real-time
          </span>
        </div>
      </form>
    </div>
  );
};

export default BookingWidget;