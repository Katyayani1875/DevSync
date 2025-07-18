import React from 'react';
import { motion } from 'framer-motion';
import { Mouse } from 'lucide-react';

const ScrollIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 2.5 }} // Fades in after the main title
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span className="text-sm font-medium text-gray-300">Scroll to Explore</span>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Mouse className="text-gray-300" size={24} />
      </motion.div>
    </motion.div>
  );
};

export default ScrollIndicator;