import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Map, Clock, ArrowRight, Compass, ChevronDown, ChevronUp, MapPin, BedDouble, Search, Calendar, Users, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { SAFARI_ITINERARIES } from '../constants';
import SectionHeader from '../components/SectionHeader';
import OptimizedImage from '../components/OptimizedImage';
import GlareHover from '../components/GlareHover';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  fetchSafariLocations,
  fetchSafariRegions,
  trackSafariMapInteraction,
  checkLocationAvailability,
} from '../services/safariMapService';
import { SafariLocation } from '../types';

const Safaris: React.FC = () => {
  const [expandedItinerary, setExpandedItinerary] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Safari Map State
  const [mapLocations, setMapLocations] = useState<SafariLocation[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<SafariLocation | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);
  const [mapViewMode, setMapViewMode] = useState<'grid' | 'list'>('grid');
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [guests, setGuests] = useState<number>(2);

  // Load safari locations and regions
  useEffect(() => {
    const loadSafariData = async () => {
      try {
        setMapLoading(true);
        setMapError(null);

        // Fetch regions and locations
        const regionsData = await fetchSafariRegions();
        setRegions(regionsData);

        const locationsData = await fetchSafariLocations();
        setMapLocations(locationsData);

        // Track page view
        await trackSafariMapInteraction({
          locationId: 'safaris-page',
          interactionType: 'view',
        });
      } catch (err) {
        console.error('Error loading safari data:', err);
        setMapError('Failed to load safari locations.');
      } finally {
        setMapLoading(false);
      }
    };

    loadSafariData();
  }, []);

  // Filter locations based on region and search
  const filteredLocations = mapLocations.filter(location => {
    const matchesRegion = !selectedRegion || location.region === selectedRegion;
    const matchesSearch =
      !searchTerm ||
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  // Handle location click
  const handleLocationClick = useCallback(
    async (location: SafariLocation) => {
      setSelectedLocation(location);
      await trackSafariMapInteraction({
        locationId: location.id,
        interactionType: 'click',
        metadata: { region: location.region },
      });
    },
    []
  );

  // Handle location hover
  const handleLocationHover = useCallback((locationId: string | null) => {
    setHoveredLocationId(locationId);
    if (locationId) {
      trackSafariMapInteraction({
        locationId: locationId,
        interactionType: 'hover',
      }).catch(err => console.error('Failed to track hover:', err));
    }
  }, []);

  // Handle booking
  const handleMapBooking = useCallback(
    async (location: SafariLocation) => {
      try {
        if (!checkInDate || !checkOutDate) {
          setMapError('Please select check-in and check-out dates');
          return;
        }

        const isAvailable = await checkLocationAvailability(
          location.id,
          checkInDate,
          checkOutDate
        );

        if (!isAvailable) {
          setMapError('This location is not available for the selected dates');
          return;
        }

        // Track interaction in background (don't await)
        trackSafariMapInteraction({
          locationId: location.id,
          interactionType: 'booking_initiated',
          metadata: { checkInDate, checkOutDate, guests },
        }).catch(err => console.error('Failed to track booking:', err));

        // Navigate to booking immediately
        navigate('/booking', {
          state: {
            propertyId: location.id,
            propertyType: 'safari',
            propertyName: location.name,
            checkInDate,
            checkOutDate,
            numberOfGuests: guests,
          },
        });
      } catch (err) {
        console.error('Booking error:', err);
        setMapError('An error occurred while processing your booking. Please try again.');
      }
    },
    [checkInDate, checkOutDate, guests, navigate]
  );

  // Handle info opened
  const handleInfoOpened = useCallback((location: SafariLocation) => {
    trackSafariMapInteraction({
      locationId: location.id,
      interactionType: 'info_opened',
    }).catch(err => console.error('Failed to track info opened:', err));
  }, []);

  // Validate dates
  const isDatesValid = checkInDate && checkOutDate && new Date(checkOutDate) > new Date(checkInDate);

  const toggleItinerary = (id: string) => {
    setExpandedItinerary(expandedItinerary === id ? null : id);
  };

  return (
    <div className="w-full">
      <Helmet>
        <title>Safari Experiences | Kenya Wildlife Tours | New Manyatta Kenya</title>
        <meta name="description" content="Experience the thrill of Kenya safaris with New Manyatta. Explore Tsavo, Amboseli, and Maasai Mara. Curated itineraries for unforgettable wildlife adventures." />
        <meta name="keywords" content="Kenya safaris, wildlife tours, Tsavo safari, Amboseli safari, Maasai Mara, safari itineraries" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Safari Experiences | Kenya Wildlife Adventures" />
        <meta property="og:description" content="Curated safari experiences across Kenya's best national parks" />
        <meta property="og:image" content="https://www.onthegotours.com/repository/Tsavo-West-National-Park-watering-hole--Kenya-safaris--On-The-Go-Tours-831311706788391_crop_flip_2250_1200_f2f2f2_center-center.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://newmanyattakenya.com/#/safaris" />
      </Helmet>
      {/* Hero */}
      <div className="relative h-[60vh] w-full bg-dark overflow-hidden">
        <OptimizedImage
          src="https://www.onthegotours.com/repository/Tsavo-West-National-Park-watering-hole--Kenya-safaris--On-The-Go-Tours-831311706788391_crop_flip_2250_1200_f2f2f2_center-center.jpg"
          alt="Safari"
          className="opacity-60"
          fill
          priority
          objectFit="cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <span className="text-primary text-sm font-bold tracking-[0.3em] uppercase mb-4">Journeys That Transform</span>
          <h1 className="font-serif text-5xl md:text-7xl text-white max-w-4xl leading-tight">
            Your Journey, <br /> <span className="italic">Our Story</span>
          </h1>
        </div>
      </div>

      {/* Philosophy */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <p className="font-serif text-2xl md:text-3xl text-dark leading-relaxed">
            "With over 25 years of expertise in Safaris, we have mastered the art of curating fun
exceptional journey experiences. Our deep-rooted knowledge and passion for Kenya's
landscapes, wildlife, and cultures ensure that every adventure is enriching and unforgettable."
          </p>
        </div>
      </section>

      {/* Interactive Itineraries */}
      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6">
          <SectionHeader title="Curated Itineraries" subtitle="Interactive Builder" />

          <div className="grid gap-12">
            {SAFARI_ITINERARIES.map((itinerary) => (
              <motion.div 
                key={itinerary.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary/20 hover:-translate-y-2 cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image Section */}
                  <div className="w-full md:w-2/5 h-64 md:h-auto relative">
                    <GlareHover
                      glareColor="#ffffff"
                      glareOpacity={0.2}
                      glareAngle={-30}
                      glareSize={400}
                      transitionDuration={700}
                      playOnce={false}
                    >
                      <OptimizedImage
                        src={itinerary.image}
                        alt={itinerary.title}
                        className=""
                        fill
                        objectFit="cover"
                      />
                    </GlareHover>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                      <Clock size={14} className="text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wide">{itinerary.duration}</span>
                    </div>
                  </div>

                  {/* Summary Section */}
                  <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-serif text-3xl text-dark">{itinerary.title}</h3>
                      <span className="bg-orange-50 text-primary px-4 py-2 rounded-lg font-bold text-sm">
                        {itinerary.pricePerPerson} <span className="text-xs font-normal">/ pp</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {itinerary.locations.map((loc, i) => (
                        <span key={i} className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
                          {loc}
                        </span>
                      ))}
                    </div>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                      {itinerary.description}
                    </p>

                    <div className="flex gap-4">
                      <button
                        onClick={() => toggleItinerary(itinerary.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all uppercase tracking-wide ${expandedItinerary === itinerary.id
                          ? 'bg-dark text-white shadow-lg'
                          : 'border border-primary text-primary hover:bg-primary/10 hover:shadow-md'
                          }`}
                      >
                        {expandedItinerary === itinerary.id ? 'Close Itinerary' : 'View Day-by-Day'}
                        {expandedItinerary === itinerary.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button
                        className="flex-1 bg-primary hover:bg-[#c4492e] text-white px-6 py-3 rounded-lg text-sm font-medium transition-all uppercase tracking-wide shadow-md hover:shadow-lg active:scale-95"
                        onClick={() => {
                          if (!checkInDate || !checkOutDate) {
                            setMapError('Please select check-in and check-out dates');
                            return;
                          }
                          navigate('/booking', {
                            state: {
                              propertyId: itinerary.id,
                              propertyType: 'safari',
                              propertyName: itinerary.title,
                              checkInDate,
                              checkOutDate,
                              numberOfGuests: guests,
                            },
                          });
                        }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedItinerary === itinerary.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-b from-stone-50 to-white border-t border-gray-200 overflow-hidden"
                    >
                      <div className="p-8 md:p-10">
                        <h4 className="font-serif text-xl mb-6 text-dark border-b border-gray-200 pb-2">Daily Schedule</h4>
                        <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:h-full before:w-0.5 before:bg-gray-200">
                          {itinerary.days.map((day) => (
                            <div key={day.day} className="relative flex gap-6">
                              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0 z-10 shadow-sm border-4 border-stone-50">
                                {day.day}
                              </div>
                              <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
                                <h5 className="font-bold text-dark mb-2 text-lg">{day.title}</h5>
                                <div className="space-y-2 mb-4">
                                  {day.activities.map((act, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                                      {act}
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider pt-4 border-t border-gray-100">
                                  <BedDouble size={14} /> Lodging: <span className="text-primary">{day.lodging}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Safari Map Section */}
      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6">
          <SectionHeader title="Interactive Safari Locations" subtitle="Explore & Book Direct" />

          {/* Error Message */}
          {mapError && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-900">{mapError}</p>
            </div>
          )}

          {/* Filters */}
          <div className="mb-12 bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-dark mb-6">Plan Your Safari</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Dates */}
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Check-in Date
                  </span>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={e => setCheckInDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Check-out Date
                  </span>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={e => setCheckOutDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </label>
              </div>

              {/* Guests & Search */}
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Number of Guests
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={guests}
                    onChange={e => setGuests(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search Locations
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </label>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <select
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setMapViewMode('grid')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    mapViewMode === 'grid'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setMapViewMode('list')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    mapViewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {mapLoading && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading safari locations...</p>
            </div>
          )}

          {/* Grid View */}
          {!mapLoading && mapViewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLocations.map(location => (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
                    hoveredLocationId === location.id
                      ? 'border-primary shadow-xl'
                      : 'border-transparent'
                  }`}
                  onMouseEnter={() => handleLocationHover(location.id)}
                  onMouseLeave={() => handleLocationHover(null)}
                  onClick={() => {
                    handleLocationClick(location);
                    handleInfoOpened(location);
                  }}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden group">
                    {location.imageUrl ? (
                      <img
                        src={location.imageUrl}
                        alt={location.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <MapPin className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {location.region}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-dark mb-2">{location.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {location.description}
                    </p>

                    <div className="space-y-2 mb-4 text-xs text-gray-600">
                      {location.distance_from_nairobi && (
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" />
                          {location.distance_from_nairobi}
                        </p>
                      )}
                      {location.wildlife && location.wildlife.length > 0 && (
                        <p>
                          <span className="font-medium">Wildlife:</span> {location.wildlife.slice(0, 2).join(', ')}
                          {location.wildlife.length > 2 && '...'}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleMapBooking(location);
                      }}
                      disabled={!isDatesValid}
                      className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                        isDatesValid
                          ? 'bg-primary text-white hover:bg-[#c4492e]'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isDatesValid ? (
                        <>
                          Book Now
                          <ChevronRight className="w-4 h-4" />
                        </>
                      ) : (
                        'Select Dates'
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* List View */}
          {!mapLoading && mapViewMode === 'list' && (
            <div className="space-y-4">
              {filteredLocations.map(location => (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border-l-4 border-primary"
                  onClick={() => {
                    handleLocationClick(location);
                    handleInfoOpened(location);
                  }}
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-shrink-0 w-full sm:w-40 h-32 rounded-lg overflow-hidden bg-gray-200">
                      {location.imageUrl ? (
                        <img
                          src={location.imageUrl}
                          alt={location.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-dark">{location.name}</h3>
                        <p className="text-sm text-gray-600">{location.region}</p>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{location.description}</p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-xs text-gray-600">
                        {location.distance_from_nairobi && (
                          <p className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" />
                            {location.distance_from_nairobi}
                          </p>
                        )}
                        {location.best_time_to_visit && (
                          <p className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            {location.best_time_to_visit}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleMapBooking(location);
                        }}
                        disabled={!isDatesValid}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors inline-flex items-center gap-2 ${
                          isDatesValid
                            ? 'bg-primary text-white hover:bg-[#c4492e]'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isDatesValid ? (
                          <>
                            Book Now
                            <ChevronRight className="w-4 h-4" />
                          </>
                        ) : (
                          'Select Dates'
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!mapLoading && filteredLocations.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-600 mb-2">No locations found</p>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          )}

          {/* Results Count */}
          {!mapLoading && filteredLocations.length > 0 && (
            <div className="mt-6 text-sm text-gray-600 text-center">
              Showing <span className="font-semibold text-dark">{filteredLocations.length}</span> of{' '}
              <span className="font-semibold text-dark">{mapLocations.length}</span> locations
            </div>
          )}

          {/* Location Details Modal */}
          {selectedLocation && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedLocation(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-dark">{selectedLocation.name}</h2>
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6">
                  {selectedLocation.imageUrl && (
                    <img
                      src={selectedLocation.imageUrl}
                      alt={selectedLocation.name}
                      className="w-full h-80 object-cover rounded-lg mb-6"
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Region</p>
                      <p className="font-semibold text-dark">{selectedLocation.region}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Distance from Nairobi</p>
                      <p className="font-semibold text-dark">
                        {selectedLocation.distance_from_nairobi || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Best Time to Visit</p>
                      <p className="font-semibold text-dark">
                        {selectedLocation.best_time_to_visit || 'Year-round'}
                      </p>
                    </div>
                  </div>

                  {selectedLocation.description && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-2 font-semibold">Description</p>
                      <p className="text-gray-700 leading-relaxed">{selectedLocation.description}</p>
                    </div>
                  )}

                  {selectedLocation.wildlife && selectedLocation.wildlife.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-3 font-semibold">Wildlife</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedLocation.wildlife.map((animal, idx) => (
                          <span
                            key={idx}
                            className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {animal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLocation.lodging && selectedLocation.lodging.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-3 font-semibold">Lodging Options</p>
                      <div className="space-y-3">
                        {selectedLocation.lodging.map((lodge: any, idx: number) => (
                          <div key={idx} className="border border-gray-200 rounded-lg p-3">
                            <p className="font-medium text-dark">{lodge.name}</p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-600 capitalize">{lodge.type}</span>
                              <span className="text-sm font-semibold text-primary">{lodge.pricePerNight}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedLocation(null);
                      handleMapBooking(selectedLocation);
                    }}
                    disabled={!isDatesValid}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                      isDatesValid
                        ? 'bg-primary hover:bg-[#c4492e]'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isDatesValid ? 'Proceed to Booking' : 'Select Dates to Book'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Customization CTA */}
      <section className="py-20 bg-primary text-white text-center">
        <div className="container mx-auto px-6">
          <Compass size={48} className="mx-auto mb-6 text-white/80" />
          <h2 className="font-serif text-4xl mb-6">Create Your Own Path</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Want to combine a beach holiday with a mountain trek? Or a city tour with a game drive? Our concierge team builds bespoke itineraries.
          </p>
          <button className="bg-dark hover:bg-black text-white px-10 py-4 rounded-full font-bold uppercase text-sm tracking-widest inline-flex items-center gap-2">
            Customize Your Safari <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Safaris;
