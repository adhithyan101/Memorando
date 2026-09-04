import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, ShieldCheck, Sparkles } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
      <div>
        <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-charcoal-dark">Your Album Profile</h1>
        <p className="text-sm text-slate dark:text-slate-dark mt-1">Manage your identity and album preferences.</p>
      </div>

      <div className="bg-card-light dark:bg-card-dark p-8 rounded-3xl border border-sand dark:border-sand-dark shadow-warm text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-peach/30 text-terracotta font-serif font-bold text-3xl flex items-center justify-center mx-auto border-2 border-terracotta">
          {userProfile?.displayName?.[0] || currentUser?.email?.[0] || 'U'}
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-charcoal-dark">{userProfile?.displayName || 'Memory Keeper'}</h2>
          <p className="text-xs text-slate dark:text-slate-dark">{currentUser?.email}</p>
        </div>

        <div className="pt-4 border-t border-sand dark:border-sand-dark flex justify-around text-xs text-slate dark:text-slate-dark">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-sage" />
            <span>Private Album</span>
          </div>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-4 h-4 text-terracotta" />
            <span>Memorando v1.0</span>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="w-full py-3 bg-red-50 text-red-600 text-xs font-semibold rounded-2xl hover:bg-red-100 transition"
        >
          Sign Out of Memorando
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
