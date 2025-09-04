import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import { Plus, Gift, ArrowRight, PackageOpen } from "lucide-react";

export function Dashboard() {
  const [wishlists, setWishlists] = useState([]);
  const [newWishlistName, setNewWishlistName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlists();
  }, []);

  const fetchWishlists = async () => {
    setLoading(true);
    const { data, error: userError } = await supabase.auth.getUser();

    if (userError || !data?.user) {
      console.error("Error fetching user or user not found:", userError);
      setLoading(false);
      return;
    }

    const { data: wishlistsData, error } = await supabase
      .from("wishlists")
      .select("*")
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wishlists:", error);
    } else {
      setWishlists(wishlistsData);
    }
    setLoading(false);
  };

  const createWishlist = async (e) => {
    e.preventDefault();
    if (newWishlistName.trim() === "") return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("wishlists")
        .insert({ title: newWishlistName, user_id: user.id })
        .select();
      if (error) {
        console.error("Error creating wishlist:", error);
      } else if (data) {
        setWishlists([data[0], ...wishlists]);
        setNewWishlistName("");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-light-on-surface dark:text-dark-on-surface">
          My Wishlists
        </h1>
        <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant mt-2">
          Create and manage your wishlists here.
        </p>
      </div>

      <form
        onSubmit={createWishlist}
        className="flex flex-col sm:flex-row gap-4 mb-10 p-6 bg-light-primary-container/30 dark:bg-dark-primary-container/30 rounded-2xl border border-light-outline/20 dark:border-dark-outline/20"
      >
        <input
          type="text"
          value={newWishlistName}
          onChange={(e) => setNewWishlistName(e.target.value)}
          placeholder="e.g., My Birthday Wishlist"
          className="flex-grow px-5 py-3 bg-light-surface-variant/50 dark:bg-dark-surface-variant/50 border border-light-outline/50 dark:border-dark-outline/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary transition-all"
        />
        <button
          type="submit"
          className="flex-shrink-0 px-6 py-3 font-semibold text-light-on-primary dark:text-dark-on-primary bg-light-primary dark:bg-dark-primary rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-primary dark:focus:ring-dark-primary"
        >
          <Plus size={20} />
          <span>Create Wishlist</span>
        </button>
      </form>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Loading your wishlists...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {wishlists.length > 0 ? (
            wishlists.map((wishlist) => (
              <Link
                key={wishlist.id}
                to={`/wishlist/${wishlist.id}`}
                className="group flex items-center justify-between p-5 bg-light-surface-variant/40 dark:bg-dark-surface-variant/40 rounded-2xl hover:bg-light-primary-container/50 dark:hover:bg-dark-primary-container/50 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-light-primary-container dark:bg-dark-primary-container p-3 rounded-full">
                    <Gift
                      size={20}
                      className="text-light-on-primary-container dark:text-dark-on-primary-container"
                    />
                  </div>
                  <h2 className="font-semibold text-lg text-light-on-surface dark:text-dark-on-surface">
                    {wishlist.title}
                  </h2>
                </div>
                <ArrowRight
                  size={20}
                  className="text-light-on-surface-variant dark:text-dark-on-surface-variant group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors"
                />
              </Link>
            ))
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-light-outline/50 dark:border-dark-outline/50 rounded-2xl">
              <PackageOpen
                size={48}
                className="mx-auto text-light-on-surface-variant dark:text-dark-on-surface-variant mb-4"
              />
              <h3 className="text-xl font-semibold text-light-on-surface dark:text-dark-on-surface">
                No wishlists yet
              </h3>
              <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
                Create your first wishlist to get started!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
