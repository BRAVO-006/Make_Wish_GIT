import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import loginImage from './Homepage.jpg'; // Import your local image

const Logo = () => (
  <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full border-2 border-white/50 object-cover" />
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
      alert("Success! Please check your email for the confirmation link to complete your registration.");
    }
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center p-4" 
      style={{ backgroundImage: `url(${loginImage})` }}
    >
      {/* Frosted Glass Container */}
      <div className="w-full max-w-md p-8 space-y-6 bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-8">
            <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
                <Logo />
                {/* Apply the Qwigley font and adjust size/styling */}
                <span className="font-qwigley text-5xl text-white">Make Wish</span>
            </Link>
            <h1 className="text-3xl font-md text-white font-sans pt-4">
                Create an Account
            </h1>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-200">Email</label>
            <input
              type="email"
              required
              className="w-full mt-1 px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-300"
              placeholder="you@example.com"
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
              placeholder="Create a strong password"
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
          <span className="text-gray-300">Already have an account? </span>
          <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

