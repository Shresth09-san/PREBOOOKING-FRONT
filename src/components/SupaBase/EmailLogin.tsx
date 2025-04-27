import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
export default function EmailLogin() {
  const [email, setEmail] = useState('');
  const [flashMessage, setFlashMessage] = useState('');
  const [flashType, setFlashType] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const location=useLocation()
  const role=location.state?.role
  const showFlashMessage = (message, type = 'success') => {
    setFlashMessage(message);
    setFlashType(type);
    setTimeout(() => {
      setFlashMessage('');
      setFlashType('');
    }, 3000); // Auto-hide after 3 seconds
  };

  const {user}=useAuth()

// In EmailLogin.js
const handleLogin = async () => {
  if (!email) {
    showFlashMessage('Please enter an email address!', 'error');
    return;
  }

  try {
    // Check if user exists
    const response = await axios.post(`${API_BASE_URL}/api/auth/getemailotp`, {
      email,
      role
      // role:user.role,
      // name:user.name
    });

    const userRole = response.data.role;

    // Determine the redirect URL based on role
    const redirectUrl =
      userRole === 'provider'
        ? `${API_BASE_URL}/Dashboard`
        : `${API_BASE_URL}/Dashboard`;

    // Send OTP via Supabase
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      showFlashMessage(error.message, 'error');
    } else {
      showFlashMessage('OTP sent to your email!', 'success');
    }
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    showFlashMessage(message, 'error');
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-white">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
        {/* Flash Message */}
        {flashMessage && (
          <div
            className={`fixed  left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-md shadow-md z-50 text-white transition-all duration-300
              ${flashType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {flashMessage}
          </div>
        )}

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
          Login with Email OTP
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-md transition duration-200"
        >
          Send OTP
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          You will receive a login code in your email.
        </p>
      </div>
    </div>
  );
}
