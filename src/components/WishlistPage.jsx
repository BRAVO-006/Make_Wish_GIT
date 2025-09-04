import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  Plus,
  Trash2,
  Copy,
  ArrowLeft,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";

export function WishlistPage() {
  const { id } = useParams();
  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  // Corrected the state to use product_url
  const [newItem, setNewItem] = useState({
    product_name: "",
    product_url: "",
    price: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchWishlistAndItems();
  }, [id]);

  const fetchWishlistAndItems = async () => {
    setLoading(true);
    const { data: wishlistData, error: wishlistError } = await supabase
      .from("wishlists")
      .select("*")
      .eq("id", id)
      .single();

    if (wishlistError) console.error("Error fetching wishlist:", wishlistError);
    else setWishlist(wishlistData);

    // Removed the .order() clause to fix the error
    const { data: itemsData, error: itemsError } = await supabase
      .from("items")
      .select("*")
      .eq("wishlist_id", id);

    if (itemsError) console.error("Error fetching items:", itemsError);
    else setItems(itemsData || []);

    setLoading(false);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("items")
      .insert({ wishlist_id: id, ...newItem })
      .select();

    if (error) {
      console.error("Error adding item:", error);
    } else if (data) {
      setItems([data[0], ...items]);
      // Reset state with the correct field names
      setNewItem({
        product_name: "",
        product_url: "",
        price: "",
        image_url: "",
      });
    }
  };

  const handleDeleteItem = async (itemId) => {
    const { error } = await supabase.from("items").delete().eq("id", itemId);
    if (error) console.error("Error deleting item:", error);
    else setItems(items.filter((item) => item.id !== itemId));
  };

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/share/${wishlist.share_slug}`;

    if (!navigator.clipboard) {
      const textArea = document.createElement("textarea");
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
      }
      document.body.removeChild(textArea);
      return;
    }

    navigator.clipboard.writeText(shareLink).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  if (loading) return <p>Loading wishlist...</p>;
  if (!wishlist) return <p>Wishlist not found.</p>;

  return (
    <div>
      <Link
        to="/"
        className="flex items-center gap-2 text-sm text-light-primary dark:text-dark-primary mb-6 hover:underline"
      >
        <ArrowLeft size={16} />
        Back to all wishlists
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-4xl font-bold text-light-on-surface dark:text-dark-on-surface">
          {wishlist.title}
        </h1>
        <button
          onClick={copyShareLink}
          className="mt-4 sm:mt-0 px-4 py-2 text-sm font-semibold text-light-on-primary dark:text-dark-on-primary bg-light-primary dark:bg-dark-primary rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Copy size={16} />
          <span>{copied ? "Link Copied!" : "Share Wishlist"}</span>
        </button>
      </div>

      <div className="bg-light-primary-container/30 dark:bg-dark-primary-container/30 p-6 rounded-2xl mb-10 border border-light-outline/20 dark:border-dark-outline/20">
        <h2 className="text-xl font-semibold mb-4 text-light-on-primary-container dark:text-dark-on-primary-container">
          Add a New Item
        </h2>
        <form
          onSubmit={handleAddItem}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            value={newItem.product_name}
            onChange={(e) =>
              setNewItem({ ...newItem, product_name: e.target.value })
            }
            placeholder="Item Name"
            required
            className="px-4 py-2 bg-light-surface-variant/50 dark:bg-dark-surface-variant/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
          />
          {/* Corrected the onChange handler to update product_url */}
          <input
            value={newItem.product_url}
            onChange={(e) =>
              setNewItem({ ...newItem, product_url: e.target.value })
            }
            placeholder="Product URL"
            required
            className="px-4 py-2 bg-light-surface-variant/50 dark:bg-dark-surface-variant/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
          />
          <input
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            placeholder="Price (e.g., ₹1,299)"
            required
            className="px-4 py-2 bg-light-surface-variant/50 dark:bg-dark-surface-variant/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
          />
          <input
            value={newItem.image_url}
            onChange={(e) =>
              setNewItem({ ...newItem, image_url: e.target.value })
            }
            placeholder="Image URL"
            className="px-4 py-2 bg-light-surface-variant/50 dark:bg-dark-surface-variant/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
          />
          <button
            type="submit"
            className="md:col-span-2 w-full px-6 py-3 font-semibold text-light-on-primary dark:text-dark-on-primary bg-light-primary dark:bg-dark-primary rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add Item
          </button>
        </form>
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
                {/* Corrected the link to use item.product_url */}
                <a
                  href={item.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-light-primary dark:text-dark-primary hover:underline"
                >
                  <ExternalLink size={16} /> View Product
                </a>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"
                >
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
