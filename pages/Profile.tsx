import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { LogOut, Mail, Calendar, Shield, AlertCircle, CheckCircle, Loader, MapPin, Users, Clock } from 'lucide-react';
import { useAuth } from '../src/auth/AuthContext';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, TRANSITIONS, SHADOWS, SPACING } from '../tokens';

interface Booking {
  id: string;
  property_id: string;
  property_name?: string;
  property_type: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  total_price: number;
  currency: string;
  status: string;
  created_at: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  // Fetch bookings
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      // This endpoint would be called on your backend to get user's bookings
      // For now, we'll just set empty state
      setBookings([]);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setError(null);
      setIsSigningOut(true);
      await signOut();
      setSuccess('Signed out successfully');
      setTimeout(() => navigate('/auth'), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out';
      setError(message);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const userInitials = user.email
    ?.split('@')[0]
    .split('.')
    .map((part) => part[0].toUpperCase())
    .join('')
    .slice(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-32 pb-16">
      <Helmet>
        <title>My Profile | New Manyatta Kenya</title>
        <meta name="description" content="Manage your profile and account settings" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </motion.div>

        {/* Alert Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{success}</p>
          </motion.div>
        )}

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          {/* Profile Header with Avatar */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-8">
            <div className="flex items-end gap-6">
              <div
                className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-lg border-4 border-white flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                }}
              >
                <span className="text-3xl font-bold text-white">{userInitials}</span>
              </div>
              <div className="flex-1 pb-2">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {user.user_metadata?.full_name || 'User'}
                </h2>
                <p className="text-white/80 text-sm">Account Owner</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8 space-y-6">
            {/* Email Section */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Email Address
                </label>
                <p className="text-gray-700 break-all">{user.email || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {user.email_confirmed_at ? (
                    <span className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Email verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      Email not verified
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Account Created */}
            <div className="flex items-start gap-4 pt-4 border-t border-gray-200">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Account Created
                </label>
                <p className="text-gray-700">{formatDate(user.created_at)}</p>
              </div>
            </div>

            {/* Last Sign In */}
            <div className="flex items-start gap-4 pt-4 border-t border-gray-200">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Last Sign In
                </label>
                <p className="text-gray-700">
                  {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                </p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-start gap-4 pt-4 border-t border-gray-200">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  User ID
                </label>
                <p className="text-gray-700 text-sm font-mono break-all">{user.id}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bookings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">My Bookings</h3>
            <p className="text-gray-600 text-sm">View and manage your property reservations</p>
          </div>

          <div className="p-8">
            {loadingBookings ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full"
                />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h4>
                <p className="text-gray-600 mb-6">
                  You haven't made any bookings. Start exploring our properties!
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                >
                  Explore Properties
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    whileHover={{ y: -2 }}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {booking.property_name || `${booking.property_type.charAt(0).toUpperCase()}${booking.property_type.slice(1)} Property`}
                        </h4>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {booking.currency} {booking.total_price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Check-In</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(booking.check_in_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Check-Out</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(booking.check_out_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Guests</p>
                          <p className="text-sm font-medium text-gray-900">{booking.number_of_guests}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Type</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">{booking.property_type}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Account Settings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Account Settings</h3>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className={`w-full px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              isSigningOut
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100 hover:border-red-300 active:scale-95'
            }`}
          >
            {isSigningOut ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Signing Out...
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5" />
                Sign Out
              </>
            )}
          </button>

          {/* Coming Soon Features */}
          <div className="mt-8 pt-8 border-t border-gray-200 space-y-4">
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-4">
              Coming Soon
            </p>
            <button
              disabled
              className="w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-400 font-medium hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-left"
            >
              Change Password
            </button>
            <button
              disabled
              className="w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-400 font-medium hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-left"
            >
              Update Profile Information
            </button>
            <button
              disabled
              className="w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-400 font-medium hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-left"
            >
              Manage Notifications
            </button>
          </div>
        </motion.div>

        {/* Helpful Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
