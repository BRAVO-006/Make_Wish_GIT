import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { Dashboard } from './components/Dashboard';
import { WishlistPage } from './components/WishlistPage';
import { PublicWishlistPage } from './components/PublicWishlistPage';
import { Sun, Moon, LogOut } from 'lucide-react';
// The import for AppLogo is no longer needed

// Main layout component that includes the header
const AppLayout = ({ children, session, theme, toggleTheme }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen font-sans">
      <header className="sticky top-0 z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-3">
          <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-white transition-transform hover:scale-105">
            {/* Updated to use logo.png from the public folder */}
            <img src="/logo.png" alt="Make Wish Logo" className="h-10 w-10 rounded-full border-2 border-white/50 object-cover" />
            <span>Make Wish</span>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button onClick={toggleTheme} className="p-2 rounded-full text-white hover:bg-white/20 focus:outline-none">
              {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            </button>
            {session && (
               <button 
                  onClick={handleSignOut} 
                  className="flex items-center gap-2 text-sm font-medium text-white hover:bg-white/20 p-2 rounded-lg"
                >
                 <LogOut size={18} />
                 <span className="hidden sm:inline">Sign Out</span>
               </button>
            )}
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}


export default function App() {
  const [session, setSession] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark'); // Default to dark for better contrast
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    }
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // For this design, we can force dark mode or remove the light/dark logic
    // For now, the toggle remains functional but the base is dark.
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!session ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/*" element={
          !session ? (
            <Navigate to="/login" />
          ) : (
            <AppLayout session={session} theme={theme} toggleTheme={toggleTheme}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/wishlist/:id" element={<WishlistPage />} />
                {/* The public page will likely not have the main layout, so it might need its own route structure */}
                <Route path="/share/:slug" element={<PublicWishlistPage />} />
              </Routes>
            </AppLayout>
          )
        } />
         {/* A separate route for public page if it should not have the header */}
         <Route path="/share/:slug" element={<PublicWishlistPage />} />
      </Routes>
    </BrowserRouter>
  );
}

