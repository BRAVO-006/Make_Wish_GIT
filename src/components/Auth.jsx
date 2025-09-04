import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Mail, KeyRound, UserPlus } from "lucide-react";

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginView, setIsLoginView] = useState(true);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Add a check to ensure the Supabase client is properly initialized
    if (!supabase || !supabase.auth) {
      alert(
        "Supabase client is not initialized. Please double-check your environment variables (Secret Keys) in CodeSandbox and restart the server."
      );
      setLoading(false);
      return;
    }

    try {
      const { error } = isLoginView
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) {
        alert(error.error_description || error.message);
      }
    } catch (err) {
      console.error("Authentication error:", err);
      alert(
        "An unexpected error occurred. This is often due to incorrect Supabase URL or Key. Please verify your Secret Keys and restart the server."
      );
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md p-8 space-y-8 bg-light-surface dark:bg-dark-surface rounded-2xl shadow-xl border border-light-surface-variant dark:border-dark-surface-variant">
        <div>
          <h2 className="text-3xl font-bold text-center text-light-on-surface dark:text-dark-on-surface">
            {isLoginView ? "Welcome Back" : "Create an Account"}
          </h2>
          <p className="mt-2 text-center text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            {isLoginView
              ? "Sign in to manage your wishlists"
              : "Get started by creating a new account"}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
            <input
              type="email"
              autoComplete="email"
              required
              className="w-full pl-10 pr-3 py-3 bg-light-surface-container-low dark:bg-dark-surface-container-low border border-light-outline dark:border-dark-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
            <input
              type="password"
              autoComplete="current-password"
              required
              className="w-full pl-10 pr-3 py-3 bg-light-surface-container-low dark:bg-dark-surface-container-low border border-light-outline dark:border-dark-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-light-on-primary dark:text-dark-on-primary bg-light-primary dark:bg-dark-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-primary dark:focus:ring-dark-primary disabled:opacity-50"
            >
              {loading ? "Processing..." : isLoginView ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <button
            onClick={() => setIsLoginView(!isLoginView)}
            className="font-medium text-light-primary dark:text-dark-primary hover:underline"
          >
            {isLoginView
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
