import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ExternalLink, Image as ImageIcon, Gift, Lock, Check, Bell } from 'lucide-react';
import { ErrorPopup } from './ErrorPopup';
import { SuccessPopup } from './SuccessPopup'; // Import success popup

// Helper functions
const isHoldActive = (heldUntil) => {
  if (!heldUntil) return false;
  return new Date(heldUntil) > new Date();
};
const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// **NEW**: Modal for Event Subscription
const SubscriptionModal = ({ isOpen, onClose, onConfirm, email, setEmail }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-sm text-white">
          <h2 className="text-2xl font-bold mb-2">Get Event Reminder</h2>
          <p className="text-gray-300 mb-6">Enter your email to receive a notification 2 days before the event.</p>
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-300"
            />
            <div className="flex gap-4">
              <button onClick={onClose} className="w-full py-2 font-semibold bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={!email.trim()}
                className="w-full py-2 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    );
};
  

// Main component
export function PublicWishlistPage() {
  const { slug } = useParams();
  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal states
  const [isHoldModalOpen, setHoldModalOpen] = useState(false);
  const [isSubModalOpen, setSubModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [holderName, setHolderName] = useState('');
  const [subscriberEmail, setSubscriberEmail] = useState('');

  // Fetching logic remains the same...
  useEffect(() => {
    const fetchWishlistAndItems = async () => {
        setLoading(true);
        setError(null);
        const { data: wishlistData, error: wishlistError } = await supabase.from('wishlists').select('*').eq('share_slug', slug).single();
        if (wishlistError || !wishlistData) {
          setError('This wishlist could not be found.');
          setLoading(false);
          return;
        }
        setWishlist(wishlistData);
        const { data: itemsData, error: itemsError } = await supabase.from('items').select('*').eq('wishlist_id', wishlistData.id);
        if (itemsError) {
          setError('Could not load items for this wishlist.');
        } else {
          setItems(itemsData || []);
        }
        setLoading(false);
      };
    if (slug) fetchWishlistAndItems();
  }, [slug]);
  
  // Hold item logic...
  // ...

  // **NEW**: Subscription Logic
  const handleSubscribe = async () => {
    if (!subscriberEmail.trim() || !wishlist) return;
    
    const { error } = await supabase
      .from('event_subscribers')
      .insert({ wishlist_id: wishlist.id, email: subscriberEmail.trim() });

    if (error) {
      console.error("Subscription error:", error);
      setError("This email may already be subscribed.");
    } else {
      setSuccess("You've subscribed successfully!");
    }
    setSubscriberEmail('');
    setSubModalOpen(false);
  };
  
  if (loading) return <div className="text-center py-20 text-white"><p>Loading...</p></div>;
  if (error && !wishlist) return <div className="text-center py-20 text-red-400"><p>{error}</p></div>;
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <ErrorPopup message={error} onClose={() => setError(null)} />
      <SuccessPopup message={success} onClose={() => setSuccess(null)} />
      <SubscriptionModal 
        isOpen={isSubModalOpen}
        onClose={() => setSubModalOpen(false)}
        onConfirm={handleSubscribe}
        email={subscriberEmail}
        setEmail={setSubscriberEmail}
      />
      {/* Hold Item Modal would go here if combined */}
      
      <a href="/" className="flex items-center justify-center gap-3 text-2xl font-bold text-white transition-transform hover:scale-105 mb-12">
        <img src={AppLogo} alt="Make Wish Logo" className="h-10 w-10 rounded-full border-2 border-white/50 object-cover" />
        <span className="font-qwigley text-5xl">Make Wish</span>
      </a>

      <div className="text-center mb-12 relative">
        <Gift size={48} className="mx-auto text-white mb-4" />
        <h1 className="text-4xl sm:text-5xl font-bold text-white">{wishlist.title}</h1>
        <p className="mt-2 text-lg text-gray-300">A collection of wishes shared with you.</p>

        {/* **NEW**: Event Date and Subscription Button */}
        {wishlist.event_date && (
            <div className="mt-6 flex flex-col items-center gap-4">
                <div className="font-semibold bg-white/10 border border-white/20 px-4 py-2 rounded-lg">
                    Event Date: {formatDate(wishlist.event_date)}
                </div>
                <button
                    onClick={() => setSubModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
                >
                    <Bell size={16} />
                    Get Event Reminder
                </button>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Item mapping logic remains the same... */}
      </div>
    </div>
  );
}

