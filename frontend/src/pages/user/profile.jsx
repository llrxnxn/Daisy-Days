import React, { useState, useRef, useEffect } from 'react';
import { Camera, User, Mail, Phone, Save, X, Trash2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Navbar from '../../components/layout/navbar';
import Footer from '../../components/layout/footer';

// Yup Validation Schema
const profileSchema = yup.object({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  phone: yup
    .string()
    .matches(/^[0-9]{10,11}$/, 'Phone number must be 10-11 digits')
    .required('Phone number is required')
});

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [imageError, setImageError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(profileSchema),
    mode: 'onChange'
  });

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken || !storedUser) {
      navigate('/Login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setToken(storedToken);
    setUser(parsedUser);

    // Set form data
    reset({
      firstName: parsedUser.firstName || '',
      lastName: parsedUser.lastName || '',
      phone: parsedUser.phone || ''
    });

    // Set profile image preview
    setPreviewUrl(parsedUser.profileImage || null);
  }, [navigate, reset]);

  // Update user in localStorage
  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setImageError('Please select an image file');
        return;
      }

      setSelectedImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      setImageError('');
    }
  };

  const handleRemoveImage = async () => {
    if (!user?.profileImage) {
      setPreviewUrl(null);
      setSelectedImage(null);
      return;
    }

    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile-image', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        updateUser({ profileImage: null });
        setPreviewUrl(null);
        setSelectedImage(null);
        setSuccessMessage('Profile picture removed successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setGeneralError(data.message || 'Failed to remove image');
      }
    } catch (error) {
      console.error('Remove image error:', error);
      setGeneralError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setGeneralError('');
    setSuccessMessage('');

    try {
      console.log('Starting profile update...');
      console.log('Token:', token ? 'Token exists' : 'No token');
      console.log('Form data:', data);
      console.log('Selected image:', selectedImage ? 'Image selected' : 'No image');

      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', data.firstName);
      formDataToSend.append('lastName', data.lastName);
      formDataToSend.append('phone', data.phone);

      if (selectedImage) {
        formDataToSend.append('profileImage', selectedImage);
      }

      console.log('Sending request to backend...');

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend,
        mode: 'cors'
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok) {
        // Update user in localStorage
        updateUser(result.user);
        setSuccessMessage('Profile updated successfully! 🎉');
        setSelectedImage(null);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setGeneralError(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      if (error.message === 'Failed to fetch') {
        setGeneralError(
          'Cannot connect to server. Please make sure the backend is running on http://localhost:5000'
        );
      } else {
        setGeneralError('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || ''
      });
    }
    setSelectedImage(null);
    setPreviewUrl(user?.profileImage || null);
  };

  const getUserInitials = () => {
    const firstInitial = user?.firstName?.charAt(0) || '';
    const lastInitial = user?.lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || 'U';
  };

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 transition mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
            {successMessage}
          </div>
        )}

        {/* General Error Message */}
        {generalError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {generalError}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Picture</h2>

              <div className="flex flex-col items-center">
                {/* Profile Image Preview */}
                <div className="relative mb-4">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-40 h-40 rounded-full object-cover border-4 border-pink-200"
                    />
                  ) : (
                    <div className="w-40 h-40 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-pink-200">
                      <span className="text-white text-5xl font-bold">
                        {getUserInitials()}
                      </span>
                    </div>
                  )}

                  {/* Remove Image Button */}
                  {previewUrl && (
                    <button
                      onClick={handleRemoveImage}
                      disabled={isLoading}
                      className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition disabled:opacity-50"
                      title="Remove image"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {imageError && <p className="text-red-500 text-sm mb-2">{imageError}</p>}

                {/* Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-700 transition disabled:opacity-50"
                >
                  <Camera size={20} />
                  {previewUrl ? 'Change Photo' : 'Upload Photo'}
                </button>

                <p className="text-xs text-gray-500 mt-2 text-center">
                  JPG, PNG or GIF. Max size 5MB
                </p>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-3xl shadow-lg p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Account Info</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Role</p>
                  <span className="inline-block px-3 py-1 bg-pink-100 text-pink-600 rounded-full font-semibold text-xs">
                    {user.role === 'admin' ? '👑 Admin' : '🌸 Customer'}
                  </span>
                </div>
                {user.createdAt && (
                  <div>
                    <p className="text-gray-500">Member Since</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* First Name & Last Name */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="text-gray-400" size={20} />
                      </div>
                      <input
                        type="text"
                        placeholder="John"
                        {...register('firstName')}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-pink-500 transition ${
                          errors.firstName ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      {...register('lastName')}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-pink-500 transition ${
                        errors.lastName ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Email (Read-only) */}
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
                      value={user.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="text-gray-400" size={20} />
                    </div>
                    <input
                      type="tel"
                      placeholder="09123456789"
                      {...register('phone')}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-pink-500 transition ${
                        errors.phone ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={20} />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    <X size={20} className="inline mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}