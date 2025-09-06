import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import loginImage from './Homepage.jpg'; // Import your local image

// You can replace this with your actual logo
const Logo = () => (
  <img src="/logo.png" alt="Logo" className="w-8 h-8" />
);


export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.error_description || error.message);
    }
    setLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      alert(error.error_description || error.message);
    }
    setLoading(false);
  }

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center p-4" 
      style={{ backgroundImage: `url(${loginImage})` }}
    >
      {/* Frosted Glass Container */}
      <div className="w-full max-w-md p-8 space-y-6 bg-black/20 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/40">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <Logo />
          <span className="text-2xl font-bold text-white">MakeWish</span>
          <h1 className="text-3xl font-medium text-white">
            Nice to see you again
          </h1>
        </div>
        
        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-white-200">Login</label>
            <input
              type="email"
              required
              className="w-full mt-1 px-4 py-3 bg-white/10 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-300"
              placeholder="Email or phone number"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <label className="text-sm font-medium text-gray-200">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full mt-1 px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-300"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-10 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-500 bg-transparent text-brand-600 focus:ring-brand-500" />
              <label htmlFor="remember" className="ml-2 text-gray-300">Remember me</label>
            </div>
            <a href="#" className="font-medium text-blue-400 hover:text-blue-300">Forgot password?</a>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow bg-white/20 h-px"></div>
          <span className="mx-4 text-sm text-gray-300">Or</span>
          <div className="flex-grow bg-white/20 h-px"></div>
        </div>
        
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-white/20 text-sm font-medium rounded-lg text-white bg-white/10 hover:bg-white/20 disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-5 h-5" />
          Sign in with Google
        </button>
        
        <div className="mt-8 text-sm text-center">
          <span className="text-gray-300">Don't have an account? </span>
          <Link to="/signup" className="font-medium text-blue-400 hover:text-blue-300">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}

