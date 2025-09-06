import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import loginImage from './Homepage.jpg';
import { SuccessPopup } from '../components/SuccessPopup';
import { ErrorPopup } from '../components/ErrorPopup';

const Logo = () => (
  <img src="/logo.png" alt="Logo" className="w-8 h-8" />
);

export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Password reset link has been sent to your email!');
    }
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center p-4" 
      style={{ backgroundImage: `url(${loginImage})` }}
    >
      <SuccessPopup message={success} onClose={() => setSuccess(null)} />
      <ErrorPopup message={error} onClose={() => setError(null)} />
      
      <div className="w-full max-w-md p-8 space-y-6 bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
        
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <Logo />
          <h1 className="text-3xl font-bold text-white">Forgot Password?</h1>
          <p className="text-gray-300">Enter your email and we'll send you a link to reset your password.</p>
        </div>
        
        <form onSubmit={handlePasswordReset} className="space-y-6">
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

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-sm text-center">
          <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
