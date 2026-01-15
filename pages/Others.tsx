import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Coffee, Heart, ArrowRight, ShoppingBag, Droplets, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeader from '../components/SectionHeader';
import StoryModal from '../components/StoryModal';
import ImpactReportModal from '../components/ImpactReportModal';
import OptimizedImage from '../components/OptimizedImage';
import { COFFEE_PRODUCTS, CSR_PROJECTS, BLOG_POSTS } from '../constants';

const Others: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  return (
    <div className="w-full">
      <Helmet>
        <title>Experiences, Stories & Lifestyle | New Manyatta Kenya</title>
        <meta name="description" content="Explore curated lifestyle experiences, authentic Kenyan coffee, CSR initiatives, and travel stories. Discover the magic of Manyatta through our unique offerings." />
        <meta name="keywords" content="Kenya lifestyle, authentic coffee, CSR projects, travel stories, Manyatta experiences" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Curated Experiences & Lifestyle | New Manyatta Kenya" />
        <meta property="og:description" content="Discover curated lifestyle experiences and authentic Kenyan stories" />
        <meta property="og:image" content="/assets/Others Hero Image/The-Narumoru-Route-Climb-up-Mount-Kenya.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://newmanyattakenya.com/#/others" />
      </Helmet>
      {/* Hero */}
      <div className="relative h-[50vh] w-full bg-stone-900">
        <OptimizedImage 
          src="/assets/Others%20Hero%20Image/The-Narumoru-Route-Climb-up-Mount-Kenya.jpg" 
          alt="Curated Lifestyle" 
          fill
          priority
          objectFit="cover"
          className="opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
        >
           <span className="text-primary text-sm font-bold tracking-[0.3em] uppercase mb-4">Beyond the Stay</span>
           <h1 className="font-serif text-5xl md:text-6xl text-white mb-4">Curated & Community</h1>
           <p className="text-white/80 text-lg max-w-2xl font-light">
             From the rich soils of Mt. Elgon to the heart of our local communities.
           </p>
        </motion.div>
      </div>

      {/* Coffee Showcase */}
      <section className="py-24 bg-stone-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
            <div className="md:w-1/2">
              <span className="text-primary font-bold uppercase tracking-widest text-xs mb-4 block">The Pantry</span>
              <h2 className="font-serif text-4xl mb-6 text-dark">Mt. Elgon Reserve Coffee</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Grown in the volcanic soils of Mt. Elgon, our exclusive coffee selection brings the rich, complex flavors of the Kenyan highlands to your cup. Hand-picked, sun-dried, and roasted to perfection.
              </p>
              <div className="flex items-center gap-4 text-sm font-medium text-dark">
                <div className="flex items-center gap-2">
                  <Coffee size={18} className="text-primary" /> Single Origin
                </div>
                <div className="flex items-center gap-2">
                  <Heart size={18} className="text-primary" /> Fair Trade
                </div>
              </div>
            </div>
            <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {COFFEE_PRODUCTS.map((product) => (
                <motion.div 
                  key={product.id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5 }}
                  className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 group hover:shadow-lg hover:-translate-y-2 transition-all duration-300 hover:border-primary/30"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                    <OptimizedImage 
                      src={product.image} 
                      alt={product.name} 
                      fill
                      objectFit="cover"
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md text-primary hover:bg-primary hover:text-white transition-colors z-10"
                    >
                      <ShoppingBag size={18} />
                    </motion.button>
                  </div>
                  <h3 className="font-serif text-xl mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">{product.roast}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-dark">{product.price}</span>
                    <span className="text-xs text-gray-400 italic">{product.notes}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Future Additions Placeholder */}
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Droplets size={120} />
             </div>
             <span className="inline-block px-3 py-1 bg-orange-100 text-primary text-xs font-bold rounded-full mb-4 uppercase tracking-wider">Coming Soon</span>
             <h3 className="font-serif text-2xl mb-2">Organic Highland Honey</h3>
             <p className="text-gray-500 max-w-lg mx-auto">
               We are currently working with local apiaries to bring you pure, unprocessed honey from the Aberdare forests. Stay tuned.
             </p>
          </div>
        </div>
      </section>

      {/* CSR Section */}
      <section className="py-24 bg-dark text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto px-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] mb-4 block text-primary"><a href="#our-responsibility" className="hover:text-white transition-colors">Our Responsibility</a></span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6 text-white">Giving Back</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {CSR_PROJECTS.map((project, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col md:flex-row gap-6 bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-750 transition-all duration-300 cursor-pointer group hover:-translate-y-2 hover:shadow-xl" 
                onClick={() => setSelectedReport(index)}
              >
                <div className="md:w-2/5 h-64 md:h-auto overflow-hidden relative">
                  <OptimizedImage 
                    src={project.image} 
                    alt={project.title} 
                    fill
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-8 md:w-3/5 flex flex-col justify-center">
                  <h3 className="font-serif text-2xl mb-4 text-primary">{project.title}</h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {project.description}
                  </p>
                  <motion.button 
                    whileHover={{ gap: "0.75rem" }}
                    className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-all"
                  >
                    Read Impact Report <ArrowRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog & Gallery Split */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto px-4 lg:hidden">
            <span className="text-xs font-bold uppercase tracking-[0.2em] mb-4 block text-primary"><a href="#the-journal" className="hover:text-dark transition-colors">The Journal</a></span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6 text-dark">Stories</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* Blog Section (2/3 width) */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-10">
                <BookOpen className="text-primary" />
                <a href="#the-journal" className="font-serif text-3xl text-dark hover:text-primary transition-colors">The Journal</a>
              </div>
              
              <div className="space-y-10">
                {BLOG_POSTS.map((post, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group flex flex-col sm:flex-row gap-6 items-start border-b border-gray-200 pb-10 last:border-0 cursor-pointer hover:bg-stone-50 p-4 -mx-4 rounded-lg transition-all duration-300"
                  >
                    <div className="w-full sm:w-48 h-32 rounded-lg overflow-hidden shrink-0 relative">
                      <OptimizedImage 
                        src={post.image} 
                        alt={post.title} 
                        fill
                        objectFit="cover"
                        className="group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">{post.date}</span>
                      <h3 className="font-serif text-2xl mb-3 group-hover:text-primary transition-colors cursor-pointer">{post.title}</h3>
                      <p className="text-gray-500 leading-relaxed text-sm mb-4">
                        {post.excerpt}
                      </p>
                      <motion.button 
                        whileHover={{ textDecoration: "underline", color: "#DD5536" }}
                        onClick={() => setSelectedStory(index)} 
                        className="text-dark text-sm font-medium underline decoration-gray-300 underline-offset-4 transition-all"
                      >
                        Read Story
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {selectedStory !== null && (
        <StoryModal
          isOpen={selectedStory !== null}
          onClose={() => setSelectedStory(null)}
          title={BLOG_POSTS[selectedStory]?.title || ''}
          date={BLOG_POSTS[selectedStory]?.date || ''}
          image={BLOG_POSTS[selectedStory]?.image || ''}
          author={BLOG_POSTS[selectedStory]?.author || 'New Manyatta Team'}
          content={BLOG_POSTS[selectedStory]?.fullContent || BLOG_POSTS[selectedStory]?.excerpt || ''}
        />
      )}

      {selectedReport !== null && (
        <ImpactReportModal
          isOpen={selectedReport !== null}
          onClose={() => setSelectedReport(null)}
          title={CSR_PROJECTS[selectedReport]?.title || ''}
          description={CSR_PROJECTS[selectedReport]?.description || ''}
          image={CSR_PROJECTS[selectedReport]?.image || ''}
          reportContent={CSR_PROJECTS[selectedReport]?.reportContent || CSR_PROJECTS[selectedReport]?.description || ''}
          year="2024"
          impact={CSR_PROJECTS[selectedReport]?.impact || []}
        />
      )}
    </div>
  );
};

export default Others;