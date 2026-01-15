import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/auth/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, TRANSITIONS, SHADOWS, SPACING } from '../tokens';

type AuthMode = 'login' | 'signup';

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, error, clearError, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState<FormData>({ email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'signup') {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');

    if (!validateForm()) return;

    try {
      if (mode === 'login') {
        await signIn(formData.email, formData.password);
        setSuccessMessage('Sign in successful! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        await signUp(formData.email, formData.password);
        setSuccessMessage('Account created! Redirecting to home...');
        setFormData({ email: '', password: '', confirmPassword: '' });
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Auth error:', err);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setFormData({ email: '', password: '', confirmPassword: '' });
    setValidationErrors({});
    clearError();
    setSuccessMessage('');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background: `linear-gradient(135deg, ${COLORS.primaryBg} 0%, ${COLORS.white} 100%)`,
      }}
    >
      <div 
        className="w-full max-w-md"
        style={{
          animation: 'fadeInUp 0.6s ease-out',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="mb-2"
            style={{
              fontSize: TYPOGRAPHY.fontSize['3xl'],
              fontFamily: TYPOGRAPHY.fontFamily.serif,
              fontWeight: TYPOGRAPHY.fontWeight.bold,
              color: COLORS.dark,
            }}
          >
            {mode === 'login' ? 'Welcome Back' : 'Join Us'}
          </h1>
          <p
            style={{
              fontSize: TYPOGRAPHY.fontSize.base,
              color: COLORS.gray[600],
              fontWeight: TYPOGRAPHY.fontWeight.normal,
            }}
          >
            {mode === 'login'
              ? 'Sign in to access exclusive bookings and features'
              : 'Create an account to explore our properties'}
          </p>
        </div>

        {/* Card */}
        <div 
          className="rounded-lg p-8"
          style={{
            backgroundColor: COLORS.white,
            boxShadow: SHADOWS.lg,
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Error Message */}
          {error && (
            <div 
              className="mb-6 p-4 rounded-lg flex gap-3"
              style={{
                backgroundColor: '#fee2e2',
                border: `1px solid ${COLORS.error}`,
              }}
            >
              <AlertCircle 
                size={20} 
                style={{ color: COLORS.error, flexShrink: 0, marginTop: '2px' }}
              />
              <p style={{ color: COLORS.error, fontSize: TYPOGRAPHY.fontSize.sm }}>
                {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div 
              className="mb-6 p-4 rounded-lg flex gap-3"
              style={{
                backgroundColor: '#dcfce7',
                border: `1px solid ${COLORS.success}`,
              }}
            >
              <CheckCircle 
                size={20} 
                style={{ color: COLORS.success, flexShrink: 0, marginTop: '2px' }}
              />
              <p style={{ color: COLORS.success, fontSize: TYPOGRAPHY.fontSize.sm }}>
                {successMessage}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  marginBottom: SPACING[2],
                  fontSize: TYPOGRAPHY.fontSize.sm,
                  fontWeight: TYPOGRAPHY.fontWeight.medium,
                  color: COLORS.dark,
                }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail 
                  size={18} 
                  style={{
                    position: 'absolute',
                    left: SPACING[4],
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: COLORS.gray[400],
                  }}
                />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (validationErrors.email) {
                      setValidationErrors({ ...validationErrors, email: '' });
                    }
                  }}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 rounded-lg transition-all"
                  style={{
                    fontSize: TYPOGRAPHY.fontSize.base,
                    border: validationErrors.email 
                      ? `2px solid ${COLORS.error}`
                      : `2px solid ${COLORS.gray[200]}`,
                    backgroundColor: COLORS.white,
                    color: COLORS.dark,
                    transition: TRANSITIONS.base,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(212, 73, 47, 0.1)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = validationErrors.email 
                      ? COLORS.error
                      : COLORS.gray[200];
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              {validationErrors.email && (
                <p style={{ color: COLORS.error, fontSize: TYPOGRAPHY.fontSize.xs, marginTop: SPACING[1] }}>
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  marginBottom: SPACING[2],
                  fontSize: TYPOGRAPHY.fontSize.sm,
                  fontWeight: TYPOGRAPHY.fontWeight.medium,
                  color: COLORS.dark,
                }}
              >
                Password
              </label>
              <div className="relative">
                <Lock 
                  size={18} 
                  style={{
                    position: 'absolute',
                    left: SPACING[4],
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: COLORS.gray[400],
                  }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (validationErrors.password) {
                      setValidationErrors({ ...validationErrors, password: '' });
                    }
                  }}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-12 pr-12 py-3 rounded-lg transition-all"
                  style={{
                    fontSize: TYPOGRAPHY.fontSize.base,
                    border: validationErrors.password 
                      ? `2px solid ${COLORS.error}`
                      : `2px solid ${COLORS.gray[200]}`,
                    backgroundColor: COLORS.white,
                    color: COLORS.dark,
                    transition: TRANSITIONS.base,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(212, 73, 47, 0.1)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = validationErrors.password 
                      ? COLORS.error
                      : COLORS.gray[200];
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.password && (
                <p style={{ color: COLORS.error, fontSize: TYPOGRAPHY.fontSize.xs, marginTop: SPACING[1] }}>
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  style={{
                    display: 'block',
                    marginBottom: SPACING[2],
                    fontSize: TYPOGRAPHY.fontSize.sm,
                    fontWeight: TYPOGRAPHY.fontWeight.medium,
                    color: COLORS.dark,
                  }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock 
                    size={18} 
                    style={{
                      position: 'absolute',
                      left: SPACING[4],
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: COLORS.gray[400],
                    }}
                  />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (validationErrors.confirmPassword) {
                        setValidationErrors({ ...validationErrors, confirmPassword: '' });
                      }
                    }}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full pl-12 pr-12 py-3 rounded-lg transition-all"
                    style={{
                      fontSize: TYPOGRAPHY.fontSize.base,
                      border: validationErrors.confirmPassword 
                        ? `2px solid ${COLORS.error}`
                        : `2px solid ${COLORS.gray[200]}`,
                      backgroundColor: COLORS.white,
                      color: COLORS.dark,
                      transition: TRANSITIONS.base,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = COLORS.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 3px rgba(212, 73, 47, 0.1)`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = validationErrors.confirmPassword 
                        ? COLORS.error
                        : COLORS.gray[200];
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p style={{ color: COLORS.error, fontSize: TYPOGRAPHY.fontSize.xs, marginTop: SPACING[1] }}>
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: COLORS.primary,
                color: COLORS.white,
                fontSize: TYPOGRAPHY.fontSize.base,
                fontWeight: TYPOGRAPHY.fontWeight.semibold,
                transition: TRANSITIONS.base,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primaryLight;
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primary;
              }}
            >
              {loading ? (
                <>
                  <span 
                    className="inline-block animate-spin"
                    style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent' }}
                  />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div 
            className="mt-6 pt-6 text-center"
            style={{
              borderTop: `1px solid ${COLORS.gray[200]}`,
            }}
          >
            <p style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.gray[600], marginBottom: SPACING[3] }}>
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <button
              type="button"
              onClick={toggleMode}
              disabled={loading}
              className="inline-block font-semibold transition-colors hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                fontSize: TYPOGRAPHY.fontSize.base,
                color: COLORS.primary,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.color = COLORS.primaryDark;
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = COLORS.primary;
              }}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div 
          className="mt-6 text-center text-xs"
          style={{
            color: COLORS.gray[500],
          }}
        >
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Auth;
