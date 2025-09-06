import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ExternalLink, Image as ImageIcon, Gift } from 'lucide-react';
import AppLogo from '../pages/Homepage.jpg';

export function PublicWishlistPage() {
  const { slug } = useParams();
  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlistAndItems = async () => {
      setLoading(true);
      setError(null);

      const { data: wishlistData, error: wishlistError } = await supabase.from('wishlists').select('*').eq('share_slug', slug).single();

      if (wishlistError || !wishlistData) {
        setError('This wishlist could not be found or is no longer available.');
        setLoading(false);
        return;
      }
      
      setWishlist(wishlistData);
      
      const { data: itemsData, error: itemsError } = await supabase.from('items').select('*').eq('wishlist_id', wishlistData.id);

      if (itemsError) {
        setError('Could not load the items for this wishlist.');
      } else {
        setItems(itemsData || []);
      }
      
      setLoading(false);
    };

    if (slug) {
      fetchWishlistAndItems();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="text-center py-20 text-white">
        <p className="text-lg">Loading wishlist...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="text-center py-20 text-white">
        <h1 className="text-2xl font-bold text-red-400">Oops!</h1>
        <p className="mt-2 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <a href="/" className="flex items-center justify-center gap-3 text-2xl font-bold text-white transition-transform hover:scale-105 mb-12">
            <img src={AppLogo} alt="Make Wish Logo" className="h-10 w-10 rounded-full border-2 border-white/50 object-cover" />
            <span>Make Wish</span>
        </a>

      <div className="text-center mb-12">
        <Gift size={48} className="mx-auto text-white mb-4" />
        <h1 className="text-4xl sm:text-5xl font-bold text-white">{wishlist.title}</h1>
        <p className="mt-2 text-lg text-gray-300">A collection of wishes shared with you.</p>
      </div>

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
              <p className="text-blue-400 font-bold text-xl my-2">{item.price}</p>
              <div className="flex items-center justify-between mt-auto pt-2">
                <a href={item.product_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:underline">
                  <ExternalLink size={16}/> View Product
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

