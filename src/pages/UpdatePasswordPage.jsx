import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import loginImage from './Homepage.jpg';
import { SuccessPopup } from '../components/SuccessPopup';
import { ErrorPopup } from '../components/ErrorPopup';

const Logo = () => (
  <img src="/logo.png" alt="Logo" className="w-8 h-8" />
);

export function UpdatePasswordPage() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Password updated successfully! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
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
          <h1 className="text-3xl font-bold text-white">Update Your Password</h1>
        </div>
        
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-200">New Password</label>
            <input
              type="password"
              required
              className="w-full mt-1 px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-300"
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
