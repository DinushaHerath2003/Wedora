'use client';

import { useEffect, useState } from 'react';
import { FaSearch, FaTrash, FaReply, FaTimes, FaEnvelopeOpen, FaEnvelope } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminToken, getAdminApiErrorMessage } from '@/lib/admin-api';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'read' | 'replied'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<ContactMessage[]>('/admin/messages', { token: getAdminToken() });
      setMessages(data);
      setError('');
    } catch (err) {
      setError(getAdminApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const filteredMessages = messages.filter((msg) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      msg.name.toLowerCase().includes(q) ||
      msg.email.toLowerCase().includes(q) ||
      msg.subject.toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'all' || msg.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setReplyText(msg.adminReply || '');
    if (msg.status === 'new') {
      try {
        const updated = await apiFetch<ContactMessage>(`/admin/messages/${msg.id}/read`, {
          method: 'PATCH',
          token: getAdminToken(),
        });
        setSelectedMessage(updated);
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? updated : m)));
      } catch {
        setSelectedMessage(msg);
      }
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    setSending(true);
    try {
      const updated = await apiFetch<ContactMessage>(
        `/admin/messages/${selectedMessage.id}/reply`,
        {
          method: 'PATCH',
          token: getAdminToken(),
          body: JSON.stringify({ reply: replyText.trim() }),
        },
      );
      setSelectedMessage(updated);
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      alert(`Reply saved for ${selectedMessage.email}. (Email delivery can be configured separately.)`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (msg: ContactMessage) => {
    if (!confirm(`Delete message from "${msg.name}"?`)) return;
    try {
      await apiFetch(`/admin/messages/${msg.id}`, {
        method: 'DELETE',
        token: getAdminToken(),
      });
      if (selectedMessage?.id === msg.id) setSelectedMessage(null);
      await loadMessages();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete message');
    }
  };

  const statusBadge = (status: ContactMessage['status']) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-yellow-100 text-yellow-800',
      replied: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <AdminLayout title="Contact Messages" subtitle="View and reply to messages from the contact form">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="all">All Messages</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filteredMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={`w-full text-left p-4 hover:bg-purple-50 transition-colors ${
                    selectedMessage?.id === msg.id ? 'bg-purple-50 border-l-4' : ''
                  }`}
                  style={selectedMessage?.id === msg.id ? { borderLeftColor: '#755A7B' } : undefined}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {msg.status === 'new' ? (
                        <FaEnvelope className="text-blue-500 flex-shrink-0" />
                      ) : (
                        <FaEnvelopeOpen className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className="font-medium text-gray-900 truncate">{msg.name}</span>
                    </div>
                    {statusBadge(msg.status)}
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-1 truncate">{msg.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </button>
              ))}
              {filteredMessages.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">No messages found</div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          {selectedMessage ? (
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    From <strong>{selectedMessage.name}</strong> ({selectedMessage.email})
                    {selectedMessage.phone && ` · ${selectedMessage.phone}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Received{' '}
                    {new Date(selectedMessage.createdAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {statusBadge(selectedMessage.status)}
                  <button
                    onClick={() => handleDelete(selectedMessage)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              {selectedMessage.adminReply && (
                <div className="mb-6 p-4 rounded-lg border border-green-200 bg-green-50">
                  <p className="text-xs font-semibold text-green-700 mb-2">
                    Previous Reply
                    {selectedMessage.repliedAt &&
                      ` · ${new Date(selectedMessage.repliedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`}
                  </p>
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.adminReply}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaReply /> Send Reply
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply to the customer..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleReply}
                  disabled={sending || !replyText.trim()}
                  className="mt-3 px-6 py-2 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                  style={{ backgroundColor: '#755A7B' }}
                >
                  <FaReply />
                  {sending ? 'Sending...' : selectedMessage.adminReply ? 'Update Reply' : 'Send Reply'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <FaEnvelope className="text-4xl mx-auto mb-4 text-gray-300" />
              <p>Select a message to read and reply</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
