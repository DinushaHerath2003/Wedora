'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaUsers, FaUserTie, FaCalendarCheck, FaDollarSign, FaEnvelope } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';
import AdminLayout, { StatCard } from '@/components/admin/AdminLayout';
import AdminCharts from '@/components/admin/AdminCharts';
import { getAdminToken, getAdminApiErrorMessage } from '@/lib/admin-api';

interface ChartSlice {
  name: string;
  value: number;
  color: string;
}

interface Stats {
  totalUsers: number;
  totalVendors: number;
  totalBookings: number;
  totalRevenue: number;
  totalMessages: number;
  unreadMessages: number;
  usersByRole: ChartSlice[];
  vendorsByStatus: ChartSlice[];
  bookingsByStatus: ChartSlice[];
  messagesByStatus: ChartSlice[];
  monthlyActivity: {
    month: string;
    users: number;
    vendors: number;
    bookings: number;
  }[];
  platformOverview: {
    name: string;
    count: number;
    color: string;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const token = getAdminToken();
      if (!token) {
        setError('Please log in as admin to view dashboard stats.');
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch<Stats>('/admin/stats', { token });
        setStats(data);
        setError('');
      } catch (err) {
        setError(getAdminApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <AdminLayout>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading dashboard stats...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              label="Total Users"
              value={stats?.totalUsers ?? 0}
              icon={FaUsers}
              iconBg="#E3F2FD"
              iconColor="#2196F3"
            />
            <StatCard
              label="Total Bookings"
              value={stats?.totalBookings ?? 0}
              icon={FaCalendarCheck}
              iconBg="#F3E5F5"
              iconColor="#9C27B0"
            />
            <StatCard
              label="Total Vendors"
              value={stats?.totalVendors ?? 0}
              icon={FaUserTie}
              iconBg="#FFF3E0"
              iconColor="#FF9800"
            />
            <StatCard
              label="Total Revenue"
              value={stats ? `Rs ${stats.totalRevenue.toLocaleString()}` : 'Rs 0'}
              icon={FaDollarSign}
              iconBg="#FEE2E2"
              iconColor="#EF4444"
            />
            <StatCard
              label="Contact Messages"
              value={stats?.totalMessages ?? 0}
              icon={FaEnvelope}
              iconBg="#F3E5F5"
              iconColor="#755A7B"
            />
          </div>

          {stats && (
            <div className="mb-8">
              <AdminCharts
                usersByRole={stats.usersByRole}
                vendorsByStatus={stats.vendorsByStatus}
                bookingsByStatus={stats.bookingsByStatus}
                messagesByStatus={stats.messagesByStatus}
                monthlyActivity={stats.monthlyActivity}
                platformOverview={stats.platformOverview}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/admin/users"
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#E3F2FD' }}
                >
                  <FaUsers className="text-xl" style={{ color: '#2196F3' }} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Manage Users</h3>
                  <p className="text-sm text-gray-500">View, edit, and deactivate users</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/vendors"
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#FFF3E0' }}
                >
                  <FaUserTie className="text-xl" style={{ color: '#FF9800' }} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Manage Vendors</h3>
                  <p className="text-sm text-gray-500">Update vendor details and status</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/messages"
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#F3E5F5' }}
                >
                  <FaEnvelope className="text-xl" style={{ color: '#755A7B' }} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    Contact Messages
                    {stats && stats.unreadMessages > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600">
                        {stats.unreadMessages} new
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">Read and reply to contact form messages</p>
                </div>
              </div>
            </Link>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
