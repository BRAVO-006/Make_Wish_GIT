import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { UpdatePasswordPage } from './pages/UpdatePasswordPage';
import { Dashboard } from './components/Dashboard';
import { WishlistPage } from './components/WishlistPage';
import { PublicWishlistPage } from './components/PublicWishlistPage';
import { UserGuideModal } from './components/UserGuideModal'; // Import the new component
import { Sun, Moon, LogOut, BookOpen } from 'lucide-react';

// This component handles the main layout (header, etc.) for logged-in users.
const AppLayout = ({ theme, toggleTheme }) => {
  const [isGuideOpen, setGuideOpen] = useState(false); // State to control the modal
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen">
      <UserGuideModal isOpen={isGuideOpen} onClose={() => setGuideOpen(false)} />
      <header className="sticky top-0 z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-3">
          <Link to="/dashboard" className="flex items-center gap-3 transition-transform hover:scale-105">
            <img src="/logo.png" alt="Make Wish Logo" className="h-10 w-10 rounded-full border-2 border-white/50 object-cover" />
            <span className="font-qwigley text-5xl text-white">Make Wish</span>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* New User Guide Button */}
            <button 
              onClick={() => setGuideOpen(true)} 
              className="flex items-center gap-2 text-sm font-medium text-white hover:bg-white/20 p-2 rounded-lg"
            >
              <BookOpen size={18} />
              <span className="hidden sm:inline">User Guide</span>
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-full text-white hover:bg-white/20 focus:outline-none">
              {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            </button>
            <button onClick={handleSignOut} className="flex items-center gap-2 text-sm font-medium text-white hover:bg-white/20 p-2 rounded-lg">
              <LogOut size={18} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Outlet />
      </main>
    </div>
  );
};

// This component acts as a guard for your protected routes.
const ProtectedLayout = ({ session, theme, toggleTheme }) => {
  if (!session) {
    // If the user is not logged in, redirect them to the login page.
    return <Navigate to="/login" replace />;
  }
  // If the user is logged in, render the main layout.
  return <AppLayout theme={theme} toggleTheme={toggleTheme} />;
};

export default function App() {
  const [session, setSession] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
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
        {/* === PUBLIC ROUTES === */}
        <Route path="/" element={!session ? <HomePage /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!session ? <SignUpPage /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
        <Route path="/share/:slug" element={<PublicWishlistPage />} />

        {/* === PROTECTED ROUTES === */}
        <Route element={<ProtectedLayout session={session} theme={theme} toggleTheme={toggleTheme} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wishlist/:id" element={<WishlistPage />} />
        </Route>

        {/* A fallback for any other path */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

