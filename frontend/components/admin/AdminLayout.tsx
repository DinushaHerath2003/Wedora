'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FaUsers,
  FaUserTie,
  FaBars,
  FaTimes,
  FaHome,
  FaEnvelope,
  FaSignOutAlt,
} from 'react-icons/fa';
import { getAdminToken } from '@/lib/admin-api';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: FaHome },
  { href: '/admin/users', label: 'User Management', icon: FaUsers },
  { href: '/admin/vendors', label: 'Vendor Management', icon: FaUserTie },
  { href: '/admin/messages', label: 'Contact Messages', icon: FaEnvelope },
];

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr) as AdminUser;
      if (userData.role !== 'admin') {
        router.push('/login');
        return;
      }
      setAdminUser(userData);
    } catch {
      router.push('/login');
      return;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading || !adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#755A7B', borderTopColor: 'transparent' }}
          />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const displayName = adminUser.name || 'Admin';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Wedora" className="h-10 w-10" />
              <span
                className="text-xl font-bold"
                style={{ color: '#755A7B', fontFamily: 'var(--font-season)' }}
              >
                Wedora
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: '#755A7B' }}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'text-white' : 'hover:bg-purple-50'
                }`}
                style={{
                  backgroundColor: isActive ? '#755A7B' : undefined,
                  color: isActive ? undefined : '#755A7B',
                }}
              >
                <Icon className="text-lg" />
                {sidebarOpen && <span className="font-medium">{label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="shadow-sm sticky top-0 z-30" style={{ backgroundColor: '#755A7B' }}>
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {title || `Good morning, ${displayName}!`}
              </h1>
              <p className="text-sm text-purple-200">
                {subtitle || "Here's what's happening with your platform today"}
              </p>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-purple-400">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-lg font-bold"
                style={{ color: '#755A7B' }}
              >
                {displayName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{displayName}</p>
                <p className="text-xs text-purple-200">Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 text-white transition-colors"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">{children}</div>

        <footer style={{ backgroundColor: '#755A7B' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-purple-100">
              <p>&copy; 2026 Wedora. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
        </div>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="text-2xl" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

export { getAdminToken };
