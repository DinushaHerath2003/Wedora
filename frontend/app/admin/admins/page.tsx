'use client';

import { useEffect, useState } from 'react';
import { FaBan, FaCheck, FaEdit, FaSearch, FaTimes, FaTrash, FaUserShield } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminApiErrorMessage, getAdminToken } from '@/lib/admin-api';

interface AdminRecord {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  isActive: boolean;
  createdAt: string;
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingAdmin, setEditingAdmin] = useState<AdminRecord | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<AdminRecord[]>('/admin/users', { token: getAdminToken() });
      setAdmins(data.filter((user) => user.role === 'admin'));
      setError('');
    } catch (err) {
      setError(getAdminApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const filteredAdmins = admins.filter((admin) => {
    const displayName = admin.name || admin.email;
    return (
      displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleToggleActive = async (admin: AdminRecord) => {
    try {
      await apiFetch(`/admin/users/${admin.id}`, {
        method: 'PUT',
        token: getAdminToken(),
        body: JSON.stringify({ isActive: !admin.isActive }),
      });
      await loadAdmins();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update admin');
    }
  };

  const handleDelete = async (admin: AdminRecord) => {
    if (!confirm(`Delete admin "${admin.name || admin.email}"? This cannot be undone.`)) return;
    try {
      await apiFetch(`/admin/users/${admin.id}`, {
        method: 'DELETE',
        token: getAdminToken(),
      });
      await loadAdmins();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete admin');
    }
  };

  const openEdit = (admin: AdminRecord) => {
    setEditingAdmin(admin);
    setEditForm({ name: admin.name || '', email: admin.email });
  };

  const handleSaveEdit = async () => {
    if (!editingAdmin) return;
    setSaving(true);
    try {
      await apiFetch(`/admin/users/${editingAdmin.id}`, {
        method: 'PUT',
        token: getAdminToken(),
        body: JSON.stringify({ ...editForm, role: 'admin' }),
      });
      setEditingAdmin(null);
      await loadAdmins();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update admin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Admin Management" subtitle="Manage administrator accounts separately from platform users">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Administrators</h2>
              <p className="text-sm text-gray-500">Admins have access to dashboard controls and platform messages.</p>
            </div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search admins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-72 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading admins...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#755A7B' }}>
                          <FaUserShield />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{admin.name || 'Admin'}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(admin.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(admin)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Edit">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleToggleActive(admin)} className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors" title={admin.isActive ? 'Deactivate' : 'Activate'}>
                          {admin.isActive ? <FaBan /> : <FaCheck />}
                        </button>
                        <button onClick={() => handleDelete(admin)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="Delete">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAdmins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No admins found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing {filteredAdmins.length} of {admins.length} admins
          </p>
        </div>
      </div>

      {editingAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Admin</h3>
              <button onClick={() => setEditingAdmin(null)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingAdmin(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: '#755A7B' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
