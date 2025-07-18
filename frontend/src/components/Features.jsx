import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Mic, Save } from 'lucide-react';

const featureList = [
  { icon: <Zap size={32} />, title: "Real-Time Sync", description: "Code with your team as if you were in the same room. Every keystroke, selection, and cursor movement is synced instantly." },
  { icon: <Users size={32} />, title: "Team Collaboration", description: "Create dedicated rooms, manage participants, and maintain a seamless workflow for pair programming or group projects." },
  { icon: <Mic size={32} />, title: "Integrated Voice Chat", description: "No need for third-party call software. Talk to your collaborators directly within the editor for crystal-clear communication." },
  { icon: <Save size={32} />, title: "Persistent Projects", description: "Sign up to save your code, create private rooms, and pick up right where you left off, anytime." },
];

const Features = () => (
  <section className="py-20 px-4 text-white">
    <div className="max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold">The Ultimate Collaboration Canvas.</h2>
        <p className="text-lg text-gray-400 mt-4">DevSync is more than an editor. It's your shared development environment in the cloud.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {featureList.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-lg"
          >
            <div className="text-teal-400 mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-300">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;