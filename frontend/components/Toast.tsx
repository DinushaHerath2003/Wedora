'use client';

import { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

export interface ToastProps {
  message: string;
  type: 'success' | 'error';
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ message, type, duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const textColor = type === 'success' ? 'text-emerald-700' : 'text-red-700';
  const borderColor = type === 'success' ? '#10b981' : '#ef4444';
  const iconColor = type === 'success' ? '#10b981' : '#ef4444';
  const title = type === 'success' ? 'Success' : 'Needs attention';

  return (
    <div
      className={`fixed top-6 right-6 ${textColor} px-5 py-4 rounded-2xl shadow-2xl border bg-white/95 backdrop-blur flex items-start gap-4 max-w-md animate-in slide-in-from-top fade-in duration-300 z-50`}
      style={{
        animation: 'slideInDown 0.3s ease-out',
        borderColor: 'rgba(17, 24, 39, 0.08)',
        borderLeft: `5px solid ${borderColor}`,
      }}
    >
      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {type === 'success' ? (
        <FaCheckCircle size={24} style={{ color: iconColor, flexShrink: 0 }} />
      ) : (
        <FaExclamationCircle size={24} style={{ color: iconColor, flexShrink: 0 }} />
      )}

      <div className="flex-1">
        <p className="font-bold text-sm md:text-base text-gray-900">{title}</p>
        <p className="text-sm mt-1 text-gray-600">{message}</p>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="ml-2 hover:opacity-70 transition-opacity shrink-0"
        aria-label="Close notification"
      >
        <FaTimes size={18} />
      </button>
    </div>
  );
}
