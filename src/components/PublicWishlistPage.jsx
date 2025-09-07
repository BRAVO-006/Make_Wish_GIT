import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ExternalLink, Image as ImageIcon, Gift, Lock, Check, Bell, PartyPopper } from 'lucide-react';
import { ErrorPopup } from './ErrorPopup';
import { SuccessPopup } from './SuccessPopup';

// Helper functions and modals...
const isHoldActive = (heldUntil) => !!heldUntil && new Date(heldUntil) > new Date();
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
const SubscriptionModal = ({ isOpen, onClose, onConfirm, email, setEmail }) => { /* ... modal code ... */ };

// **UPDATED HoldItemModal to include email**
const HoldItemModal = ({ isOpen, onClose, onConfirm, itemName, holderName, setHolderName, holderEmail, setHolderEmail }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-sm text-white">
        <h2 className="text-2xl font-bold mb-2">Hold this Gift?</h2>
        <p className="text-gray-300 mb-6">Hold "{itemName}" for 3 days. You'll get a thank you email if it's fulfilled!</p>
        <div className="space-y-4">
          <input type="text" value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="Please enter your name" className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"/>
          <input type="email" value={holderEmail} onChange={(e) => setHolderEmail(e.target.value)} placeholder="Please enter your email" className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"/>
          <div className="flex gap-4">
            <button onClick={onClose} className="w-full py-2 font-semibold bg-white/10 hover:bg-white/20 rounded-lg">Cancel</button>
            <button onClick={onConfirm} disabled={!holderName.trim() || !holderEmail.trim()} className="w-full py-2 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50">Confirm Hold</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function PublicWishlistPage() {
    const { slug } = useParams();
    const [wishlist, setWishlist] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isHoldModalOpen, setHoldModalOpen] = useState(false);
    const [isSubModalOpen, setSubModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [holderName, setHolderName] = useState('');
    const [holderEmail, setHolderEmail] = useState(''); // New state for email
    const [subscriberEmail, setSubscriberEmail] = useState('');
  
    useEffect(() => { /* ... fetch logic is the same ... */ }, [slug]);

    const openHoldModal = (item) => {
        setSelectedItem(item);
        setHoldModalOpen(true);
    };

    const closeHoldModal = () => {
        setSelectedItem(null);
        setHoldModalOpen(false);
        setHolderName('');
        setHolderEmail('');
    };

    const handleConfirmHold = async () => {
        if (!selectedItem || !holderName.trim() || !holderEmail.trim()) return;
        const expires = new Date();
        expires.setDate(expires.getDate() + 3);
        const { data, error } = await supabase.from('items').update({
            held_by: holderName.trim(),
            held_by_email: holderEmail.trim(), // Save the email
            held_until: expires.toISOString(),
        }).eq('id', selectedItem.id).select().single();
        if (error) {
          setError("Sorry, we couldn't hold this item.");
        } else {
          setItems(items.map(item => item.id === selectedItem.id ? data : item));
          closeHoldModal();
        }
    };
  
    // ... (rest of the component logic and JSX)
    // The JSX for rendering items needs to be updated to show the fulfilled state.
    
    return (
        <div>
            {/* ... Modals and Header ... */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => {
                    const isHeld = isHoldActive(item.held_until);
                    const isFulfilled = item.is_fulfilled;
                    return (
                        <div key={item.id} className={`bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg flex flex-col border border-white/20 transition-all ${isHeld || isFulfilled ? 'opacity-60' : ''}`}>
                            {/* ... Item Image ... */}
                            <div className="p-4 flex flex-col flex-grow">
                                {/* ... Item Name and Price ... */}
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    {isFulfilled ? (
                                        <div className="flex items-center justify-center gap-2 text-green-300 p-2 bg-green-500/10 rounded-lg">
                                            <PartyPopper size={16} />
                                            <span className="text-sm font-semibold">Wish Fulfilled!</span>
                                        </div>
                                    ) : isHeld ? (
                                        <div className="flex flex-col items-center justify-center text-center gap-1 text-yellow-400 p-2 bg-yellow-500/10 rounded-lg">
                                            <div className="flex items-center gap-2"><Lock size={16} /><span className="text-sm font-semibold">Held by {item.held_by}</span></div>
                                            <span className="text-xs opacity-80">Until {formatDate(item.held_until)}</span>
                                        </div>
                                    ) : (
                                        <button onClick={() => openHoldModal(item)} className="w-full flex items-center justify-center gap-2 p-2 bg-green-600/20 hover:bg-green-600/40 text-green-300 font-semibold rounded-lg">
                                            <Check size={16} /><span>Hold this Gift</span>
                                        </button>
                                    )}
                                </div>
                                {/* ... View on Store link ... */}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

