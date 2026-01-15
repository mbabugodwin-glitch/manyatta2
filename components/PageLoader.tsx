import React from 'react';
import { motion } from 'framer-motion';

const PageLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated loader circle */}
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 border-4 border-gray-200 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              borderTopColor: '#D4AF37',
              borderRightColor: '#D4AF37',
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
            }}
          />
        </div>
        <motion.p
          className="text-gray-600 font-light tracking-wide uppercase text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default PageLoader;
