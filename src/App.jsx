import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import { Auth } from "./components/Auth";
import { Dashboard } from "./components/Dashboard";
import { WishlistPage } from "./components/WishlistPage";
import { PublicWishlistPage } from "./components/PublicWishlistPage";
import { Sun, Moon, LogOut } from "lucide-react";

export default function App() {
  const [session, setSession] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans">
        <header className="bg-light-surface dark:bg-dark-surface border-b border-light-surface-variant dark:border-dark-surface-variant sticky top-0 z-10">
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-2xl font-bold text-light-primary dark:text-dark-primary transition-transform hover:scale-105"
            >
              {/* Use an img tag for the logo */}
              <img src="/logo.png" alt="Wishlist Logo" className="h-8 w-8" />
              <span>Wishlist</span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-primary-container dark:hover:bg-dark-primary-container focus:outline-none"
              >
                {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
              </button>
              {session && (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm font-medium text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-primary dark:hover:text-dark-primary"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
            </div>
          </nav>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Routes>
            <Route path="/" element={!session ? <Auth /> : <Dashboard />} />
            <Route path="/wishlist/:id" element={<WishlistPage />} />
            <Route path="/share/:slug" element={<PublicWishlistPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
