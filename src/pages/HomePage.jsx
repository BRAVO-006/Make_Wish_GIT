import { useState } from 'react';
import { Link } from 'react-router-dom';
import loginImage from './Homepage.jpg';
import { Gift, CheckCircle, Share2, LogIn, BookOpen } from 'lucide-react';

const Logo = () => (
  <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full border-2 border-white/50 object-cover" />
);

const UserGuideModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-lg text-white" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
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
                <button onClick={onClose} className="mt-8 w-full py-2 font-semibold bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors">
                    Got it!
                </button>
            </div>
        </div>
    );
}

export function HomePage() {
    const [isGuideOpen, setGuideOpen] = useState(false);

    return (
        <div 
          className="min-h-screen w-full flex items-center justify-center bg-cover bg-center p-4" 
          style={{ backgroundImage: `url(${loginImage})` }}
        >
            <UserGuideModal isOpen={isGuideOpen} onClose={() => setGuideOpen(false)} />

            <div className="w-full max-w-2xl p-8 text-center bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
                <div className="flex flex-col items-center gap-4 mb-6">
                    <Logo />
                    <h1 className="font-qwigley text-8xl text-white">Make Wish</h1>
                </div>
                <p className="text-xl text-gray-200 mb-10">
                    The simplest way to create and share your perfect wishlist. Never get a duplicate gift again.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors">
                        <LogIn size={20} />
                        Login or Sign Up
                    </Link>
                    <button onClick={() => setGuideOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                        <BookOpen size={20} />
                        User Guide
                    </button>
                </div>
            </div>
        </div>
    );
}
