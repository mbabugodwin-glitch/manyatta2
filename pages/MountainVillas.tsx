import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Check, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ImageSlideshowModal from '../components/ImageSlideshowModal';
import GlareHover from '../components/GlareHover';
import {
  BURGURET_VILLA_DETAILS,
  BURGURET_IMAGES,
  NARUMORU_VILLA_DETAILS
} from '../constants';

const VILLAS = [
  {
    id: 'burguret',
    details: BURGURET_VILLA_DETAILS,
    images: BURGURET_IMAGES,
    heroImage: "/assets/Burguret Mountainside Villa Section/Burguret. House Entrance.jpg"
  },
  {
    id: 'narumoru',
    details: NARUMORU_VILLA_DETAILS,
    images: NARUMORU_VILLA_DETAILS.images || [],
    heroImage: "/assets/Burguret Mountainside Villa Section/Burguret. House Entrance.jpg"
  }
];

const MountainVillas: React.FC = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState("");

  const openGallery = (images: string[], title: string) => {
    setSelectedImages(images);
    setSelectedTitle(title);
    setModalOpen(true);
  };

  return (
    <div className="w-full">
      <Helmet>
        <title>Mountain Villas | Luxury Stays in Narumoru | New Manyatta Kenya</title>
        <meta name="description" content="Discover exquisite mountain villas in Narumoru, Kenya. Enjoy premium amenities, breathtaking views, and unforgettable mountain retreats. Book your luxury villa experience now." />
        <meta name="keywords" content="mountain villas, Narumoru villas, luxury villas Kenya, mountain retreat" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Mountain Villas | Luxury Mountain Retreats in Kenya" />
        <meta property="og:description" content="Luxury mountain villas with breathtaking views in Narumoru" />
        <meta property="og:image" content="/assets/Mountain Villas Hero Image/Burguret. House Entrance.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://newmanyattakenya.com/#/mountain-villas" />
      </Helmet>
      <ImageSlideshowModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        images={selectedImages}
        title={selectedTitle}
      />

      {/* Hero */}
      <div className="relative h-[60vh] w-full">
        <img
          src="/assets/Mountain%20Villas%20Hero%20Image/Burguret.%20Outside%20Patio%20View%202.jpg"
          alt="Mountainside Haven"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center">
          <div className="max-w-4xl px-6">
            <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 uppercase">Mountainside Haven</h1>
            <p className="text-white/90 text-xl font-light max-w-2xl mx-auto mb-8 tracking-wide">
              Experience the serenity of Mt. Kenya in our exclusive villas.
            </p>
          </div>
        </div>
      </div>

      {/* Villas List */}
      <div className="flex flex-col gap-0 py-20 bg-white">
        {VILLAS.map((villa, index) => (
          <motion.div 
            key={villa.id} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className={`common-section ${index % 2 === 1 ? 'bg-stone-50' : 'bg-white'} py-20`}
          >
            <div className="container mx-auto px-6">
              <div className={`flex flex-col md:flex-row gap-12 items-start ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>

                {/* Text Content */}
                <div className="md:w-1/2">
                  <span className="text-primary font-bold uppercase tracking-widest text-xs mb-4 block">Exclusive Villa</span>
                  <h2 className="font-serif text-4xl mb-6 text-dark">{villa.details.title}</h2>
                  <div className="flex items-center gap-2 text-primary font-medium mb-6">
                    <MapPin size={20} />
                    <span>{villa.details.location.main} • {villa.details.location.sub}</span>
                  </div>

                  <p className="text-gray-600 leading-relaxed text-lg mb-6">
                    {villa.details.description}
                  </p>

                  <div className="p-7 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-2xl border border-primary/20 shadow-sm mb-8 hover:border-primary/40 transition-colors">
                    <h4 className="font-serif text-xl mb-4 text-dark">Villa Highlights</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-gray-600">
                        <Check className="text-primary shrink-0 mt-0.5" size={16} />
                        <span><strong>Living:</strong> {villa.details.offers.living[0]}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-600">
                        <Check className="text-primary shrink-0 mt-0.5" size={16} />
                        <span><strong>Bedrooms:</strong> {villa.details.offers.bedrooms}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-600">
                        <Check className="text-primary shrink-0 mt-0.5" size={16} />
                        <span><strong>Kitchen:</strong> {villa.details.offers.kitchen}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => openGallery(villa.images, villa.details.title)}
                      className="px-6 py-3 border border-dark text-dark rounded-full font-medium hover:bg-dark hover:text-white transition-all duration-300 flex items-center gap-2 uppercase text-sm tracking-widest shadow-sm hover:shadow-md active:scale-95"
                    >
                      <Camera size={18} /> View Gallery
                    </button>
                    <button
                      onClick={() => navigate('/others')}
                      className="px-6 py-3 bg-primary hover:bg-[#c4492e] text-white rounded-full font-medium transition-all duration-300 uppercase text-sm tracking-widest shadow-md hover:shadow-lg active:scale-95"
                    >
                      Reserve Now
                    </button>
                  </div>
                </div>

                {/* Images Grid */}
                <div className="md:w-1/2 grid grid-cols-2 gap-4">
                  <div className="col-span-2 h-64 rounded-xl overflow-hidden relative group cursor-pointer" onClick={() => openGallery(villa.images, villa.details.title)}>
                    <GlareHover
                      glareColor="#ffffff"
                      glareOpacity={0.25}
                      glareAngle={-25}
                      glareSize={350}
                      transitionDuration={600}
                      playOnce={false}
                    >
                      <img src={villa.heroImage} alt={villa.details.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    </GlareHover>
                  </div>
                  {/* Display 2 more small images if available */}
                  <div className="h-40 rounded-xl overflow-hidden hidden md:block">
                    <img src={villa.images[1] || villa.images[0]} className="w-full h-full object-cover" alt="Detail 1" />
                  </div>
                  <div className="h-40 rounded-xl overflow-hidden hidden md:block">
                    <img src={villa.images[2] || villa.images[0]} className="w-full h-full object-cover" alt="Detail 2" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MountainVillas;