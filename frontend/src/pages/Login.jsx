import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Yup Validation Schema
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Email is invalid')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data) => {
    setGeneralError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Save token to localStorage
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));

        // Success message
        alert('Login successful! 🌸');

        // Redirect based on user role
        if (result.user.role === 'admin') {
          navigate('/AdminDashboard');
        } else {
          navigate('/');
        }
      } else {
        setGeneralError(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setGeneralError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-pink-600 transition"
      >
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </Link>

      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-5xl">🌼</span>
            <span className="text-3xl font-bold text-pink-600">Daisy Days</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Login to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* General Error Message */}
            {generalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {generalError}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-pink-500 transition ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
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
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-pink-600 hover:text-pink-700 font-semibold">
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
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

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                <span className="font-semibold text-gray-700">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-5 h-5" />
                <span className="font-semibold text-gray-700">Facebook</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/register" className="text-pink-600 font-semibold hover:text-pink-700">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}