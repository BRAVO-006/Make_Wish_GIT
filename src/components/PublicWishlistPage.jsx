import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ExternalLink, Image as ImageIcon, Gift, Lock, Check, Bell, PartyPopper } from 'lucide-react';
import { ErrorPopup } from './ErrorPopup';
import { SuccessPopup } from './SuccessPopup';

// Helper functions and modals...
const isHoldActive = (heldUntil) => !!heldUntil && new Date(heldUntil) > new Date();
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
const SubscriptionModal = ({ isOpen, onClose, onConfirm, email, setEmail }) => { 
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-sm text-white">
          <h2 className="text-2xl font-bold mb-2">Get Event Reminder</h2>
          <p className="text-gray-300 mb-6">Enter your email to receive a notification 2 days before the event.</p>
          <div className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-300" />
            <div className="flex gap-4">
              <button onClick={onClose} className="w-full py-2 font-semibold bg-white/10 hover:bg-white/20 rounded-lg">Cancel</button>
              <button onClick={onConfirm} disabled={!email.trim()} className="w-full py-2 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50">Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    );
 };

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
  
// Main component
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
  const [holderEmail, setHolderEmail] = useState(''); 
  const [subscriberEmail, setSubscriberEmail] = useState('');

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

    if (slug) {
        fetchWishlistAndItems();
    } else {
        setLoading(false);
        setError('No wishlist specified in the URL.');
    }
  }, [slug]);
  
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
        held_by_email: holderEmail.trim(),
        held_until: expires.toISOString(),
    }).eq('id', selectedItem.id).select().single();
    if (error) {
      setError("Sorry, we couldn't hold this item.");
    } else {
      setItems(items.map(item => item.id === selectedItem.id ? data : item));
      closeHoldModal();
    }
  };

  const handleSubscribe = async () => {
    if (!subscriberEmail.trim() || !wishlist) return;
    const { error } = await supabase.from('event_subscribers').insert({ wishlist_id: wishlist.id, email: subscriberEmail.trim() });
    if (error) {
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
      <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setSubModalOpen(false)} onConfirm={handleSubscribe} email={subscriberEmail} setEmail={setSubscriberEmail} />
      <HoldItemModal isOpen={isHoldModalOpen} onClose={closeHoldModal} onConfirm={handleConfirmHold} itemName={selectedItem?.product_name} holderName={holderName} setHolderName={setHolderName} holderEmail={holderEmail} setHolderEmail={setHolderEmail} />
      
      <a href="/" className="flex items-center justify-center gap-3 text-2xl font-bold text-white transition-transform hover:scale-105 mb-12">
        <img src="/logo.png" alt="Make Wish Logo" className="h-10 w-10 rounded-full border-2 border-white/50 object-cover" />
        <span className="font-qwigley text-5xl">Make Wish</span>
      </a>

      <div className="text-center mb-12 relative">
        <Gift size={48} className="mx-auto text-white mb-4" />
        <h1 className="text-4xl sm:text-5xl font-bold text-white">{wishlist.title}</h1>
        <p className="mt-2 text-lg text-gray-300">A collection of wishes shared with you.</p>

        {wishlist.event_date && (
            <div className="mt-6 flex flex-col items-center gap-4">
                <div className="font-semibold bg-white/10 border border-white/20 px-4 py-2 rounded-lg">
                    Event Date: {formatDate(wishlist.event_date)}
                </div>
                <button onClick={() => setSubModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors">
                    <Bell size={16} /> Get Event Reminder
                </button>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const isHeld = isHoldActive(item.held_until);
          const isFulfilled = item.is_fulfilled;
          return (
            <div key={item.id} className={`bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg flex flex-col border border-white/20 transition-all ${isHeld || isFulfilled ? 'opacity-70' : ''}`}>
              <div className="w-full h-48 bg-black/20 flex items-center justify-center relative">
                {item.image_url ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover"/> : <ImageIcon className="text-gray-400" size={48} />}
                {isFulfilled && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center text-white animate-fade-in-up">
                      <PartyPopper size={48} className="text-green-400 mx-auto" />
                      <p className="font-bold mt-2">Fulfilled!</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg text-white flex-grow">{item.product_name}</h3>
                <p className="text-blue-400 font-bold text-xl my-2">{item.price}</p>
                <div className="mt-4 pt-4 border-t border-white/10">
                  {isFulfilled ? (
                    <div className="flex flex-col items-center justify-center text-center gap-1 text-green-400 p-2 bg-green-500/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <PartyPopper size={16} />
                        <span className="text-sm font-semibold">Wish Fulfilled!</span>
                      </div>
                      <span className="text-xs opacity-80">by {item.held_by}</span>
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
                <div className="flex items-center justify-center mt-4">
                  <a href={item.product_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:underline">
                    <ExternalLink size={16}/> View on Store
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

