'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import { FaBell, FaCalendarAlt, FaChartBar, FaCog, FaEdit, FaEye, FaFileInvoice, FaHeart, FaHome, FaMapMarkerAlt, FaMoon, FaPhone, FaPlus, FaSave, FaUserTie } from 'react-icons/fa';

interface VendorUser {
  id?: number | string;
  name?: string;
  email: string;
  role: string;
  organizationName?: string;
}

interface VendorProfile {
  id: number;
  email: string;
  organizationName: string;
  contactPerson?: string;
  phone?: string;
  location?: string;
  categories?: string[];
  isActive?: boolean;
}

const fashionBeautyCategories = ['fashion-beauty'];

export default function FashionBeautySettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    organizationName: '',
    contactPerson: '',
    phone: '',
    location: '',
    categories: fashionBeautyCategories,
  });

  const organizationLabel = form.organizationName || user?.organizationName || user?.name || 'Fashion & Beauty Vendor';
  const organizationInitial = organizationLabel.charAt(0).toUpperCase();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr) as VendorUser;
    setUser(userData);

    if (userData.role !== 'vendor') {
      router.push('/');
      return;
    }

    const vendorId = Number(userData.id);
    if (!Number.isFinite(vendorId) || vendorId <= 0) {
      router.push('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await apiFetch<VendorProfile>(`/vendors/${vendorId}`);
        setProfile(data);
        setForm({
          organizationName: data.organizationName || '',
          contactPerson: data.contactPerson || '',
          phone: data.phone || '',
          location: data.location || '',
          categories: data.categories?.length ? data.categories : fashionBeautyCategories,
        });
      } catch (error) {
        console.error('Failed to load vendor profile', error);
        setToast({ message: 'Unable to load company settings.', type: 'error' });
      }
    };

    loadProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleSave = async () => {
    if (!profile) return;

    if (!form.organizationName.trim()) {
      setToast({ message: 'Company name is required.', type: 'error' });
      return;
    }

    try {
      setIsSaving(true);
      const updated = await apiFetch<VendorProfile>(`/vendors/${profile.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          organizationName: form.organizationName.trim(),
          contactPerson: form.contactPerson.trim() || undefined,
          phone: form.phone.trim() || undefined,
          location: form.location.trim() || undefined,
          categories: form.categories,
        }),
      });

      setProfile(updated);
      const updatedUser = {
        ...(user || {}),
        organizationName: updated.organizationName,
        name: updated.organizationName,
        email: updated.email,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser as VendorUser);
      setToast({ message: 'Company profile saved successfully.', type: 'success' });
    } catch (error) {
      console.error('Failed to save vendor profile', error);
      setToast({
        message: `Unable to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{ backgroundColor: '#f5f5f7' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <aside className="w-full md:w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#755A7B' }}>
              {organizationInitial}
            </div>
            <div>
              <h2 className="font-bold text-gray-800">{organizationLabel}</h2>
              <p className="text-xs text-gray-500">fashion & beauty</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Main Menu</p>
            <button onClick={() => router.push('/dashboard/fashion-beauty/overview')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaChartBar /> Overview</button>
            <button onClick={() => router.push('/dashboard/fashion-beauty')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaPlus /> Post Package</button>
            <button onClick={() => router.push('/dashboard/fashion-beauty/posted-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaFileInvoice /> Posted Packages</button>
            <button onClick={() => router.push('/dashboard/fashion-beauty/draft-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaEdit /> Draft Package</button>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Appointment</p>
            <button onClick={() => router.push('/dashboard/fashion-beauty/place-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaCalendarAlt /> Place a Booking</button>
            <button onClick={() => router.push('/dashboard/fashion-beauty/accept-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaEye /> Accept Booking</button>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">General</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaBell /> Notifications</button>
            <button onClick={() => router.push('/dashboard/fashion-beauty/feedback')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaHeart /> Feedback</button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors" style={{ backgroundColor: '#755A7B', color: 'white' }}><FaCog /> Setting</button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-white transition-all" style={{ backgroundColor: '#755A7B' }}><FaMoon /> Logout</button>
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
                <FaHome /> Home
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Vendor Dashboard</p>
                <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section className="xl:col-span-1 bg-white rounded-xl shadow-md p-6">
              <div className="h-24 rounded-xl mb-6" style={{ background: 'linear-gradient(135deg, #755A7B, #10b981)' }} />
              <div className="-mt-14 mb-5 flex justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center text-white text-3xl font-bold shadow-lg" style={{ backgroundColor: '#755A7B' }}>
                  {organizationInitial}
                </div>
              </div>
              <h2 className="text-center text-xl font-bold text-gray-900">{organizationLabel}</h2>
              <p className="text-center text-sm text-gray-500 mt-1">{profile?.email || user?.email}</p>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 text-gray-700"><FaUserTie style={{ color: '#755A7B' }} /> {form.contactPerson || 'Contact person not set'}</div>
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 text-gray-700"><FaPhone style={{ color: '#755A7B' }} /> {form.phone || 'Phone number not set'}</div>
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 text-gray-700"><FaMapMarkerAlt style={{ color: '#755A7B' }} /> {form.location || 'Location not set'}</div>
              </div>
            </section>

            <section className="xl:col-span-2 bg-white rounded-xl shadow-md p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Profile</p>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Company Details</h2>
                </div>
                <button onClick={handleSave} disabled={isSaving || !profile} className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: '#755A7B' }}>
                  <FaSave /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 mb-2">Company Name</span>
                  <input value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900" />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 mb-2">Email</span>
                  <input value={profile?.email || user?.email || ''} disabled className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 mb-2">Contact Person</span>
                  <input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900" />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 mb-2">Phone Number</span>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900" />
                </label>
                <label className="block md:col-span-2">
                  <span className="block text-sm font-medium text-gray-700 mb-2">Business Location</span>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900" />
                </label>
              </div>

              <div className="mt-6 rounded-xl border border-purple-100 p-4" style={{ backgroundColor: 'rgba(117, 90, 123, 0.04)' }}>
                <p className="text-sm font-semibold text-gray-800 mb-3">Service Category</p>
                <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: '#755A7B' }}>
                  Fashion & Beauty
                </span>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}


