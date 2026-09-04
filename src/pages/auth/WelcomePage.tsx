import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Heart, Users, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-6 transition-colors duration-200">
      <div className="max-w-md w-full bg-card-light dark:bg-card-dark rounded-3xl p-8 shadow-warm border border-sand dark:border-sand-dark text-center space-y-6">
        
        {/* Brand Icon */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 mx-auto rounded-3xl bg-terracotta/10 dark:bg-terracotta/20 text-terracotta flex items-center justify-center shadow-inner"
        >
          <Sparkles className="w-10 h-10" />
        </motion.div>

        {/* Title & Tagline */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-charcoal-dark tracking-tight">
            Memorando
          </h1>
          <p className="font-serif italic text-sm text-terracotta mt-1">
            "Opening your personal photo album during golden hour"
          </p>
          <p className="text-sm text-slate dark:text-slate-dark mt-3 leading-relaxed">
            Preserve meaningful moments with the people who matter most. A private digital companion for stories, photos, voice notes, and memories.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-2 gap-3 pt-2 text-left">
          <div className="p-3 bg-bg-light dark:bg-bg-dark rounded-2xl border border-sand/60 dark:border-sand-dark/60 flex items-center space-x-2.5">
            <Users className="w-4 h-4 text-terracotta flex-shrink-0" />
            <span className="text-xs font-medium text-charcoal dark:text-charcoal-dark">People First</span>
          </div>
          <div className="p-3 bg-bg-light dark:bg-bg-dark rounded-2xl border border-sand/60 dark:border-sand-dark/60 flex items-center space-x-2.5">
            <Heart className="w-4 h-4 text-peach flex-shrink-0" />
            <span className="text-xs font-medium text-charcoal dark:text-charcoal-dark">Emotional Stories</span>
          </div>
          <div className="p-3 bg-bg-light dark:bg-bg-dark rounded-2xl border border-sand/60 dark:border-sand-dark/60 flex items-center space-x-2.5">
            <Clock className="w-4 h-4 text-gold flex-shrink-0" />
            <span className="text-xs font-medium text-charcoal dark:text-charcoal-dark">On This Day</span>
          </div>
          <div className="p-3 bg-bg-light dark:bg-bg-dark rounded-2xl border border-sand/60 dark:border-sand-dark/60 flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-sage flex-shrink-0" />
            <span className="text-xs font-medium text-charcoal dark:text-charcoal-dark">100% Private</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => navigate('/create-account')}
            className="w-full py-3.5 px-4 bg-terracotta hover:bg-terracotta-hover text-white font-medium rounded-2xl shadow-warm transition transform active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Start Your Album</span>
          </button>
          
          <button
            onClick={() => navigate('/signin')}
            className="w-full py-3.5 px-4 bg-transparent hover:bg-sand/40 dark:hover:bg-sand-dark/20 text-charcoal dark:text-charcoal-dark border border-sand dark:border-sand-dark font-medium rounded-2xl transition"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
