import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Plus, Gift, ArrowRight, PackageOpen, Calendar } from 'lucide-react';
import { ErrorPopup } from './ErrorPopup';

// Helper function to format dates
const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

export function Dashboard() {
  const [wishlists, setWishlists] = useState([]);
  const [newWishlistName, setNewWishlistName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEventEnabled, setIsEventEnabled] = useState(false);
  const [eventDate, setEventDate] = useState('');

  useEffect(() => {
    fetchWishlists();
  }, []);

  const fetchWishlists = async () => {
    setLoading(true);
    setError(null);
    console.log('DEBUG: Starting fetchWishlists...');

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.error('DEBUG: Error fetching user or user not found:', userError);
      setError('Could not verify your session. Please try logging in again.');
      setLoading(false);
      return;
    }

    console.log('DEBUG: User fetched successfully:', userData.user);

    const { data, error: wishlistsError } = await supabase
      .from('wishlists')
      .select('*')
      .eq('user_id', userData.user.id);

    console.log('DEBUG: Wishlists data from Supabase:', data);
    console.log('DEBUG: Wishlists error from Supabase:', wishlistsError);


    if (wishlistsError) {
      console.error('Error fetching wishlists:', wishlistsError);
      setError('Could not fetch your wishlists.');
    } else {
      console.log('DEBUG: Setting wishlists state with:', data || []);
      setWishlists(data || []);
    }
    setLoading(false);
  };

  const createWishlist = async (e) => {
    e.preventDefault();
    if (newWishlistName.trim() === '') return;
    if (isEventEnabled && !eventDate) {
        setError("Please select a date for the event.");
        return;
    }

    const shareSlug = Math.random().toString(36).substring(2, 12);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      let newWishlistData = {
          title: newWishlistName,
          user_id: user.id,
          share_slug: shareSlug,
      };

      if (isEventEnabled && eventDate) {
          newWishlistData.event_date = eventDate;
      }

      const { data, error } = await supabase
        .from('wishlists')
        .insert(newWishlistData)
        .select();
      
      if (error) {
        console.error('Error creating wishlist:', error);
        setError('Failed to create the wishlist. Please try again.');
      } else if (data) {
        setWishlists([...wishlists, data[0]]);
        setNewWishlistName('');
        setIsEventEnabled(false);
        setEventDate('');
      }
    }
  };

  console.log('DEBUG: Rendering Dashboard component. State:', { loading, error, wishlists });

  return (
    <div className="max-w-4xl mx-auto">
      <ErrorPopup message={error} onClose={() => setError(null)} />

      <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/20">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Your Wishlists</h1>
          <p className="text-gray-300 mt-1">Create and manage your wishlists here.</p>
        </div>
        
        <form onSubmit={createWishlist} className="space-y-4 mb-10">
            <div className="flex flex-col sm:flex-row gap-4">
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
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center">
                    <input type="checkbox" id="enableEvent" checked={isEventEnabled} onChange={(e) => setIsEventEnabled(e.target.checked)} className="h-4 w-4 rounded border-gray-500 bg-transparent text-brand-600 focus:ring-brand-500" />
                    <label htmlFor="enableEvent" className="ml-2 text-gray-300">Enable Event</label>
                </div>
                {isEventEnabled && (
                    <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="flex-grow px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-300" />
                )}
            </div>
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
                  className="group relative flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">
                       <Gift size={20} className="text-white" />
                    </div>
                    <h2 className="font-semibold text-lg text-white">{wishlist.title}</h2>
                  </div>
                  {wishlist.event_date && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                        <Calendar size={14} />
                        <span>{formatDate(wishlist.event_date)}</span>
                    </div>
                  )}
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

