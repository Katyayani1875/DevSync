import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Header = () => (
  <motion.header 
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center"
  >
    <div className="flex items-center gap-3">
      <img src="/logo.png" alt="DevSync Logo" className="h-10" />
      <span className="text-2xl font-bold text-white">DevSync</span>
    </div>
    <Link to="/register">
      <motion.button 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
        className="bg-white text-gray-900 font-semibold px-6 py-2 rounded-lg"
      >
        Get Started
      </motion.button>
    </Link>
  </motion.header>
);

export default Header;