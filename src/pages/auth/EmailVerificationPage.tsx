import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MailCheck, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';

export const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, resendVerification, logout } = useAuth();
  
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const handleResend = async () => {
    try {
      setResending(true);
      await resendVerification();
      setResendNotice('Verification link resent successfully. Please check your inbox.');
    } catch (err: any) {
      setResendNotice('Unable to resend email right now. Please wait a moment.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-6 transition-colors duration-200">
      <div className="max-w-md w-full bg-card-light dark:bg-card-dark rounded-3xl p-8 shadow-warm border border-sand dark:border-sand-dark text-center space-y-6">
        
        <div className="w-16 h-16 mx-auto rounded-3xl bg-peach/20 text-terracotta flex items-center justify-center">
          <MailCheck className="w-8 h-8" />
        </div>

        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal dark:text-charcoal-dark">Verify Your Email</h1>
          <p className="text-xs text-slate dark:text-slate-dark mt-2 leading-relaxed">
            We sent a verification link to <strong className="text-charcoal dark:text-charcoal-dark">{currentUser?.email || 'your email'}</strong>. Please click the link to confirm your account.
          </p>
        </div>

        {resendNotice && (
          <div className="p-3 rounded-xl bg-sand/40 dark:bg-sand-dark/20 text-xs text-charcoal dark:text-charcoal-dark">
            {resendNotice}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 px-4 bg-terracotta hover:bg-terracotta-hover text-white font-medium rounded-2xl shadow-warm transition flex items-center justify-center space-x-2 text-sm"
          >
            <span>Continue to Album</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full py-3 px-4 bg-transparent hover:bg-sand/30 text-slate dark:text-slate-dark font-medium rounded-2xl transition flex items-center justify-center space-x-2 text-xs"
          >
            <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
            <span>Resend Verification Email</span>
          </button>
        </div>

        <button
          onClick={() => logout()}
          className="text-xs text-slate hover:text-red-500 underline"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
