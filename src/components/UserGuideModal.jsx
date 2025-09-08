import { Gift, CheckCircle, Share2, BookOpen } from 'lucide-react';

export function UserGuideModal({ isOpen, onClose }) {
    if (!isOpen) return null;
    
    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-lg text-white animate-fade-in-up" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-4 mb-6">
                    <BookOpen size={32} className="text-blue-400"/>
                    <h2 className="text-3xl font-bold">How It Works</h2>
                </div>
                <ul className="space-y-4 text-gray-300">
                    <li className="flex items-start gap-4">
                        <Gift className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                        <span><strong>Create Wishlists:</strong> Easily create and name wishlists for any occasion, like birthdays, holidays, or weddings.</span>
                    </li>
                    <li className="flex items-start gap-4">
                        <Share2 className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                        <span><strong>Share with a Link:</strong> Every wishlist gets a unique, shareable link. Send it to friends and family so they know exactly what you want.</span>
                    </li>
                    <li className="flex items-start gap-4">
                        <CheckCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                        <span><strong>Avoid Duplicate Gifts:</strong> Friends can anonymously "hold" an item on your list, marking it as planned. Everyone else can see it's taken, but the surprise is safe with you!</span>
                    </li>
                </ul>
                <button 
                    onClick={onClose} 
                    className="mt-8 w-full py-2 font-semibold bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
                >
                    Got it!
                </button>
            </div>
        </div>
    );
}
