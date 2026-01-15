import React, { useState } from 'react';
import { Calendar, Users, MapPin, ChevronDown } from 'lucide-react';
import { PropertyType } from '../types';
import { COLORS, TYPOGRAPHY, TRANSITIONS, SPACING } from '../tokens';
// import { useAuth } from '../src/auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const BookingWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PropertyType>('mountain');
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden -mt-16 relative z-30 hidden lg:block border border-gray-100 hover:shadow-3xl transition-shadow duration-300" style={{ backgroundColor: COLORS.white, color: COLORS.dark }} role="region" aria-label="Availability checker">
      {/* Tabs */}
      <div className="flex border-b border-gray-100" role="tablist">
        <motion.button
          whileHover={{ backgroundColor: "#f3f4f6" }}
          onClick={() => setActiveTab('mountain')}
          role="tab"
          aria-selected={activeTab === 'mountain'}
          className={`flex-1 py-4 text-center text-sm font-semibold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-offset-transparent ${activeTab === 'mountain' ? 'shadow-md' : 'text-gray-500'
            }`}
          style={{
            backgroundColor: activeTab === 'mountain' ? COLORS.primary : 'transparent',
            color: activeTab === 'mountain' ? COLORS.white : COLORS.gray[500],
          }}
        >
          Mountain Villas
        </motion.button>
        <motion.button
          whileHover={{ backgroundColor: "#f3f4f6" }}
          onClick={() => setActiveTab('safari')}
          role="tab"
          aria-selected={activeTab === 'safari'}
          className={`flex-1 py-4 text-center text-sm font-semibold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-offset-transparent ${activeTab === 'safari' ? 'shadow-md' : 'text-gray-500'
            }`}
          style={{
            backgroundColor: activeTab === 'safari' ? COLORS.primary : 'transparent',
            color: activeTab === 'safari' ? COLORS.white : COLORS.gray[500],
          }}
        >
          Safaris
        </motion.button>
        <motion.button
          whileHover={{ backgroundColor: "#f3f4f6" }}
          onClick={() => setActiveTab('urban')}
          role="tab"
          aria-selected={activeTab === 'urban'}
          className={`flex-1 py-4 text-center text-sm font-semibold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-offset-transparent ${activeTab === 'urban' ? 'shadow-md' : 'text-gray-500'
            }`}
          style={{
            backgroundColor: activeTab === 'urban' ? COLORS.primary : 'transparent',
            color: activeTab === 'urban' ? COLORS.white : COLORS.gray[500],
          }}
        >
          Apartments
        </motion.button>
      </div>

      {/* Form */}
      <form 
        className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end" 
        onSubmit={(e) => { e.preventDefault(); navigate('/others'); }}
        aria-label="Property booking form"
      >
        {/* Location/Type Selector */}
        <div className="relative group cursor-pointer border-r border-gray-200 pr-4">
          <label 
            className="text-xs text-gray-400 font-medium uppercase mb-1 block" 
            htmlFor="property-type"
          >
            Experience
          </label>
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 text-dark font-serif text-lg" 
              id="property-type"
              role="status"
              aria-live="polite"
            >
              <MapPin size={18} className="text-primary" aria-hidden="true" />
              <span>
                {activeTab === 'mountain' ? 'Narumoru' : activeTab === 'safari' ? 'All Parks' : 'Nairobi'}
              </span>
            </div>
            <ChevronDown size={16} className="text-gray-400 group-hover:text-primary transition-colors" aria-hidden="true" />
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
          <div className="flex items-center gap-2 text-dark font-serif text-lg">
            <Calendar size={18} className="text-primary" aria-hidden="true" />
            <input
              id="check-in-date"
              type="date"
              className="outline-none w-full text-dark font-serif bg-transparent uppercase text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded px-1"
              aria-label="Check in date"
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
          <div className="flex items-center gap-2 text-dark font-serif text-lg">
            <Calendar size={18} className="text-primary" aria-hidden="true" />
            <input
              id="check-out-date"
              type="date"
              className="outline-none w-full text-dark font-serif bg-transparent uppercase text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded px-1"
              aria-label="Check out date"
            />
          </div>
        </div>

        {/* CTA */}
        <button
          type="submit"
          className="bg-dark hover:bg-black text-white rounded-lg flex flex-col items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl py-3 lg:h-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95"
        >
          <span className="text-xs opacity-80 uppercase tracking-widest">Check</span>
          <span className="font-serif text-lg lg:text-xl italic">Availability</span>
        </button>
      </form>
    </div>
  );
};

export default BookingWidget;