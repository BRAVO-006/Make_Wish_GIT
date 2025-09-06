import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Plus, Gift, ArrowRight, PackageOpen } from 'lucide-react';

export function Dashboard() {
  const [wishlists, setWishlists] = useState([]);
  const [newWishlistName, setNewWishlistName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlists = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('wishlists').select('*').eq('user_id', user.id);
      if (error) {
        console.error('Error fetching wishlists:', error);
      } else {
        setWishlists(data);
      }
      setLoading(false);
    };
    fetchWishlists();
  }, []);

  const createWishlist = async (e) => {
    e.preventDefault();
    if (newWishlistName.trim() === '') return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from('wishlists').insert({ title: newWishlistName, user_id: user.id }).select();
      if (error) {
        console.error('Error creating wishlist:', error);
      } else if (data) {
        setWishlists([...wishlists, data[0]]);
        setNewWishlistName('');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Frosted Container for the whole dashboard */}
      <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/20">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Your Wishlists</h1>
          <p className="text-gray-300 mt-1">Create and manage your wishlists here.</p>
        </div>
        
        <form onSubmit={createWishlist} className="flex flex-col sm:flex-row gap-4 mb-10">
          <input
            type="text"
            value={newWishlistName}
            onChange={(e) => setNewWishlistName(e.target.value)}
            placeholder="e.g., My Birthday Gifts"
            className="flex-grow px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-300"
          />
          <button type="submit" className="flex-shrink-0 px-5 py-3 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
            <Plus size={20} />
            <span>Create</span>
          </button>
        </form>

        {loading ? (
          <div className="text-center py-8 text-gray-300">Loading...</div>
        ) : (
          <div className="space-y-3">
            {wishlists.length > 0 ? (
              wishlists.map((wishlist) => (
                <Link
                  key={wishlist.id}
                  to={`/wishlist/${wishlist.id}`}
                  className="group flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">
                       <Gift size={20} className="text-white" />
                    </div>
                    <h2 className="font-semibold text-lg text-white">{wishlist.title}</h2>
                  </div>
                  <ArrowRight size={20} className="text-gray-300 group-hover:text-white transition-colors" />
                </Link>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-lg">
                <PackageOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-white">No wishlists yet</h3>
                <p className="text-gray-300 mt-1">Create one to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

