import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, Mail, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle, error, clearError } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!name.trim() || !email.trim() || !password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password should be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await signUpWithEmail(email, password, name.trim());
      navigate('/verify-email');
    } catch (err: any) {
      // Auth context sets error message
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setFormError(null);
    clearError();
    try {
      setSubmitting(true);
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      // Auth context sets error message
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-6 transition-colors duration-200">
      <div className="max-w-md w-full bg-card-light dark:bg-card-dark rounded-3xl p-8 shadow-warm border border-sand dark:border-sand-dark">
        
        <button 
          onClick={() => navigate('/welcome')} 
          className="flex items-center space-x-1.5 text-xs font-medium text-slate dark:text-slate-dark hover:text-charcoal dark:hover:text-charcoal-dark mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Welcome</span>
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-charcoal dark:text-charcoal-dark">Create Account</h1>
            <p className="text-xs text-slate dark:text-slate-dark">Start preserving your life's moments</p>
          </div>
        </div>

        {(error || formError) && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-start space-x-3 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1.5">
              Your Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/50" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Eleanor Vance"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/50" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/50" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-terracotta hover:bg-terracotta-hover text-white font-medium rounded-2xl shadow-warm transition transform active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-sand dark:border-sand-dark"></div>
          <span className="px-3 text-xs text-slate dark:text-slate-dark uppercase font-semibold">Or</span>
          <div className="flex-1 border-t border-sand dark:border-sand-dark"></div>
        </div>

        <button
          onClick={handleGoogleSignUp}
          disabled={submitting}
          className="w-full py-3 px-4 bg-bg-light dark:bg-bg-dark hover:bg-sand/40 dark:hover:bg-sand-dark/20 text-charcoal dark:text-charcoal-dark border border-sand dark:border-sand-dark font-medium rounded-2xl transition flex items-center justify-center space-x-3 text-sm disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Sign up with Google</span>
        </button>

        <p className="mt-8 text-center text-xs text-slate dark:text-slate-dark">
          Already have an account?{' '}
          <Link to="/signin" className="text-terracotta hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
