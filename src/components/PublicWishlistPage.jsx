import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { ExternalLink, Image as ImageIcon, Gift } from "lucide-react";

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

      // Fetch wishlist by share_slug
      const { data: wishlistData, error: wishlistError } = await supabase
        .from("wishlists")
        .select("*")
        .eq("share_slug", slug)
        .single();

      if (wishlistError || !wishlistData) {
        console.error("Error fetching wishlist:", wishlistError);
        setError("This wishlist could not be found or is no longer available.");
        setLoading(false);
        return;
      }

      setWishlist(wishlistData);

      // Fetch items for the wishlist
      // Removed the .order() clause to fix the error
      const { data: itemsData, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .eq("wishlist_id", wishlistData.id);

      if (itemsError) {
        console.error("Error fetching items:", itemsError);
        setError("Could not load the items for this wishlist.");
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
      <div className="text-center py-20">
        <p className="text-lg text-light-on-surface-variant dark:text-dark-on-surface-variant">
          Loading wishlist...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-red-500">Oops!</h1>
        <p className="mt-2 text-lg text-light-on-surface-variant dark:text-dark-on-surface-variant">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-12">
        <Gift
          size={48}
          className="mx-auto text-light-primary dark:text-dark-primary mb-4"
        />
        <h1 className="text-4xl sm:text-5xl font-bold text-light-on-surface dark:text-dark-on-surface">
          {wishlist.title}
        </h1>
        <p className="mt-2 text-lg text-light-on-surface-variant dark:text-dark-on-surface-variant">
          A collection of wishes shared with you.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-light-surface-variant/40 dark:bg-dark-surface-variant/40 rounded-2xl overflow-hidden shadow-sm flex flex-col"
          >
            <div className="w-full h-48 bg-light-surface-variant dark:bg-dark-surface-variant flex items-center justify-center">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon
                  className="text-light-on-surface-variant dark:text-dark-on-surface-variant"
                  size={48}
                />
              )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-semibold text-lg text-light-on-surface dark:text-dark-on-surface flex-grow">
                {item.product_name}
              </h3>
              <p className="text-light-primary dark:text-dark-primary font-bold text-xl my-2">
                {item.price}
              </p>
              <div className="flex items-center justify-between mt-auto pt-2">
                <a
                  href={item.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-light-primary dark:text-dark-primary hover:underline"
                >
                  <ExternalLink size={16} /> View Product
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
