'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { getVendorDashboardPath } from '@/lib/constants';

type UserAuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
    organizationName?: string;
    location?: string;
    categories?: string[];
    isActive?: boolean;
  };
};

type VendorAuthResponse = {
  accessToken: string;
  id: number;
  email: string;
  role: string;
  organizationName: string;
  phone: string;
  location: string;
  categories: string[];
  contactPerson?: string;
  isActive: boolean;
  createdAt: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');

    if (!formData.email || !formData.password) {
      setErrors('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      try {
        const vendorResponse = await apiFetch<VendorAuthResponse>('/vendors/auth/login', {
          method: 'POST',
          body: JSON.stringify(formData),
        });

        localStorage.setItem('token', vendorResponse.accessToken);
        localStorage.setItem(
          'user',
          JSON.stringify({
            ...vendorResponse,
            role: 'vendor',
          })
        );
        router.push(getVendorDashboardPath(vendorResponse.categories));
        return;
      } catch {
        const userResponse = await apiFetch<UserAuthResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(formData),
        });

        localStorage.setItem('token', userResponse.token);
        localStorage.setItem('user', JSON.stringify(userResponse.user));

        switch (userResponse.user.role) {
          case 'user':
            router.push('/dashboard/user');
            break;
          case 'admin':
            router.push('/dashboard/admin');
            break;
          default:
            router.push('/');
        }
      }
    } catch (error) {
      setErrors(error instanceof Error ? error.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" 
      style={{
        backgroundImage: 'url(/19.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="max-w-md w-full space-y-8 p-10 rounded-xl shadow-2xl" style={{backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)'}}>
        <div>
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Wedora Logo" className="h-20 w-20" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white" style={{fontFamily: 'var(--font-season)'}}>
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-white">
            Welcome back to Wedora
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-white rounded-md shadow-sm focus:outline-none focus:ring-2 bg-transparent text-white placeholder-gray-200"
                style={{borderColor: 'rgba(255, 255, 255, 0.5)', color: '#755A7B'}}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-white rounded-md shadow-sm focus:outline-none focus:ring-2 bg-transparent text-white placeholder-gray-200"
                style={{borderColor: 'rgba(255, 255, 255, 0.5)', color: '#755A7B'}}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {errors && (
            <div className="rounded-md p-4" style={{backgroundColor: 'rgba(239, 68, 68, 0.2)'}}>
              <p className="text-sm text-white">{errors}</p>
            </div>
          )}

          {/* Remember me and forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 border-gray-300 rounded"
                style={{accentColor: '#755A7B'}}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-white hover:underline">
                Forgot your password?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border-2 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                borderColor: '#755A7B',
                color: '#755A7B',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#755A7B';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(117, 90, 123, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#755A7B';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          {/* Signup Link */}
          <div className="text-center">
            <p className="text-sm text-white">
              Don't have an account?{' '}
              <a href="/signup" className="font-medium hover:underline" style={{color: '#755A7B'}}>
                Create one now
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
