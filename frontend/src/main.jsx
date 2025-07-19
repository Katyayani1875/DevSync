import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { configureMonaco } from './monacoConfig';
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// Initialize Monaco before rendering the app
configureMonaco();
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <App />
        
      </BrowserRouter>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b', // slate-800
            color: '#e2e8f0', // slate-200
          },
        }}
      />
    </GoogleOAuthProvider>
  </React.StrictMode>
);