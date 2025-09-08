import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Plus, Trash2, Copy, ArrowLeft, ExternalLink, Image as ImageIcon, AlertTriangle, Lock, XCircle } from 'lucide-react';

// New Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, wishlistTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-red-500/50 w-full max-w-sm text-white">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Delete Wishlist?</h2>
          <p className="text-gray-300 mb-6">
            Are you sure you want to permanently delete the wishlist titled "<strong>{wishlistTitle}</strong>"? This action cannot be undone.
          </p>
          <div className="flex gap-4 w-full">
            <button onClick={onClose} className="w-full py-2 font-semibold bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-full py-2 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Yes, Delete It
            </button>
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
  const [copied, setCopied] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    console.log('DEBUG: WishlistPage mounted. Fetching data for wishlist ID:', id);
    fetchWishlistAndItems();
  }, [id]);

  const fetchWishlistAndItems = async () => {
    setLoading(true);
    
    // Fetch Wishlist Details
    const { data: wishlistData, error: wishlistError } = await supabase.from('wishlists').select('*').eq('id', id).single();
    
    console.log('DEBUG: Fetched wishlist data:', wishlistData);
    console.log('DEBUG: Wishlist fetch error:', wishlistError);

    setWishlist(wishlistData);
    
    // Fetch Items for the Wishlist
    const { data: itemsData, error: itemsError } = await supabase.from('items').select('*').eq('wishlist_id', id);

    console.log('DEBUG: Fetched items data:', itemsData);
    console.log('DEBUG: Items fetch error:', itemsError);

    if (itemsError) {
        console.error("Error fetching items from Supabase", itemsError);
    } else {
        console.log('DEBUG: Setting items state with:', itemsData || []);
        setItems(itemsData || []);
    }

    setLoading(false);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('items').insert({ wishlist_id: id, ...newItem }).select();
    if (error) console.error('Error adding item:', error);
    else if (data) {
      setItems([data[0], ...items]);
      setNewItem({ product_name: '', product_url: '', price: '', image_url: '' });
    }
  };

  const handleDeleteItem = async (itemId) => {
    const { error } = await supabase.from('items').delete().eq('id', itemId);
    if (error) console.error('Error deleting item:', error);
    else setItems(items.filter((item) => item.id !== itemId));
  };
  
  const copyShareLink = () => {
    if (!wishlist) return;
    const shareLink = `${window.location.origin}/share/${wishlist.share_slug}`;
    
    const textArea = document.createElement("textarea");
    textArea.value = shareLink;
    
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  };

  const handleDeleteWishlist = async () => {
    const { error } = await supabase.from('wishlists').delete().eq('id', id);
    if (error) {
        console.error('Error deleting wishlist:', error);
        alert('Could not delete the wishlist. Please try again.');
    } else {
        navigate('/'); // Redirect to dashboard on success
    }
    setIsDeleteModalOpen(false);
  };

  console.log('DEBUG: Rendering WishlistPage. State:', { loading, wishlist, items });

  if (loading) return <p className="text-center text-white">Loading wishlist...</p>;
  if (!wishlist) return <p className="text-center text-white">Wishlist not found.</p>;

  return (
    <div>
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteWishlist}
        wishlistTitle={wishlist?.title}
      />
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-white mb-6 hover:underline opacity-80 hover:opacity-100">
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
          <input value={newItem.product_name} onChange={(e) => setNewItem({...newItem, product_name: e.target.value})} placeholder="Item Name" required className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-300"/>
          <input value={newItem.product_url} onChange={(e) => setNewItem({...newItem, product_url: e.target.value})} placeholder="Product URL" required className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-300"/>
          <input value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} placeholder="Price (e.g., ₹1,299)" required className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-300"/>
          <input value={newItem.image_url} onChange={(e) => setNewItem({...newItem, image_url: e.target.value})} placeholder="Image URL" className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-300"/>
          <button type="submit" className="md:col-span-2 w-full px-6 py-3 font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2">
            <Plus size={20} /> Add Item
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg flex flex-col border border-white/20">
            <div className="w-full h-48 bg-black/20 flex items-center justify-center">
              {item.image_url ? (
                <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover"/>
              ) : (
                <ImageIcon className="text-gray-400" size={48} />
              )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-semibold text-lg text-white flex-grow">{item.product_name}</h3>
              <p className="text-blue-400 font-bold text-xl my-2">{item.price}</p>
              <div className="flex items-center justify-between mt-auto pt-2">
                <a href={item.product_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:underline">
                  <ExternalLink size={16}/> View Product
                </a>
                <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

