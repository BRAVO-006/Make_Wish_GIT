import { AlertCircle, X } from 'lucide-react';

export function ErrorPopup({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fade-in-up">
      <div className="flex items-center gap-4 bg-red-500 text-white font-semibold px-4 py-3 rounded-lg shadow-2xl border border-red-600">
        <AlertCircle size={24} />
        <span>{message}</span>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-red-600 focus:outline-none">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

