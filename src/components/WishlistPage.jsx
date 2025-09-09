import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Plus, Trash2, Copy, ArrowLeft, ExternalLink, Image as ImageIcon, AlertTriangle, Lock, XCircle, PartyPopper, Check, Upload, Link2 } from 'lucide-react';
import { ErrorPopup } from './ErrorPopup';

// Helper functions and Delete Modal...
const isHoldActive = (heldUntil) => !!heldUntil && new Date(heldUntil) > new Date();
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, wishlistTitle }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-red-500/50 w-full max-w-sm text-white">
          <div className="flex flex-col items-center text-center">
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Delete Wishlist?</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to permanently delete "{wishlistTitle}"? This cannot be undone.</p>
            <div className="flex gap-4 w-full">
              <button onClick={onClose} className="w-full py-2 font-semibold bg-white/10 hover:bg-white/20 rounded-lg">Cancel</button>
              <button onClick={onConfirm} className="w-full py-2 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg">Yes, Delete</button>
            </div>
          </div>
        </div>
      </div>
    );
};

export function WishlistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ product_name: '', product_url: '', price: '', image_url: '' });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imageUploadMode, setImageUploadMode] = useState('url');

  useEffect(() => {
    fetchWishlistAndItems();
  }, [id]);

  const fetchWishlistAndItems = async () => {
    setLoading(true);
    try {
        const { data: wishlistData, error: wishlistError } = await supabase.from('wishlists').select('*').eq('id', id).single();
        if (wishlistError) throw wishlistError;
        setWishlist(wishlistData);

        const { data: itemsData, error: itemsError } = await supabase.from('items').select('*').eq('wishlist_id', id);
        if (itemsError) throw itemsError;
        setItems(itemsData || []);

    } catch (error) {
        console.error("An error occurred while fetching data:", error);
        setGlobalError("Failed to load wishlist data. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newItem.product_name.trim()) newErrors.product_name = "Product name is required.";
    if (!newItem.product_url.trim()) newErrors.product_url = "Product URL is required.";
    if (!newItem.price.trim()) newErrors.price = "Price is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setGlobalError(null);
    let imageUrl = newItem.image_url;

    try {
      if (imageUploadMode === 'upload' && imageFile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("You must be logged in to upload an image.");
        const filePath = `${user.id}/${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('wishlist-images').upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('wishlist-images').getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      }

      const { data, error } = await supabase.from('items').insert({ ...newItem, wishlist_id: id, image_url: imageUrl }).select();
      if (error) throw error;
      
      if (data) {
        setItems([data[0], ...items]);
        setNewItem({ product_name: '', product_url: '', price: '', image_url: '' });
        setImageFile(null);
        setErrors({});
      }
    } catch (error) {
        console.error('Error adding item:', error);
        setGlobalError(error.message || 'Failed to add item. Please try again.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    const { error } = await supabase.from('items').delete().eq('id', itemId);
    if (error) {
        console.error('Error deleting item:', error);
        setGlobalError("Failed to delete item.");
    } else {
        setItems(items.filter((item) => item.id !== itemId));
    }
  };

  const copyShareLink = () => {
    if (!wishlist) return;
    const shareLink = `${window.location.origin}/share/${wishlist.share_slug}`;
    const textArea = document.createElement("textarea");
    textArea.value = shareLink;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback: Unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const handleDeleteWishlist = async () => {
    const { error } = await supabase.from('wishlists').delete().eq('id', id);
    if (error) {
        console.error('Error deleting wishlist:', error);
        setGlobalError('Could not delete the wishlist.');
    } else {
        navigate('/dashboard');
    }
    setIsDeleteModalOpen(false);
  };
  
  const handleRemoveHold = async (itemId) => {
    const { data, error } = await supabase.from('items').update({ held_by: null, held_until: null, held_by_email: null }).eq('id', itemId).select().single();
    if (error) {
      console.error('Error removing hold:', error);
      setGlobalError('Could not remove the hold.');
    } else {
      setItems(items.map(item => item.id === itemId ? data : item));
    }
  };
  
  const handleMarkFulfilled = async (itemToFulfill) => {
    const { data, error } = await supabase.from('items').update({ is_fulfilled: true }).eq('id', itemToFulfill.id).select().single();
    if (error) {
      console.error('Error marking as fulfilled:', error);
      setGlobalError("Could not mark the item as fulfilled.");
      return;
    }
    setItems(items.map(item => item.id === itemToFulfill.id ? data : item));
    if (itemToFulfill.held_by_email) {
      try {
        const { error: invokeError } = await supabase.functions.invoke('send-thank-you-email', {
          body: {
            recipientEmail: itemToFulfill.held_by_email,
            recipientName: itemToFulfill.held_by,
            itemName: itemToFulfill.product_name,
            wishlistTitle: wishlist.title,
          },
        });
        if (invokeError) throw invokeError;
      } catch (e) {
        console.error("Error invoking email function:", e);
      }
    }
  };
  
  if (loading) return <p className="text-center text-white">Loading wishlist...</p>;
  if (!wishlist) return <p className="text-center text-white">Wishlist not found. Please go back.</p>;

  return (
    <div>
      <ErrorPopup message={globalError} onClose={() => setGlobalError(null)} />
      <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteWishlist} wishlistTitle={wishlist?.title} />
      
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-white mb-6 hover:underline opacity-80 hover:opacity-100">
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold text-white">{wishlist.title}</h1>
        <div className="flex items-center gap-2">
            <button onClick={copyShareLink} className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2">
                <Copy size={16} />
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button onClick={() => setIsDeleteModalOpen(true)} className="px-4 py-2 text-sm font-semibold text-white bg-red-600/80 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                <Trash2 size={16} />
                <span>Delete</span>
            </button>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl mb-10 border border-white/20">
        <h2 className="text-xl font-semibold mb-4 text-white">Add a New Item</h2>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input value={newItem.product_name} onChange={(e) => setNewItem({...newItem, product_name: e.target.value})} placeholder="Item Name*" className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg w-full"/>
            {errors.product_name && <p className="text-red-400 text-xs mt-1 px-1">{errors.product_name}</p>}
          </div>
          <div>
            <input value={newItem.product_url} onChange={(e) => setNewItem({...newItem, product_url: e.target.value})} placeholder="Product URL*" className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg w-full"/>
            {errors.product_url && <p className="text-red-400 text-xs mt-1 px-1">{errors.product_url}</p>}
          </div>
          <div>
            <input value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} placeholder="Price (e.g., ₹1,299)*" className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg w-full"/>
            {errors.price && <p className="text-red-400 text-xs mt-1 px-1">{errors.price}</p>}
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-2">
                <label className="text-white text-sm">Image:</label>
                <div className="flex items-center p-1 bg-black/20 rounded-full">
                    <button type="button" onClick={() => setImageUploadMode('url')} className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${imageUploadMode === 'url' ? 'bg-brand-600' : ''}`}><Link2 size={14}/>URL</button>
                    <button type="button" onClick={() => setImageUploadMode('upload')} className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${imageUploadMode === 'upload' ? 'bg-brand-600' : ''}`}><Upload size={14}/>Upload</button>
                </div>
            </div>
            {imageUploadMode === 'url' ? (
                <input value={newItem.image_url} onChange={(e) => setNewItem({...newItem, image_url: e.target.value})} placeholder="Image URL" className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg w-full"/>
            ) : (
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-600/50 file:text-white hover:file:bg-brand-600"/>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="md:col-span-2 w-full px-6 py-3 font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {isSubmitting ? 'Adding...' : <><Plus size={20} /> Add Item</>}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const isHeld = isHoldActive(item.held_until);
          const isFulfilled = item.is_fulfilled;

          return (
            <div key={item.id} className={`bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg flex flex-col border border-white/20 ${isFulfilled ? 'border-green-400' : ''}`}>
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
                <div className="mt-auto pt-4 border-t border-white/10 text-center">
                  {isFulfilled ? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm text-gray-300">Gifted by: <span className="font-semibold text-white">{item.held_by}</span></p>
                      <button onClick={() => handleDeleteItem(item.id)} className="w-full mt-2 text-sm p-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg flex items-center justify-center gap-2">
                        <Trash2 size={16} /> Remove Item
                      </button>
                    </div>
                  ) : isHeld ? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm text-gray-300">Held by: <span className="font-semibold text-white">{item.held_by}</span></p>
                      <p className="text-xs text-gray-400">Until {formatDate(item.held_until)}</p>
                      <button onClick={() => handleMarkFulfilled(item)} className="w-full mt-3 text-sm p-2 bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded-lg flex items-center justify-center gap-2">
                        <Check size={16} /> Mark as Fulfilled
                      </button>
                      <button onClick={() => handleRemoveHold(item.id)} className="w-full mt-2 text-xs p-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 rounded-lg">Remove Hold</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <a href={item.product_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:underline"><ExternalLink size={16}/> View Product</a>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"><Trash2 size={18} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

