'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter, FaReply, FaClock, FaUserCircle, FaSignOutAlt, FaSyncAlt } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  adminReply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
}

type NavUser = {
  name?: string;
  email?: string;
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesEmail, setMessagesEmail] = useState('');
  const [messagesError, setMessagesError] = useState('');
  const [user, setUser] = useState<NavUser | null>(null);

  const loadContactMessages = async () => {
    if (!user?.email) return;
    setMessagesLoading(true);
    setMessagesError('');
    try {
      const data = await apiFetch<ContactMessage[]>('/contact/my');
      setContactMessages(data);
      setMessagesEmail(user.email);
    } catch (err) {
      setContactMessages([]);
      setMessagesError(err instanceof Error ? err.message : 'Failed to load your messages.');
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setUser(null);
      setContactMessages([]);
      setMessagesEmail('');
      return;
    }

    try {
      const user = JSON.parse(userStr) as { name?: string; email?: string };
      const normalizedUser = {
        ...user,
        email: user.email?.trim().toLowerCase(),
      };
      setUser(normalizedUser);
      setFormData((current) => ({
        ...current,
        name: normalizedUser.name || current.name,
        email: normalizedUser.email || current.email,
      }));
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('auth-changed', loadUser);
    window.addEventListener('storage', loadUser);

    return () => {
      window.removeEventListener('auth-changed', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  useEffect(() => {
    if (!user?.email) return;

    loadContactMessages();
    const refresh = () => loadContactMessages();
    window.addEventListener('focus', refresh);
    const intervalId = window.setInterval(refresh, 30000);

    return () => {
      window.removeEventListener('focus', refresh);
      window.clearInterval(intervalId);
    };
  }, [user?.email]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setContactMessages([]);
    setMessagesEmail('');
    window.dispatchEvent(new Event('auth-changed'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const submittedEmail = (user?.email || formData.email).trim().toLowerCase();
      await apiFetch('/contact', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          email: submittedEmail,
        }),
      });
      setSuccess(true);
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        subject: '',
        message: ''
      });
      if (user?.email) {
        await loadContactMessages();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="relative"
          style={{
            backgroundImage: 'url(/3.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '500px'
          }}
        >
          {/* Header */}
          <header className="relative bg-transparent" style={{ zIndex: 10 }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Wedora Logo" className="h-12 w-12" />
                <h1 className="text-2xl font-bold text-white" style={{fontFamily: 'var(--font-season)'}}>Wedora</h1>
              </div>
              <nav className="flex items-center gap-6">
                <Link
                  href="/"
                  className="px-4 py-2 font-medium text-white transition-colors hover:opacity-80"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="px-4 py-2 font-medium text-white transition-colors hover:opacity-80"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="px-4 py-2 font-medium text-white transition-colors hover:opacity-80"
                >
                  Contact
                </Link>
                {user ? (
                  <div className="flex items-center gap-3 rounded-full border border-white/70 px-3 py-2 text-white">
                    <FaUserCircle className="text-2xl" />
                    <div className="text-left leading-tight">
                      <p className="text-sm font-semibold">{user.name || 'User'}</p>
                      <p className="text-[11px] text-white/80 truncate max-w-36">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="ml-1 rounded-full p-2 text-white hover:bg-white/10"
                      title="Logout"
                    >
                      <FaSignOutAlt />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-white rounded-md font-medium border-2 border-white transition-all hover:bg-white hover:text-black"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2 text-white rounded-md font-medium border-2 border-white transition-all hover:bg-white hover:text-black"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </header>

          {/* Hero Content */}
          <div 
            className="relative z-10 flex items-center justify-center"
            style={{
              minHeight: '400px',
              padding: '60px 20px'
            }}
          >
            <div className="text-center max-w-4xl">
              <h1 className="text-5xl font-bold text-white mb-6" style={{fontFamily: 'var(--font-season)'}}>
                Get In Touch
              </h1>
              <p className="text-xl text-white mb-8 leading-relaxed">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
              <Link
                href="#contact-form"
                className="inline-block px-10 py-4 text-lg font-medium rounded-full shadow-lg transition-all hover:shadow-xl hover:scale-105"
                style={{backgroundColor: '#FFFFFF', color: '#755A7B'}}
              >
                Contact Us Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Cards */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Email */}
            <div className="text-center p-8 rounded-xl shadow-lg" style={{backgroundColor: '#755A7B', border: '3px solid white'}}>
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: 'rgba(255, 255, 255, 0.2)'}}>
                <FaEnvelope className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3" style={{fontFamily: 'var(--font-season)'}}>
                Email Us
              </h3>
              <p className="text-white mb-2">support@wedora.com</p>
              <p className="text-white">info@wedora.com</p>
            </div>

            {/* Phone */}
            <div className="text-center p-8 rounded-xl shadow-lg" style={{backgroundColor: '#755A7B', border: '3px solid white'}}>
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: 'rgba(255, 255, 255, 0.2)'}}>
                <FaPhone className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3" style={{fontFamily: 'var(--font-season)'}}>
                Call Us
              </h3>
              <p className="text-white mb-2">+94 77 123 4567</p>
              <p className="text-white">+94 11 234 5678</p>
            </div>

            {/* Location */}
            <div className="text-center p-8 rounded-xl shadow-lg" style={{backgroundColor: '#755A7B', border: '3px solid white'}}>
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: 'rgba(255, 255, 255, 0.2)'}}>
                <FaMapMarkerAlt className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3" style={{fontFamily: 'var(--font-season)'}}>
                Visit Us
              </h3>
              <p className="text-white mb-2">123 Wedding Street</p>
              <p className="text-white">Colombo, Sri Lanka</p>
            </div>
          </div>

          {/* Contact Form Section */}
          <div id="contact-form" className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{fontFamily: 'var(--font-season)'}}>
                Send Us a Message
              </h2>
              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  Thank you for contacting us! We have received your message and will get back to you soon.
                </div>
              )}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="+94 77 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Tell us what you need..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 text-white font-medium rounded-full shadow-lg transition-all hover:shadow-xl hover:opacity-90 disabled:opacity-50"
                  style={{backgroundColor: '#755A7B'}}
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Additional Information */}
            <div>
              <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900" style={{fontFamily: 'var(--font-season)'}}>
                      Your Messages
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {user?.email ? `Replies for ${messagesEmail || user.email}` : 'Sign in to view replies for your account.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => user?.email && loadContactMessages()}
                    disabled={!user?.email || messagesLoading}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white disabled:opacity-60"
                    style={{backgroundColor: '#755A7B'}}
                    title="Refresh messages"
                  >
                    {messagesLoading ? <FaSyncAlt className="animate-spin" /> : <FaReply />}
                  </button>
                </div>

                {!user?.email ? (
                  <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
                    <FaUserCircle className="mx-auto mb-3 text-3xl" style={{color: '#A495A8'}} />
                    <p className="font-medium text-gray-700">Please sign in</p>
                    <p className="text-sm text-gray-500 mt-1">Admin replies are shown only for the logged-in user's email.</p>
                  </div>
                ) : messagesError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {messagesError}
                  </div>
                ) : messagesLoading ? (
                  <div className="py-8 text-center text-gray-500">Loading messages...</div>
                ) : contactMessages.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
                    <FaEnvelope className="mx-auto mb-3 text-3xl" style={{color: '#A495A8'}} />
                    <p className="font-medium text-gray-700">No messages yet</p>
                    <p className="text-sm text-gray-500 mt-1">When admin replies arrive, they will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
                    {contactMessages.map((item) => (
                      <div key={item.id} className="rounded-xl border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.subject}</h3>
                            <p className="text-xs text-gray-500">
                              Sent {new Date(item.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              item.status === 'replied'
                                ? 'bg-green-100 text-green-700'
                                : item.status === 'read'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {item.status === 'replied' ? 'Replied' : item.status === 'read' ? 'Read' : 'Pending'}
                          </span>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                          {item.message}
                        </div>

                        {item.adminReply ? (
                          <div className="mt-3 rounded-lg p-4" style={{backgroundColor: 'rgba(117, 90, 123, 0.08)'}}>
                            <div className="flex items-center gap-2 mb-2 text-sm font-semibold" style={{color: '#755A7B'}}>
                              <FaReply />
                              Admin Reply
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.adminReply}</p>
                            {item.repliedAt && (
                              <p className="text-xs text-gray-500 mt-3">
                                Replied {new Date(item.repliedAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                            <FaClock />
                            Waiting for admin reply
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{fontFamily: 'var(--font-season)'}}>
                  Business Hours
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between pb-3 border-b">
                    <span className="text-gray-600 font-medium">Monday - Friday</span>
                    <span className="text-gray-900">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b">
                    <span className="text-gray-600 font-medium">Saturday</span>
                    <span className="text-gray-900">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b">
                    <span className="text-gray-600 font-medium">Sunday</span>
                    <span className="text-gray-900">Closed</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{fontFamily: 'var(--font-season)'}}>
                  Follow Us
                </h2>
                <p className="text-gray-600 mb-6">
                  Stay connected with us on social media for updates, tips, and wedding inspiration.
                </p>
                <div className="flex gap-4">
                  <a 
                    href="#" 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                    style={{backgroundColor: '#755A7B'}}
                  >
                    <FaFacebook className="text-xl" />
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                    style={{backgroundColor: '#A495A8'}}
                  >
                    <FaInstagram className="text-xl" />
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                    style={{backgroundColor: '#C2A499'}}
                  >
                    <FaTwitter className="text-xl" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div 
            className="relative rounded-2xl shadow-2xl overflow-hidden"
            style={{
              backgroundImage: 'url(/15.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '400px'
            }}
          >
            <div 
              className="relative z-10 p-12 text-center flex flex-col items-center justify-center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                minHeight: '400px'
              }}
            >
              <h2 className="text-4xl font-bold text-white mb-4" style={{fontFamily: 'var(--font-season)'}}>
                Ready to Plan Your Perfect Wedding?
              </h2>
              <p className="text-white text-lg mb-8 max-w-2xl">
                Join thousands of couples who have found their perfect vendors on Wedora
              </p>
              <Link
                href="/signup"
                className="inline-block px-10 py-4 text-lg font-medium border-2 rounded-md shadow-lg transition-all hover:bg-white hover:text-purple-700 hover:shadow-xl"
                style={{borderColor: '#755A7B', color: '#755A7B', backgroundColor: 'transparent'}}
              >
                Create Your Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white" style={{backgroundColor: '#755A7B'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Wedora Logo" className="h-10 w-10" />
                <h3 className="text-xl font-bold text-white" style={{fontFamily: 'var(--font-season)'}}>Wedora</h3>
              </div>
              <p className="text-purple-100 text-sm">Your trusted partner in creating unforgettable wedding experiences.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-purple-100 hover:text-white text-sm transition-colors">Home</Link></li>
                <li><Link href="/about" className="text-purple-100 hover:text-white text-sm transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-purple-100 hover:text-white text-sm transition-colors">Contact</Link></li>
                <li><Link href="/signup" className="text-purple-100 hover:text-white text-sm transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><span className="text-purple-100 text-sm">Venue & Accommodation</span></li>
                <li><span className="text-purple-100 text-sm">Photography</span></li>
                <li><span className="text-purple-100 text-sm">Fashion & Beauty</span></li>
                <li><span className="text-purple-100 text-sm">Entertainment</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Contact Us</h4>
              <ul className="space-y-2">
                <li className="text-purple-100 text-sm">Email: info@wedora.com</li>
                <li className="text-purple-100 text-sm">Phone: +94 77 123 4567</li>
                <li className="text-purple-100 text-sm">Address: Colombo, Sri Lanka</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-400 pt-8">
            <div className="text-center text-purple-100">
              <p>&copy; 2026 Wedora. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
