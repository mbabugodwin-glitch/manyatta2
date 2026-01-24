import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, ChevronDown, AlertCircle, CheckCircle, Loader, Zap } from 'lucide-react';
import { PropertyType } from '../types';
import { COLORS, TYPOGRAPHY, TRANSITIONS, SPACING } from '../tokens';
// import { useAuth } from '../src/auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { checkPropertyAvailability } from '../services/bookingService';
import { supabase } from '../src/lib/supabaseClient';

interface Property {
  id: string;
  name: string;
  base_price: number;
  price_per_night: number;
  cleaning_fee: number;
  service_fee_percent: number;
  tax_percent: number;
  currency: string;
  property_type: string;
}

interface PropertyPricing {
  pricePerNight: number;
  currency: string;
  cleaningFee: number;
  serviceFeePercent: number;
  taxPercent: number;
}

const PROPERTY_TYPE_MAP: Record<PropertyType, string> = {
  mountain: 'mountain',
  safari: 'safari',
  urban: 'urban',
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
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<{
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    tax: number;
    total: number;
  } | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch property by type
  useEffect(() => {
    const fetchPropertyByType = async () => {
      setLoadingProperty(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('property_type', PROPERTY_TYPE_MAP[activeTab])
          .eq('status', 'available')
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching property:', error);
          setSelectedProperty(null);
          return;
        }

        setSelectedProperty(data);
        // Reset dates when switching property type
        setCheckInDate('');
        setCheckOutDate('');
        setAvailabilityStatus('idle');
        setAvailabilityMessage('');
      } catch (err) {
        console.error('Error:', err);
        setSelectedProperty(null);
      } finally {
        setLoadingProperty(false);
      }
    };

    fetchPropertyByType();
  }, [activeTab]);

  // Calculate price breakdown
  useEffect(() => {
    if (numberOfNights > 0 && selectedProperty) {
      const subtotal = numberOfNights * selectedProperty.price_per_night;
      const cleaningFee = selectedProperty.cleaning_fee || 0;
      const serviceFee = subtotal * ((selectedProperty.service_fee_percent || 0) / 100);
      const subtotalWithFees = subtotal + cleaningFee + serviceFee;
      const tax = subtotalWithFees * ((selectedProperty.tax_percent || 0) / 100);
      const total = subtotalWithFees + tax;

      setPriceBreakdown({
        subtotal,
        cleaningFee,
        serviceFee,
        tax,
        total,
      });
      setEstimatedPrice(total);
    } else {
      setPriceBreakdown(null);
      setEstimatedPrice(0);
    }
  }, [numberOfNights, selectedProperty]);

  // Calculate estimated price and nights
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        setNumberOfNights(nights);
      } else {
        setNumberOfNights(0);
      }
    } else {
      setNumberOfNights(0);
    }
  }, [checkInDate, checkOutDate]);

  // Check availability when dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!checkInDate || !checkOutDate || !selectedProperty) {
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
          propertyId: selectedProperty.id,
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
  }, [checkInDate, checkOutDate, selectedProperty, numberOfNights]);

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

    if (!selectedProperty) {
      setFormError('Unable to load property information');
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
        propertyId: selectedProperty.id,
      }
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden -mt-16 relative z-30 hidden lg:block border border-gray-100 hover:shadow-3xl transition-shadow duration-300">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-100" role="tablist">
        {['mountain', 'safari', 'urban'].map((tab) => (
          <motion.button
            key={tab}
            type="button"
            whileHover={{ backgroundColor: '#f3f4f6' }}
            onClick={() => {
              setActiveTab(tab as PropertyType);
              setAvailabilityStatus('idle');
              setCheckInDate('');
              setCheckOutDate('');
            }}
            role="tab"
            aria-selected={activeTab === tab}
            className={`flex-1 py-4 text-center text-sm font-semibold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 ${
              activeTab === tab ? 'shadow-md' : 'text-gray-500'
            }`}
            style={{
              backgroundColor: activeTab === tab ? COLORS.primary : 'transparent',
              color: activeTab === tab ? 'white' : COLORS.gray[500],
            }}
          >
            {tab === 'mountain' ? 'Mountain Villas' : tab === 'safari' ? 'Safaris' : 'Apartments'}
          </motion.button>
        ))}
      </div>

      {/* Form - Horizontal Layout */}
      <form 
        className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
        onSubmit={handleCheckAvailability}
        aria-label="Property booking form"
      >
        {/* Location Display */}
        <div className="relative group cursor-pointer border-r border-gray-200 pr-4">
          <label 
            className="text-xs text-gray-400 font-medium uppercase mb-1 block"
            htmlFor="property-type"
          >
            Experience
          </label>
          <div 
            className="flex items-center justify-between"
            id="property-type"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 text-gray-800 font-serif text-lg">
              <MapPin size={18} style={{ color: COLORS.primary }} aria-hidden="true" />
              <span>
                {activeTab === 'mountain' ? 'Narumoru' : activeTab === 'safari' ? 'All Parks' : 'Nairobi'}
              </span>
            </div>
            <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" aria-hidden="true" />
          </div>
        </div>

        {/* Check In */}
        <div className="border-r border-gray-200 pr-4">
          <label 
            className="text-xs text-gray-400 font-medium uppercase mb-1 block"
            htmlFor="check-in-date"
          >
            Check In
          </label>
          <div className="flex items-center gap-2 text-gray-800 font-serif text-lg">
            <Calendar size={18} style={{ color: COLORS.primary }} aria-hidden="true" />
            <input
              id="check-in-date"
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="outline-none w-full text-gray-800 font-serif bg-transparent uppercase text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 rounded px-1"
              style={{ '--tw-ring-color': COLORS.primary } as any}
              aria-label="Check in date"
              required
            />
          </div>
        </div>

        {/* Check Out */}
        <div className="border-r border-gray-200 pr-4">
          <label 
            className="text-xs text-gray-400 font-medium uppercase mb-1 block"
            htmlFor="check-out-date"
          >
            Check Out
          </label>
          <div className="flex items-center gap-2 text-gray-800 font-serif text-lg">
            <Calendar size={18} style={{ color: COLORS.primary }} aria-hidden="true" />
            <input
              id="check-out-date"
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="outline-none w-full text-gray-800 font-serif bg-transparent uppercase text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 rounded px-1"
              style={{ '--tw-ring-color': COLORS.primary } as any}
              aria-label="Check out date"
              required
            />
          </div>
        </div>

        {/* Guests */}
        <div className="border-r border-gray-200 pr-4">
          <label 
            className="text-xs text-gray-400 font-medium uppercase mb-1 block"
            htmlFor="guests"
          >
            Guests
          </label>
          <div className="flex items-center gap-2 text-gray-800 font-serif text-lg">
            <Users size={18} style={{ color: COLORS.primary }} aria-hidden="true" />
            <select
              id="guests"
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
              className="outline-none w-full text-gray-800 font-serif bg-transparent text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 rounded px-1"
              style={{ '--tw-ring-color': COLORS.primary } as any}
              aria-label="Number of guests"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ y: availabilityStatus === 'available' ? -2 : 0 }}
          whileTap={{ y: 0 }}
          type="submit"
          disabled={availabilityStatus !== 'available'}
          className={`rounded-lg flex flex-col items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl py-3 lg:h-full focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 ${
            availabilityStatus !== 'available' ? 'cursor-not-allowed opacity-60' : 'hover:shadow-xl cursor-pointer'
          }`}
          style={{
            backgroundColor: availabilityStatus === 'available' ? COLORS.primary : COLORS.gray[200],
            color: availabilityStatus === 'available' ? 'white' : COLORS.gray[600],
          }}
        >
          <span className="text-xs opacity-80 uppercase tracking-widest">
            {isCheckingAvailability ? 'Checking' : 'Check'}
          </span>
          <span className="font-serif text-lg lg:text-xl italic">Availability</span>
        </motion.button>
      </form>

      {/* Status Messages & Feedback */}
      {(formError || isCheckingAvailability || availabilityStatus !== 'idle') && (
        <div className="px-6 pb-4 space-y-3">
          <AnimatePresence>
            {formError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200"
              >
                <AlertCircle size={16} style={{ color: '#ef4444' }} />
                <p style={{ color: '#ef4444', fontSize: '0.75rem' }} className="font-medium">
                  {formError}
                </p>
              </motion.div>
            )}

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
                <p style={{ color: '#ef4444', fontSize: '0.75rem' }} className="font-medium">
                  {availabilityMessage}
                </p>
              </motion.div>
            )}

            {numberOfNights > 0 && priceBreakdown && selectedProperty && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-amber-50 rounded-lg border border-amber-100"
              >
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.gray[600] }}>
                      {numberOfNights} night{numberOfNights > 1 ? 's' : ''} × {selectedProperty.price_per_night.toLocaleString()}
                    </span>
                    <span style={{ color: COLORS.gray[600] }}>
                      {selectedProperty.currency} {priceBreakdown.subtotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  {priceBreakdown.cleaningFee > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: COLORS.gray[600], fontSize: '0.75rem' }}>Cleaning Fee</span>
                      <span style={{ color: COLORS.gray[600], fontSize: '0.75rem' }}>
                        {selectedProperty.currency} {priceBreakdown.cleaningFee.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}
                  {priceBreakdown.serviceFee > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: COLORS.gray[600], fontSize: '0.75rem' }}>Service Fee ({selectedProperty.service_fee_percent}%)</span>
                      <span style={{ color: COLORS.gray[600], fontSize: '0.75rem' }}>
                        {selectedProperty.currency} {priceBreakdown.serviceFee.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}
                  {priceBreakdown.tax > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: COLORS.gray[600], fontSize: '0.75rem' }}>Tax ({selectedProperty.tax_percent}%)</span>
                      <span style={{ color: COLORS.gray[600], fontSize: '0.75rem' }}>
                        {selectedProperty.currency} {priceBreakdown.tax.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-amber-200 pt-1.5 mt-1.5 flex justify-between font-semibold">
                    <span style={{ color: COLORS.dark }}>Total</span>
                    <span style={{ color: COLORS.primary, fontSize: '1rem' }}>
                      {selectedProperty.currency} {priceBreakdown.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Trust Info */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center">
        <p style={{ color: COLORS.gray[600], fontSize: '0.75rem' }}>
          ✓ Secure booking • Real-time availability • Best price guarantee
        </p>
      </div>
    </div>
  );
};

export default BookingWidget;