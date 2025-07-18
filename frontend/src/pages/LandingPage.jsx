// src/pages/LandingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Zap, Mic, Terminal, Code, Users, Monitor, Video, MessageSquare, FileText, Lock, Download } from 'lucide-react';
import Lenis from '@studio-freight/lenis';

import InteractiveBackground from '../components/InteractiveBackground';
import CustomCursor from '../components/CustomCursor';

// Animation variants for a choreographed entrance
const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.5 } },
};

const features = [
  { icon: <Zap size={24} className="text-accent" />, title: "Real-time Sync", description: "Experience zero-latency typing and execution. It feels like you're sharing a single machine, not just a screen." },
  { icon: <Mic size={24} className="text-accent" />, title: "HD Voice & Video", description: "Crystal-clear voice chat and webcam support are built-in. No need for third-party apps to interrupt your flow." },
  { icon: <Terminal size={24} className="text-accent" />, title: "Shared Terminal", description: "Run commands, install packages, and debug together in a fully-functional, shared terminal environment." }
];

// --- UPDATED BenefitCard COMPONENT WITH MORE SPACING ---
const BenefitCard = ({ number, title, description }) => (
  <div className="flex-shrink-0 w-screen md:w-[33.33vw] aspect-square border border-slate-200/40 p-8 flex flex-col justify-between relative bg-transparent">
    <p className="text-6xl font-bold text-accent mt-2 mb-8">{number}</p>
    <div className="flex flex-col justify-end h-full">
      <h3 className="text-2xl font-bold uppercase tracking-tight mb-6 mt-auto leading-tight">{title}</h3>
      <p className="text-2xl md:text-3xl font-extrabold uppercase text-white/90 leading-tight mb-2" style={{ fontFamily: 'Satoshi, sans-serif', letterSpacing: '-0.03em' }}>{description}</p>
    </div>
  </div>
);

// --- RESTORED FeatureCard COMPONENT ---
const FeatureCard = ({ feature, opacity }) => (
  <motion.div style={{ opacity }} className="absolute inset-0 p-8 flex flex-col justify-center">
    <div className="mb-4">{feature.icon}</div>
    <h3 className="text-2xl font-bold text-foreground mb-2">{feature.title}</h3>
    <p className="text-muted-foreground">{feature.description}</p>
  </motion.div>
);

// --- RESTORED workflowSteps and WorkflowStep COMPONENTS ---
const workflowSteps = [
  { icon: <FileText size={20} />, title: "Sign Up / Log In", description: "Quick registration with email or OAuth providers" },
  { icon: <Code size={20} />, title: "Create/Join Room", description: "Start a new session or join via shared link" },
  { icon: <MessageSquare size={20} />, title: "Collaborate", description: "Code, chat, and communicate in real-time" },
  { icon: <Lock size={20} />, title: "Set Permissions", description: "Control who can edit or view" },
  { icon: <Download size={20} />, title: "Save/Export", description: "Download projects or save to your account" }
];

const WorkflowStep = ({ step, index }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
        {step.icon}
      </div>
      {index < workflowSteps.length - 1 && (
        <div className="w-0.5 h-12 bg-border/50 flex-grow my-1"></div>
      )}
    </div>
    <div className="pb-8">
      <h4 className="font-bold text-lg">{step.title}</h4>
      <p className="text-muted-foreground text-sm mt-1">{step.description}</p>
    </div>
  </div>
);

