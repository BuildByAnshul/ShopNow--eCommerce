import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-botanical-text/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-3xl shadow-soft-lg p-8 animate-slide-up`}
      >
        <div className="flex items-center justify-between mb-6">
          {title && (
            <h3 className="font-serif text-2xl text-botanical-text">{title}</h3>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-full hover:bg-botanical-surface transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-botanical-muted" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
