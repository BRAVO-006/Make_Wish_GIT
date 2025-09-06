import { CheckCircle, X } from 'lucide-react';

export function SuccessPopup({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fade-in-up">
      <div className="flex items-center gap-4 bg-green-600 text-white font-semibold px-4 py-3 rounded-lg shadow-2xl border border-green-700">
        <CheckCircle size={24} />
        <span>{message}</span>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-green-700 focus:outline-none">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
