'use client';

import { useRouter } from 'next/navigation';
import {
  FaHeart,
  FaBell,
  FaEdit,
  FaCalendarAlt,
  FaEye,
  FaChartBar,
  FaFileInvoice,
  FaCog,
  FaMoon,
  FaPlus,
} from 'react-icons/fa';
import { CEREMONIAL_DASHBOARD_BASE } from '@/lib/ceremonial-dashboard';

export type CeremonialNavPage =
  | 'overview'
  | 'post'
  | 'posted-packages'
  | 'draft-packages'
  | 'place-booking'
  | 'accept-booking';

interface CeremonialSidebarProps {
  activePage: CeremonialNavPage;
  organizationLabel: string;
  organizationInitial: string;
}

function navButtonClass(isActive: boolean) {
  return `w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
    isActive ? '' : 'text-gray-600 hover:bg-gray-100'
  }`;
}

export default function CeremonialSidebar({
  activePage,
  organizationLabel,
  organizationInitial,
}: CeremonialSidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const activeStyle = { backgroundColor: '#755A7B', color: 'white' };

  return (
    <aside className="w-full md:w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: '#755A7B' }}
          >
            {organizationInitial}
          </div>
          <div>
            <h2 className="font-bold text-gray-800">{organizationLabel}</h2>
            <p className="text-xs text-gray-500">Traditional Ceremonial Services</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Main Menu</p>
          <button
            onClick={() => router.push(`${CEREMONIAL_DASHBOARD_BASE}/overview`)}
            className={navButtonClass(activePage === 'overview')}
            style={activePage === 'overview' ? activeStyle : undefined}
          >
            <FaChartBar /> Overview
          </button>
          <button
            onClick={() => router.push(CEREMONIAL_DASHBOARD_BASE)}
            className={navButtonClass(activePage === 'post')}
            style={activePage === 'post' ? activeStyle : undefined}
          >
            <FaPlus /> Post Package
          </button>
          <button
            onClick={() => router.push(`${CEREMONIAL_DASHBOARD_BASE}/posted-packages`)}
            className={navButtonClass(activePage === 'posted-packages')}
            style={activePage === 'posted-packages' ? activeStyle : undefined}
          >
            <FaFileInvoice /> Posted Packages
          </button>
          <button
            onClick={() => router.push(`${CEREMONIAL_DASHBOARD_BASE}/draft-packages`)}
            className={navButtonClass(activePage === 'draft-packages')}
            style={activePage === 'draft-packages' ? activeStyle : undefined}
          >
            <FaEdit /> Draft Package
          </button>
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Appointment</p>
          <button
            onClick={() => router.push(`${CEREMONIAL_DASHBOARD_BASE}/place-booking`)}
            className={navButtonClass(activePage === 'place-booking')}
            style={activePage === 'place-booking' ? activeStyle : undefined}
          >
            <FaCalendarAlt /> Place a Booking
          </button>
          <button
            onClick={() => router.push(`${CEREMONIAL_DASHBOARD_BASE}/accept-booking`)}
            className={navButtonClass(activePage === 'accept-booking')}
            style={activePage === 'accept-booking' ? activeStyle : undefined}
          >
            <FaEye /> Accept Booking
          </button>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2 px-3">General</p>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
            <FaBell /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
            <FaHeart /> Feedback
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
            <FaCog /> Setting
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-white transition-all"
            style={{ backgroundColor: '#755A7B' }}
          >
            <FaMoon /> Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
