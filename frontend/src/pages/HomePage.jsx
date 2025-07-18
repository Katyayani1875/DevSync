// src/pages/HomePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ArrowRight, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import InteractiveBackground from '../components/InteractiveBackground';
import CustomCursor from '../components/CustomCursor';

// A beautiful loading spinner component for a premium feel
const LoadingSpinner = () => (
    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
);

const HomePage = () => {
    const navigate = useNavigate();
    const { user, loading, logout } = useAuth();
    const [roomId, setRoomId] = useState('');
    
    // This ref is needed for the background component prop
    const scrollY = useRef(0);

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('New room created & ID copied!');
        navigator.clipboard.writeText(id);
    };

    const joinRoom = () => {
        if (!roomId) {
            toast.error('Please enter a Room ID.');
            return;
        }
        navigate(`/editor/${roomId}`);
    };

    const handleEnterKey = (e) => {
        if (e.key === 'Enter') {
            joinRoom();
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <>
            <CustomCursor />
            <InteractiveBackground scrollY={scrollY} />

            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 font-sans">
                {/* --- LOGGED IN VIEW --- */}
                {user ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-lg p-8 space-y-6 bg-slate-800/70 backdrop-blur-2xl border border-slate-700 rounded-2xl shadow-2xl shadow-black/40 text-center"
                    >
                        <div className='flex justify-between items-center'>
                            <p className="text-muted-foreground">Welcome, <span className="font-bold text-foreground">{user.name}</span></p>
                            <button onClick={logout} className="text-sm text-slate-400 hover:text-accent transition-colors">Logout</button>
                        </div>
                        
                        <h1 className="text-4xl font-bold text-foreground pt-4">Mission Control</h1>
                        <p className="text-muted-foreground pb-4">Join an existing room or create a new one to start collaborating.</p>

                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                className="flex-grow pl-4 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/80 focus:border-accent transition-all duration-300"
                                placeholder="Paste Room ID"
                                onChange={(e) => setRoomId(e.target.value)}
                                value={roomId}
                                onKeyUp={handleEnterKey}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={joinRoom}
                                className="font-semibold py-3 px-6 bg-accent text-background rounded-lg hover:brightness-110 transition-all"
                            >
                                Join
                            </motion.button>
                        </div>

                        <div className="flex items-center text-xs text-slate-500 uppercase">
                            <hr className="w-full border-slate-700" />
                            <span className="px-4">OR</span>
                            <hr className="w-full border-slate-700" />
                        </div>
                        
                        <button 
                            onClick={createNewRoom} 
                            className="w-full font-medium py-3 px-4 border-2 border-dashed border-slate-600 text-slate-400 rounded-lg hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2"
                        >
                           <PlusCircle size={18}/> Create a New Room
                        </button>

                    </motion.div>
                ) : (
                // --- LOGGED OUT VIEW ---
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-md p-8 space-y-6 bg-slate-800/70 backdrop-blur-2xl border border-slate-700 rounded-2xl shadow-2xl shadow-black/40 text-center"
                    >
                        <Link to="/" className="inline-block mb-4 text-4xl font-bold tracking-tight">DevSync</Link>
                        <p className="text-muted-foreground pb-4">
                            Collaborate. Code. Communicate — in real-time.
                        </p>
                        <div className="space-y-4">
                            <Link to="/login">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full flex items-center justify-center gap-2 bg-accent text-background font-semibold py-3 rounded-lg hover:brightness-110 transition-colors">
                                    <LogIn size={20}/> Login
                                </motion.button>
                            </Link>
                            <Link to="/register">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full flex items-center justify-center gap-2 bg-slate-700 text-foreground font-semibold py-3 rounded-lg hover:bg-slate-600 transition-colors">
                                    <UserPlus size={20}/> Sign Up
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </>
    );
};

export default HomePage;