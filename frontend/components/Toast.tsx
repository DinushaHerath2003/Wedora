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

  const bgColor = type === 'success' ? 'bg-white' : 'bg-white';
  const textColor = type === 'success' ? 'text-green-600' : 'text-red-600';
  const borderColor = type === 'success' ? 'border-green-300' : 'border-red-300';
  const iconColor = type === 'success' ? '#22c55e' : '#ef4444';

  return (
    <div
      className={`fixed top-6 right-6 ${bgColor} ${textColor} px-6 py-4 rounded-lg shadow-xl border-l-4 ${borderColor} flex items-center gap-4 max-w-md animate-in slide-in-from-top fade-in duration-300 z-50`}
      style={{
        animation: 'slideInDown 0.3s ease-out',
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
        @keyframes slideOutUp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
      `}</style>

      {type === 'success' ? (
        <FaCheckCircle size={24} style={{ color: iconColor, flexShrink: 0 }} />
      ) : (
        <FaExclamationCircle size={24} style={{ color: iconColor, flexShrink: 0 }} />
      )}

      <div className="flex-1">
        <p className="font-semibold text-sm md:text-base">{message}</p>
        <p className="text-xs mt-1 opacity-75">
          {type === 'success' ? '✓ Success' : '⚠ Error'}
        </p>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="ml-4 hover:opacity-70 transition-opacity shrink-0"
      >
        <FaTimes size={18} />
      </button>
    </div>
  );
}
