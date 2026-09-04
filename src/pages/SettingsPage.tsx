import React, { useState } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Shield, HardDrive, Bell, User, Info, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
  const { logout, userProfile } = useAuth();
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('memorando_theme') === 'dark' ? 'dark' : 'light';
  });

  const handleThemeChange = (mode: 'light' | 'dark') => {
    setThemeMode(mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('memorando_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('memorando_theme', 'light');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
      <div>
        <div className="flex items-center space-x-2 text-terracotta">
          <SettingsIcon className="w-6 h-6" />
          <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-charcoal-dark">Settings</h1>
        </div>
        <p className="text-sm text-slate dark:text-slate-dark mt-1">Configure your album theme, security, and storage settings.</p>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-3xl border border-sand dark:border-sand-dark divide-y divide-sand dark:divide-sand-dark overflow-hidden shadow-warm">
        
        {/* APPEARANCE */}
        <div className="p-6 space-y-3">
          <h3 className="font-serif font-bold text-lg text-charcoal dark:text-charcoal-dark flex items-center space-x-2">
            <Sun className="w-5 h-5 text-terracotta" />
            <span>Appearance Theme</span>
          </h3>
          <p className="text-xs text-slate dark:text-slate-dark">The Golden Memories warm palette is the default light theme.</p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleThemeChange('light')}
              className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                themeMode === 'light' ? 'bg-peach/20 border-terracotta text-terracotta' : 'bg-bg-light border-sand text-slate'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Golden Light</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                themeMode === 'dark' ? 'bg-peach/20 border-terracotta text-terracotta' : 'bg-bg-light dark:bg-bg-dark border-sand text-slate'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Ivory Dark</span>
            </button>
          </div>
        </div>

        {/* PRIVACY & SECURITY */}
        <div className="p-6 space-y-2">
          <h3 className="font-serif font-bold text-lg text-charcoal dark:text-charcoal-dark flex items-center space-x-2">
            <Shield className="w-5 h-5 text-sage" />
            <span>Privacy & Security</span>
          </h3>
          <p className="text-xs text-slate dark:text-slate-dark">
            Your data is 100% private to your account. No advertising or public feed access.
          </p>
        </div>

        {/* STORAGE */}
        <div className="p-6 space-y-2">
          <h3 className="font-serif font-bold text-lg text-charcoal dark:text-charcoal-dark flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-gold" />
            <span>Media Storage</span>
          </h3>
          <p className="text-xs text-slate dark:text-slate-dark">
            Media files stored securely in Cloudinary CDN with metadata in Firebase Firestore.
          </p>
        </div>

        {/* ABOUT */}
        <div className="p-6 space-y-2">
          <h3 className="font-serif font-bold text-lg text-charcoal dark:text-charcoal-dark flex items-center space-x-2">
            <Info className="w-5 h-5 text-terracotta" />
            <span>About Memorando</span>
          </h3>
          <p className="text-xs text-slate dark:text-slate-dark leading-relaxed">
            Memorando is a personal digital memory companion designed to preserve life's meaningful moments with loved ones.
          </p>
        </div>

        {/* LOGOUT */}
        <div className="p-6">
          <button
            onClick={() => logout()}
            className="w-full py-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-semibold text-xs rounded-2xl flex items-center justify-center space-x-2 hover:bg-red-100 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Memorando</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
