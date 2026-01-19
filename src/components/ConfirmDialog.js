import React from 'react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel', isDangerous = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#0d1117] rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-[#233648] animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-[#233648]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDangerous ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
              <span className={`material-symbols-outlined ${isDangerous ? 'text-red-500' : 'text-blue-500'} text-2xl`}>
                {isDangerous ? 'warning' : 'help'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-[#233648] bg-gray-50 dark:bg-[#0d1117]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2 font-bold rounded-lg transition-all shadow-lg text-sm ${
              isDangerous
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;