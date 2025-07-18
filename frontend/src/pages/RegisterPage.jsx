
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import InteractiveBackground from '../components/InteractiveBackground';
import CustomCursor from '../components/CustomCursor';

// A reusable, styled input component
const AuthInput = ({ icon, ...props }) => (
    <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</div>
        <input 
            {...props} 
            className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/80 focus:border-accent transition-all duration-300" 
        />
    </div>
);

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, googleAuth } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // This ref is needed for the background component prop, even if unused on this page
    const scrollY = useRef(0);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long.');
            return;
        }
        setIsLoading(true);
        try {
            await register(name, email, password);
            toast.success('Account created! Welcome to DevSync.');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (response) => {
        setIsLoading(true);
        try {
            await googleAuth(response.credential);
            toast.success('Signed in with Google!');
            navigate('/');
        } catch (err) {
            toast.error('Google Sign-In failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <CustomCursor />
            <InteractiveBackground scrollY={scrollY} />

            <div className="min-h-screen flex items-center justify-center p-4 relative z-10 font-sans">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    // --- BRIGHTER & MORE PROFESSIONAL CARD STYLING ---
                    className="w-full max-w-md p-8 space-y-6 bg-slate-800/70 backdrop-blur-2xl border border-slate-700 rounded-2xl shadow-2xl shadow-black/40"
                >
                    <div className="text-center">
                        <Link to="/" className="inline-block mb-4 text-3xl font-bold tracking-tight">DevSync</Link>
                        <h1 className="text-3xl font-bold text-foreground">Create an Account</h1>
                        <p className="mt-2 text-muted-foreground">Join the future of collaboration.</p>
                    </div>
                    
                    <form className="space-y-4" onSubmit={handleRegister}>
                        <AuthInput 
                            icon={<User size={18} />}
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Full Name" 
                            required 
                        />
                        <AuthInput 
                            icon={<Mail size={18} />}
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Email address" 
                            required 
                        />
                        <AuthInput 
                            icon={<Lock size={18} />}
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Password" 
                            required 
                        />
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full font-semibold py-3 px-4 bg-accent text-background rounded-lg hover:brightness-110 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </motion.button>
                    </form>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-center text-xs text-slate-500 uppercase">
                            <hr className="w-full border-slate-700" />
                            <span className="px-4">OR</span>
                            <hr className="w-full border-slate-700" />
                        </div>
                        {/* The Google button is now correctly placed */}
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error('Google Login Failed')}
                                theme="outline"
                                text="signup_with"
                                shape="pill"
                                width="320px"
                            />
                        </div>
                    </div>

                    <p className="text-sm text-center text-muted-foreground pt-2">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-accent hover:underline">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </>
    );
};

export default RegisterPage;