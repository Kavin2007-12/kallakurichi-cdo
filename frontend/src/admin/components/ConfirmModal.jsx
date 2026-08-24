import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 text-center transform transition-all animate-scaleUp">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">{title || 'Confirm Deletion'}</h3>
        <p className="text-sm font-semibold text-gray-500 mb-6 leading-relaxed">{message || 'Are you sure you want to permanently delete this item? This action cannot be undone.'}</p>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition cursor-pointer"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
