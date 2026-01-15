import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight, Mountain, Binoculars, Building2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import BookingWidget from '../components/BookingWidget';
import SectionHeader from '../components/SectionHeader';
import OptimizedImage from '../components/OptimizedImage';
// import { useAuth } from '../src/auth/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-full">
      <Helmet>
        <title>New Manyatta Kenya | Mountain Villas, Safaris & Urban Apartments</title>
        <meta name="description" content="Discover New Manyatta Kenya - luxury mountain villas in Narumoru, exclusive safari experiences, and premium apartments in Nairobi. Book your unforgettable Kenyan retreat today." />
        <meta name="keywords" content="Kenya villas, mountain villas Narumoru, safari experiences, luxury apartments Nairobi, Manyatta Kenya" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="New Manyatta Kenya | Luxury Properties & Experiences" />
        <meta property="og:description" content="Luxury mountain villas, safaris, and premium apartments in Kenya" />
        <meta property="og:image" content="https://picsum.photos/seed/kenyahero/1200/630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="New Manyatta Kenya" />
        <meta name="twitter:description" content="Discover luxury properties and experiences in Kenya" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://newmanyattakenya.com/" />
      </Helmet>
      {/* Hero Section */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Mock Video Background (using image with scale animation) */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        >
          <OptimizedImage
            src="https://picsum.photos/seed/kenyahero/1920/1080"
            alt="Kenya Landscape"
            className="w-full h-full"
            fill
            priority
            objectFit="cover"
          />
        </motion.div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/90 text-xs sm:text-sm md:text-base tracking-[0.3em] uppercase mb-4 sm:mb-6 font-medium"
          >
            Welcome to New Manyatta Kenya
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 sm:mb-8 leading-tight max-w-5xl"
          >
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white/80 font-light text-base sm:text-lg italic mb-8 sm:mb-12"
          >
            Your Kenyan Sanctuary Awaits
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary hover:bg-[#c4492e] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase transition-all flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            onClick={() => {
              navigate('/others');
            }}
          >
            Start Your Journey
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>

      {/* Booking Widget Wrapper */}
      <div className="container mx-auto px-4 relative z-40 mb-20">
        <BookingWidget />
      </div>

      {/* Experience Teasers */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeader title="The Trinity of Experience" subtitle="Curated For You" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1 */}
            <Link to="/mountain-villas" className="group cursor-pointer">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative h-[300px] sm:h-[500px] overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-primary">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10 duration-300"></div>
                  <OptimizedImage
                    src="/assets/Trinity%20of%20Experience/Mountainside%20Villas/Burguret.%20Outside%20Patio%20View%202.jpg"
                    alt="Mountainside Haven"
                    className="transition-transform duration-700 group-hover:scale-110"
                    fill
                    objectFit="cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
                    <div className="flex items-center gap-3 text-white mb-2 group-hover:gap-4 transition-all duration-300">
                      <div className="p-2 bg-primary rounded-lg flex-shrink-0">
                        <Mountain size={20} />
                      </div>
                      <h3 className="font-serif text-xl sm:text-2xl font-semibold">Mountainside Villas</h3>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed">Tranquil villas nestled in the misty slopes of Mt. Kenya.</p>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Card 2 */}
            <Link to="/safaris" className="group cursor-pointer">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="relative h-[300px] sm:h-[500px] overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10 duration-300"></div>
                  <OptimizedImage
                    src="/assets/Trinity%20of%20Experience/Safaris/unnamed%20(13).png"
                    alt="Safari"
                    className="transition-transform duration-700 group-hover:scale-110"
                    fill
                    objectFit="cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
                    <div className="flex items-center gap-3 text-white mb-2 group-hover:gap-4 transition-all duration-300">
                      <div className="p-2 bg-primary rounded-lg flex-shrink-0">
                        <Binoculars size={20} />
                      </div>
                      <h3 className="font-serif text-xl sm:text-2xl font-semibold">Safaris</h3>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed">Immersive game drives connecting you to nature's rhythm.</p>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Card 3 */}
            <Link to="/urban-apartments" className="group cursor-pointer">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative h-[300px] sm:h-[500px] overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10 duration-300"></div>
                  <OptimizedImage
                    src="/assets/Trinity%20of%20Experience/Apartments/L6%20Rooftop%20Pool.jpg"
                    alt="Urban Apartments"
                    className="transition-transform duration-700 group-hover:scale-110"
                    fill
                    objectFit="cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
                    <div className="flex items-center gap-3 text-white mb-2 group-hover:gap-4 transition-all duration-300">
                      <div className="p-2 bg-primary rounded-lg flex-shrink-0">
                        <Building2 size={20} />
                      </div>
                      <h3 className="font-serif text-xl sm:text-2xl font-semibold">Apartments</h3>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed">Sophisticated apartments in the heart of Nairobi.</p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 bg-stone-100 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <span className="text-6xl text-primary font-serif opacity-30">"</span>
          <p className="font-serif text-3xl md:text-5xl text-dark leading-tight max-w-4xl mx-auto mb-8">
            For us, it is not just about the stay, it is everything about the stay.
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-gray-300"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">New Manyatta Philosophy</span>
            <div className="h-px w-12 bg-gray-300"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
