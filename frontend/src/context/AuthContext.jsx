import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // To handle initial load

    useEffect(() => {
        // Check for user data in localStorage on initial load
        const storedUser = localStorage.getItem('devsync-user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        localStorage.setItem('devsync-user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
        localStorage.setItem('devsync-user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('devsync-user');
        setUser(null);
    };

    const googleAuth = async (credential) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/google', { credential });
        localStorage.setItem('devsync-user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, googleAuth, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};