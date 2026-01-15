import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Map, Clock, ArrowRight, Compass, ChevronDown, ChevronUp, MapPin, BedDouble } from 'lucide-react';
import { SAFARI_ITINERARIES } from '../constants';
import SectionHeader from '../components/SectionHeader';
import OptimizedImage from '../components/OptimizedImage';
import GlareHover from '../components/GlareHover';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const Safaris: React.FC = () => {
  const [expandedItinerary, setExpandedItinerary] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

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
                          navigate('/others');
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

      {/* Map Viz Placeholder */}
      <section className="py-20 bg-black text-white text-center">
        <div className="container mx-auto px-6">
          <div className="bg-gray-900 rounded-xl p-8 max-w-5xl mx-auto border border-gray-800 relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
            {/* Abstract Map UI */}
            <div className="absolute inset-0 opacity-20">
              {/* Just lines and dots to simulate a map */}
              <svg className="w-full h-full" viewBox="0 0 800 400">
                <path d="M100,300 Q250,100 400,200 T700,150" fill="none" stroke="#DD5536" strokeWidth="2" strokeDasharray="5,5" />
                <circle cx="100" cy="300" r="4" fill="white" />
                <circle cx="400" cy="200" r="4" fill="white" />
                <circle cx="700" cy="150" r="4" fill="white" />
              </svg>
            </div>

            <Map size={48} className="text-primary mb-6 relative z-10" />
            <h2 className="font-serif text-3xl mb-4 relative z-10">Interactive Safari Map</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8 relative z-10">
              Visualize your journey from the highlands to the plains. See how our properties connect to key wildlife corridors.
            </p>
            <button className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-full font-bold uppercase text-sm tracking-widest relative z-10 transition-colors">
              Explore Route
            </button>
          </div>
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
