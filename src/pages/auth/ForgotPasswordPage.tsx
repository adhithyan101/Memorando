import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }

    try {
      setSubmitting(true);
      await resetPassword(email.trim());
      setSentSuccess(true);
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
          onClick={() => navigate('/signin')} 
          className="flex items-center space-x-1.5 text-xs font-medium text-slate dark:text-slate-dark hover:text-charcoal dark:hover:text-charcoal-dark mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-charcoal dark:text-charcoal-dark">Reset Password</h1>
            <p className="text-xs text-slate dark:text-slate-dark">We'll send you recovery instructions</p>
          </div>
        </div>

        {sentSuccess ? (
          <div className="p-6 rounded-2xl bg-sage-light dark:bg-sage-hover/20 border border-sage/40 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-sage mx-auto" />
            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal dark:text-charcoal-dark">Email Sent</h3>
              <p className="text-xs text-slate dark:text-slate-dark mt-1">
                We sent a password reset link to <strong className="text-charcoal dark:text-charcoal-dark">{email}</strong>. Please check your inbox.
              </p>
            </div>
            <button
              onClick={() => navigate('/signin')}
              className="w-full py-3 bg-terracotta text-white text-xs font-semibold rounded-xl shadow transition"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <>
            {(error || formError) && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-start space-x-3 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{formError || error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 bg-terracotta hover:bg-terracotta-hover text-white font-medium rounded-2xl shadow-warm transition transform active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
