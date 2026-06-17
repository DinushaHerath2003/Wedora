'use client';

import { useEffect, useState } from 'react';
import { FaSearch, FaEdit, FaTrash, FaBan, FaCheck, FaTimes } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminToken, getAdminApiErrorMessage } from '@/lib/admin-api';

interface VendorRecord {
  id: number;
  organizationName: string;
  email: string;
  phone?: string;
  location?: string;
  categories?: string[];
  contactPerson?: string;
  isActive: boolean;
  createdAt: string;
  offerings?: { id: number }[];
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingVendor, setEditingVendor] = useState<VendorRecord | null>(null);
  const [editForm, setEditForm] = useState({
    organizationName: '',
    email: '',
    phone: '',
    location: '',
    contactPerson: '',
    categories: '',
  });
  const [saving, setSaving] = useState(false);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<VendorRecord[]>('/admin/vendors', { token: getAdminToken() });
      setVendors(data);
      setError('');
    } catch (err) {
      setError(getAdminApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const filteredVendors = vendors.filter((vendor) => {
    const q = searchQuery.toLowerCase();
    return (
      vendor.organizationName.toLowerCase().includes(q) ||
      vendor.email.toLowerCase().includes(q) ||
      (vendor.location || '').toLowerCase().includes(q)
    );
  });

  const handleToggleActive = async (vendor: VendorRecord) => {
    try {
      await apiFetch(`/admin/vendors/${vendor.id}`, {
        method: 'PUT',
        token: getAdminToken(),
        body: JSON.stringify({ isActive: !vendor.isActive }),
      });
      await loadVendors();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update vendor');
    }
  };

  const handleDelete = async (vendor: VendorRecord) => {
    if (!confirm(`Delete vendor "${vendor.organizationName}"? This cannot be undone.`)) return;
    try {
      await apiFetch(`/admin/vendors/${vendor.id}`, {
        method: 'DELETE',
        token: getAdminToken(),
      });
      await loadVendors();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete vendor');
    }
  };

  const openEdit = (vendor: VendorRecord) => {
    setEditingVendor(vendor);
    setEditForm({
      organizationName: vendor.organizationName,
      email: vendor.email,
      phone: vendor.phone || '',
      location: vendor.location || '',
      contactPerson: vendor.contactPerson || '',
      categories: (vendor.categories || []).join(', '),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingVendor) return;
    setSaving(true);
    try {
      await apiFetch(`/admin/vendors/${editingVendor.id}`, {
        method: 'PUT',
        token: getAdminToken(),
        body: JSON.stringify({
          organizationName: editForm.organizationName,
          email: editForm.email,
          phone: editForm.phone || undefined,
          location: editForm.location || undefined,
          contactPerson: editForm.contactPerson || undefined,
          categories: editForm.categories
            ? editForm.categories.split(',').map((c) => c.trim()).filter(Boolean)
            : [],
        }),
      });
      setEditingVendor(null);
      await loadVendors();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update vendor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Vendor Management" subtitle="Manage all vendors registered on the platform">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">All Vendors</h2>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading vendors...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categories</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Packages</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: '#755A7B' }}
                        >
                          {vendor.organizationName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{vendor.organizationName}</div>
                          <div className="text-sm text-gray-500">{vendor.email}</div>
                          {vendor.phone && <div className="text-xs text-gray-400">{vendor.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.location || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {(vendor.categories || []).slice(0, 2).map((cat) => (
                          <span key={cat} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                            {cat}
                          </span>
                        ))}
                        {(vendor.categories || []).length > 2 && (
                          <span className="text-xs text-gray-400">+{vendor.categories!.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vendor.offerings?.length ?? 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          vendor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {vendor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vendor.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(vendor)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleToggleActive(vendor)}
                          className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
                          title={vendor.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {vendor.isActive ? <FaBan /> : <FaCheck />}
                        </button>
                        <button
                          onClick={() => handleDelete(vendor)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredVendors.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No vendors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing {filteredVendors.length} of {vendors.length} vendors
          </p>
        </div>
      </div>

      {editingVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Vendor</h3>
              <button onClick={() => setEditingVendor(null)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  value={editForm.organizationName}
                  onChange={(e) => setEditForm({ ...editForm, organizationName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={editForm.contactPerson}
                  onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categories (comma-separated)
                </label>
                <input
                  type="text"
                  value={editForm.categories}
                  onChange={(e) => setEditForm({ ...editForm, categories: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="venue-accommodation, photography-videography"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingVendor(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50"
                style={{ backgroundColor: '#755A7B' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
