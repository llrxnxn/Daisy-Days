import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import axios from "axios";

// FIREBASE
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  /* ============================================================
     ✅ GOOGLE LOGIN (UPDATED WITH AXIOS + BACKEND)
  ============================================================ */
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const googleData = {
        firebaseUid: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      };

      const response = await axios.post(
        "http://localhost:5000/api/auth/google-login",
        googleData
      );

      const data = response.data;

      // Save session
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect
      if (data.user.role === "admin") {
    window.location.href = "/AdminDashboard";
      } else {
          window.location.href = "/";
      }


    } catch (error) {
      console.error("Google Login Error:", error);
      setGeneralError(
        error.response?.data?.message || "Google login failed. Please try again."
      );
    }
  };

  /* ------------------------ VALIDATION ------------------------ */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  /* -------------------------- LOGIN SUBMIT -------------------------- */
  const onSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setGeneralError('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      const result = response.data;

      // Save session
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      if (result.user.role === "admin") {
        window.location.href = "/AdminDashboard";
      } else {
        window.location.href = "/";
      }

    } catch (error) {
      console.error("Login error:", error);
      setGeneralError(
        error.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /* -------------------------- UI -------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-pink-50 flex items-center justify-center p-4">

      {/* Back to Home */}
      <button
        onClick={() => window.location.href = '/'}
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-pink-600 transition"
      >
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </button>

      <div className="max-w-md w-full">

        {/* Logo + Heading */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-5xl">🌼</span>
            <span className="text-3xl font-bold text-pink-600">Daisy Days</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Login to your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="space-y-6">

            {generalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {generalError}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-pink-500 transition ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:border-pink-500 transition ${
                    errors.password ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              onClick={onSubmit}
              disabled={isLoading}
              className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* GOOGLE LOGIN */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="cursor-pointer z-50 w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span className="font-semibold text-gray-700">Continue with Google</span>
            </button>

            <div className="text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <a href="/register" className="text-pink-600 font-semibold hover:text-pink-700">
                Sign up
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
