import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="url(#paint0_linear_1_2)"/>
      <defs>
      <linearGradient id="paint0_linear_1_2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
      <stop stopColor="#FBBF24"/>
      <stop offset="1" stopColor="#F59E0B"/>
      </linearGradient>
      </defs>
    </svg>
);

export function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.error_description || error.message);
    } else {
        alert("Check your email for the confirmation link!");
    }
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen w-full flex bg-light-surface dark:bg-dark-surface">
        <div className="hidden lg:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509316976299-7228e3b39223?q=80&w=2574&auto=format&fit=crop')" }}>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-md">
                <div className="flex items-center gap-3 mb-8">
                    <Logo />
                    <span className="text-2xl font-bold text-light-on-surface dark:text-dark-on-surface">UI Unicorn</span>
                </div>

                <h1 className="text-3xl font-bold text-light-on-surface dark:text-dark-on-surface mb-2">
                    Create your account
                </h1>
                
                <form onSubmit={handleSignUp} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full mt-1 px-4 py-3 bg-gray-100 dark:bg-dark-surface-container-low border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            className="w-full mt-1 px-4 py-3 bg-gray-100 dark:bg-dark-surface-container-low border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-10 text-gray-400"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-sm text-center">
                    <span className="text-gray-600 dark:text-gray-300">Already have an account? </span>
                    <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    </div>
  );
}
