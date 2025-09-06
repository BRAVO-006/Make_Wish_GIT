import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Plus, Trash2, Copy, ArrowLeft, ExternalLink, Image as ImageIcon } from 'lucide-react';

export function WishlistPage() {
  const { id } = useParams();
  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ product_name: '', product_url: '', price: '', image_url: '' });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchWishlistAndItems();
  }, [id]);

  const fetchWishlistAndItems = async () => {
    setLoading(true);
    const { data: wishlistData } = await supabase.from('wishlists').select('*').eq('id', id).single();
    setWishlist(wishlistData);
    const { data: itemsData } = await supabase.from('items').select('*').eq('wishlist_id', id);
    setItems(itemsData || []);
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
    const shareLink = `${window.location.origin}/share/${wishlist.share_slug}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return <p className="text-center text-white">Loading wishlist...</p>;
  if (!wishlist) return <p className="text-center text-white">Wishlist not found.</p>;

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-white mb-6 hover:underline opacity-80 hover:opacity-100">
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-4xl font-bold text-white">{wishlist.title}</h1>
        <button onClick={copyShareLink} className="mt-4 sm:mt-0 px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2">
          <Copy size={16} />
          <span>{copied ? 'Link Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Frosted Container for New Item Form */}
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

      {/* Item Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          // Frosted Container for each item
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
              <p className="text-blue-400 font-bold text-xl my-2">₹{item.price}</p>
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