const LandingPage = () => {
  const words = ['Together', 'Efficiently', 'Instantly', 'Seamlessly'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const scrollY = useRef(0);
  const narrativeRef = useRef(null);
  const useCasesRef = useRef(null);
  // --- ADD THIS NEW REF ---
  const horizontalScrollRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: narrativeRef, offset: ["start start", "end end"] });
  // --- ADD THIS NEW USE SCROLL HOOK ---
  const { scrollYProgress: horizontalProgress } = useScroll({
    target: horizontalScrollRef,
    offset: ['start start', 'end end']
  });
  // --- ADD THIS NEW USE TRANSFORM HOOK ---
  const x = useTransform(horizontalProgress, [0, 1], ["0%", "-66.666%"]);

  const featureOpacities = [
    useTransform(scrollYProgress, [0, 0.25, 0.33], [1, 1, 0]),
    useTransform(scrollYProgress, [0.33, 0.58, 0.66], [0, 1, 0]),
    useTransform(scrollYProgress, [0.66, 0.91, 1], [0, 1, 1])
  ];
  
  useEffect(() => {
    const lenis = new Lenis();
    lenis.on('scroll', (e) => { scrollY.current = e.progress; });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    const interval = setInterval(() => { setCurrentWordIndex((prev) => (prev + 1) % words.length); }, 2500);
    return () => { clearInterval(interval); lenis.destroy(); };
  }, []);

  // --- ADD DESCRIPTIONS TO BENEFITS ---
  const benefits = [
    {
      number: '01',
      title: "Remote Team Collaboration",
      description: "Work together in real time, no matter where you are."
    },
    {
      number: '02',
      title: "Seamless Technical Interviews",
      description: "Conduct interviews with live code, chat, and video."
    },
    {
      number: '03',
      title: "Interactive Teaching & Mentorship",
      description: "Teach, mentor, and learn with instant feedback."
    },
  ];

  return (
    <>
      <CustomCursor />
      <InteractiveBackground scrollY={scrollY} />
      <div className="relative z-10 font-sans">
        <header className="fixed top-0 left-0 right-0 z-20 py-4 px-8 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold tracking-tight">DevSync</Link>
          <Link to="/register">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="bg-foreground text-background font-bold px-6 py-2 rounded-md text-sm">
              Get Started
            </motion.button>
          </Link>
        </header>

        <main>
          {/* Hero Section */}
          <motion.section 
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
            className="h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden"
          >
            {/* Animated background gradient */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.5 }} 
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-gradient-to-br from-accent/30 via-transparent to-background pointer-events-none z-0"
            />
            <motion.div
              variants={heroItemVariants}
              className="flex justify-center items-center text-3xl md:text-6xl font-black uppercase tracking-tighter relative z-10 w-full"
              style={{ lineHeight: 1.1 }}
            >
              <span className="flex-shrink-0 leading-none align-middle md:align-baseline" style={{ display: 'inline-block', verticalAlign: 'middle', transition: 'none' }}>CODE</span>
              <span className="w-[0.5ch] md:w-[1ch]"></span>
              {/* Fixed-width container for animated word to prevent shifting */}
              <span
                className="relative inline-block align-middle"
                style={{ width: '10ch', height: '1.1em', verticalAlign: 'middle' }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={words[currentWordIndex]}
                    initial={{ y: 30, opacity: 0, position: 'absolute', left: 0, right: 0 }}
                    animate={{ y: 0, opacity: 1, position: 'absolute', left: 0, right: 0 }}
                    exit={{ y: -30, opacity: 0, position: 'absolute', left: 0, right: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="text-accent font-black whitespace-nowrap flex items-center align-middle md:align-baseline w-full justify-center"
                    style={{ fontSize: 'inherit', lineHeight: 1.1, display: 'inline-flex', verticalAlign: 'middle', left: 0, right: 0, position: 'absolute', width: '100%' }}
                  >
                    {words[currentWordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.div>
            <motion.p 
              variants={heroItemVariants}
              className="mt-6 max-w-xl mx-auto text-slate-300 md:text-xl relative z-10"
            >
              The real-time collaborative platform for developers. Build, teach, and interview with seamless real-time code sharing.
            </motion.p>
            {/* Animated divider */}
            <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="origin-left w-32 h-1 bg-accent mx-auto mt-10 rounded-full z-10" />
          </motion.section>

          {/* === CORRECTED & FINAL Features Section === */}
          <motion.section ref={narrativeRef} className="h-[300vh] relative" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            {/* Subtle background effect */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 0.3 }} transition={{ duration: 1 }} className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-background/80 to-transparent pointer-events-none z-0" />
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">
              <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 items-center px-8">
                {/* Left Column: The sticky headline */}
                <div className="hidden md:flex flex-col justify-center">
                    <motion.div
                        className="w-full"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <h2 className="text-5xl lg:text-7xl font-black tracking-tighter text-left">
                            BUILT FOR
                            <br />
                            <span className="text-accent">A FLAWLESS</span>
                            <br />
                            FLOW.
                        </h2>
                        <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="origin-left w-20 h-1.5 bg-accent mt-6 rounded-full" />
                    </motion.div>
                </div>
                {/* Right Column: The animating feature cards */}
                <div className="h-[300px] relative">
                  {/* Title for mobile view (when left column is hidden) */}
                  <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl font-bold mb-8 text-center md:hidden">Core Features</motion.h2>
                  {features.map((feature, i) => (
                    <FeatureCard key={i} feature={feature} opacity={featureOpacities[i]} />
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* --- UPDATED Use Cases Section with Horizontal Scroll --- */}
          <section ref={horizontalScrollRef} className="h-[300vh] relative bg-transparent">
          <div className="sticky top-0 h-screen flex flex-col items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }} 
              viewport={{ once: true, margin: "-150px" }} 
              className="text-center mb-16 px-4"
            >
              <h2 className="text-4xl font-bold mb-4">One Platform, Endless Possibilities</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">DevSync is designed for every collaborative coding scenario you can imagine.</p>
            </motion.div>
            <div className="w-full flex items-center overflow-x-hidden">
              <motion.div style={{ x }} className="flex">
                {benefits.map((benefit) => (
                  <BenefitCard key={benefit.number} {...benefit} />
                ))}
              </motion.div>
            </div>
          </div>
        </section>

          {/* Workflow Section */}
          <motion.section className="py-24 relative overflow-hidden" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            {/* Subtle background effect */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 0.15 }} transition={{ duration: 1 }} className="absolute inset-0 bg-gradient-to-tl from-accent/10 via-background/80 to-transparent pointer-events-none z-0" />
            <div className="max-w-3xl mx-auto px-4 sm:px-8 relative z-10">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">A Simple, Powerful Workflow</h2>
                <p className="text-muted-foreground"> Get started in seconds and experience true seamless collaboration. </p>
                <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="origin-left w-24 h-1 bg-accent mx-auto mt-6 rounded-full" />
              </motion.div>
              <div className="max-w-md mx-auto">
                {workflowSteps.map((step, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true, amount: 0.5 }}>
                    <WorkflowStep step={step} index={index} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section className="h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            {/* Subtle background effect */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 0.18 }} transition={{ duration: 1 }} className="absolute inset-0 bg-gradient-to-b from-accent/10 via-background/80 to-transparent pointer-events-none z-0" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-2xl relative z-10"
            >
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Ready to Transform Your Workflow?</h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Join thousands of developers who collaborate better with DevSync's real-time platform.
              </p>
              <Link to="/register" className="mt-8 inline-block">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="bg-accent text-background font-bold px-10 py-4 rounded-md text-xl">
                  Start Building Now
                </motion.button>
              </Link>
            </motion.div>
          </motion.section>
        </main>
      </div>
    </>
  );
};

export default LandingPage;