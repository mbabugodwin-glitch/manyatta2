import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Bed, Bath, Move, Check, Car, User, Camera, ArrowRight } from 'lucide-react';
import { URBAN_APARTMENTS } from '../constants';
import SectionHeader from '../components/SectionHeader';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import OptimizedImage from '../components/OptimizedImage';
import ImageSlideshowModal from '../components/ImageSlideshowModal';

const UrbanApartments: React.FC = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState("");

  const openGallery = (images: string[], name: string) => {
    if (images && images.length > 0) {
      setSelectedImages(images);
      setSelectedName(name);
      setModalOpen(true);
    }
  };

  return (
    <div className="w-full">
      <Helmet>
        <title>Urban Apartments | Premium Nairobi Properties | New Manyatta Kenya</title>
        <meta name="description" content="Discover luxury apartments in Nairobi with modern amenities, stunning views, and convenient locations. Perfect for long-term rentals and short-term stays." />
        <meta name="keywords" content="Nairobi apartments, luxury apartments, rental apartments, urban living Kenya" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Urban Apartments | Luxury Living in Nairobi" />
        <meta property="og:description" content="Premium apartments in Nairobi for rent and sale" />
        <meta property="og:image" content="/assets/Apartments Hero Image/Alba_Gardens_Banner.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://newmanyattakenya.com/#/urban-apartments" />
      </Helmet>
      <ImageSlideshowModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        images={selectedImages}
        title={selectedName}
      />

      {/* Hero */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        <OptimizedImage
          src="/assets/Apartments%20Hero%20Image/nairobi-worlds-best-city-to-visit.jpg"
          alt="Nairobi Skyline"
          fill
          priority
          objectFit="cover"
          className="opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex flex-col items-center justify-center text-center p-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-5xl md:text-6xl text-white mb-4"
          >
            Nairobi Living
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/90 text-lg tracking-wide uppercase"
          >
            Sophistication in the City
          </motion.p>
        </div>
      </div>

      {/* Comparison Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <SectionHeader title="Select Your Residence" subtitle="Premium Locations" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {URBAN_APARTMENTS.map((apt, idx) => (
              <motion.div 
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group border border-gray-200 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white hover:-translate-y-3 hover:border-primary/30"
              >
                {/* Image */}
                <div
                  className="h-72 overflow-hidden relative cursor-pointer bg-gray-100"
                  onClick={() => openGallery(apt.images, apt.name)}
                >
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-2 text-xs font-bold uppercase tracking-wider z-10 rounded-lg shadow-lg">
                    {apt.rentShortTerm}
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="absolute bottom-4 right-4 bg-primary text-white p-3 rounded-full z-10 cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Camera size={20} />
                  </motion.div>
                  <OptimizedImage
                    src={apt.image}
                    alt={apt.name}
                    fill
                    objectFit="cover"
                    className="group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                {/* Details */}
                <div className="p-8">
                  <h3 className="font-serif text-3xl font-semibold mb-4 text-dark">{apt.name}</h3>
                  <div className="flex items-center gap-6 text-gray-600 text-sm mb-6 font-medium">
                    <span className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg"><Bed size={18} className="text-primary" /> {apt.bedrooms} Bed</span>
                    <span className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg"><Bath size={18} className="text-primary" /> 2 Bath</span>
                    <span className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg"><Move size={18} className="text-primary" /> 120 sqm</span>
                  </div>

                  {/* Pricing Grid */}
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-5 rounded-xl grid grid-cols-2 gap-4 mb-6 border border-primary/20">
                    {apt.salePrice && (
                      <div className="col-span-2 border-b border-primary/20 pb-3 mb-2">
                        <span className="block text-xs text-gray-500 font-bold uppercase">For Sale</span>
                        <span className="block font-serif text-2xl text-dark font-bold">{apt.salePrice}</span>
                      </div>
                    )}
                    <div>
                      <span className="block text-xs text-gray-500 font-bold uppercase">Long Term</span>
                      <span className="block font-serif text-xl text-primary font-bold">{apt.rentLongTerm}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 font-bold uppercase">Short Stay</span>
                      <span className="block font-serif text-xl text-primary font-bold">{apt.rentShortTerm}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {apt.features.map((feat, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 text-sm text-gray-700 font-medium"
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check size={14} className="text-primary" />
                        </div>
                        {feat}
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-primary text-white py-3 rounded-lg text-sm font-bold uppercase tracking-wide hover:bg-[#c4492e] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      onClick={() => navigate('/others')}
                      type="button"
                    >
                      Book Stay <ArrowRight size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 border-2 border-dark text-dark py-3 rounded-lg text-sm font-bold uppercase tracking-wide hover:bg-dark hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-dark/50"
                      onClick={() => openGallery(apt.images, apt.name)}
                      type="button"
                    >
                      View Gallery
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-gradient-to-b from-stone-50 to-white">
        <div className="container mx-auto px-6">
          <SectionHeader title="Concierge Services" subtitle="City Experiences" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Car, title: "Chauffeur Services", desc: "Airport transfers and daily city navigation in luxury comfort." },
              { icon: User, title: "Private Guides", desc: "Discover the hidden gems of Nairobi with our local experts." },
              { icon: Bed, title: "Premium Housekeeping", desc: "Daily cleaning and maintenance keeping your space perfect." }
            ].map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 text-center"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary group-hover:bg-primary/30 transition-colors">
                    <Icon size={36} />
                  </div>
                  <h4 className="font-serif text-2xl mb-3 font-semibold">{service.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UrbanApartments;
