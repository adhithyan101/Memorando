import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Clock, 
  Map, 
  Settings, 
  Plus, 
  Search as SearchIcon, 
  Heart, 
  Sparkles, 
  Compass, 
  Mail, 
  Lock, 
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CreateMemoryModal from '../components/modals/CreateMemoryModal';
import OfflineBanner from '../components/common/OfflineBanner';

export const AppLayout: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('memorando_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('memorando_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('memorando_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const mainNavItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'People', path: '/people', icon: Users },
    { label: 'Timeline', path: '/timeline', icon: Clock },
    { label: 'Map', path: '/map', icon: Map },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const secondaryNavItems = [
    { label: 'Favorites', path: '/favorites', icon: Heart },
    { label: 'On This Day', path: '/on-this-day', icon: Sparkles },
    { label: 'Capsules', path: '/capsules', icon: Lock },
    { label: 'Future Letters', path: '/future-letters', icon: Mail },
    { label: 'AI Story', path: '/ai-story', icon: Compass },
    { label: 'Search', path: '/search', icon: SearchIcon },
    { label: 'Notifications', path: '/notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-charcoal dark:text-charcoal-dark flex flex-col md:flex-row font-sans transition-colors duration-200">
      <OfflineBanner />
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-card-light dark:bg-card-dark border-r border-sand dark:border-sand-dark p-6 sticky top-0 h-screen overflow-y-auto z-20">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-2xl bg-terracotta/10 dark:bg-terracotta/20 flex items-center justify-center text-terracotta">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-charcoal dark:text-charcoal-dark">
              Memorando
            </h1>
            <p className="text-xs text-slate dark:text-slate-dark">Digital Memory Album</p>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full py-3.5 px-4 bg-terracotta hover:bg-terracotta-hover text-white rounded-2xl font-medium shadow-warm flex items-center justify-center space-x-2 transition-all transform active:scale-95 mb-8"
        >
          <Plus className="w-5 h-5" />
          <span>Add Memory</span>
        </button>

        {/* Primary Navigation */}
        <div className="space-y-1 mb-8">
          <p className="px-3 text-xs font-semibold text-slate dark:text-slate-dark tracking-wider uppercase mb-2">Navigation</p>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-terracotta/10 text-terracotta dark:bg-terracotta/20' 
                    : 'text-slate hover:text-charcoal hover:bg-sand/40 dark:text-slate-dark dark:hover:bg-sand-dark/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Special Features Navigation */}
        <div className="space-y-1 mb-auto">
          <p className="px-3 text-xs font-semibold text-slate dark:text-slate-dark tracking-wider uppercase mb-2">Album Features</p>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-terracotta/10 text-terracotta dark:bg-terracotta/20' 
                    : 'text-slate hover:text-charcoal hover:bg-sand/40 dark:text-slate-dark dark:hover:bg-sand-dark/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Info & Theme Toggle */}
        <div className="pt-4 border-t border-sand dark:border-sand-dark mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/profile')}>
              <div className="w-9 h-9 rounded-full bg-peach/30 text-terracotta flex items-center justify-center font-serif font-bold">
                {userProfile?.displayName?.[0] || currentUser?.email?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-charcoal dark:text-charcoal-dark">
                  {userProfile?.displayName || 'Memory Keeper'}
                </p>
                <p className="text-xs text-slate truncate dark:text-slate-dark">{currentUser?.email}</p>
              </div>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-2 text-slate hover:text-charcoal dark:text-slate-dark dark:hover:text-charcoal-dark rounded-lg hover:bg-sand/50 transition"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* MOBILE TOP BAR */}
        <header className="md:hidden flex items-center justify-between px-5 py-4 bg-card-light/90 dark:bg-card-dark/90 backdrop-blur border-b border-sand dark:border-sand-dark sticky top-0 z-30">
          <div className="flex items-center space-x-2.5" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">Memorando</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/search')}
              className="p-2 rounded-xl text-slate hover:text-charcoal dark:text-slate-dark dark:hover:text-charcoal-dark"
              aria-label="Search"
            >
              <SearchIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-peach/30 text-terracotta flex items-center justify-center font-serif text-sm font-bold"
            >
              {userProfile?.displayName?.[0] || 'U'}
            </button>
          </div>
        </header>

        {/* PAGE OUTLET */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card-light/95 dark:bg-card-dark/95 backdrop-blur border-t border-sand dark:border-sand-dark px-4 py-2 flex items-center justify-around z-30 shadow-lg">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                isActive ? 'text-terracotta font-semibold' : 'text-slate dark:text-slate-dark opacity-75'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* FLOATING QUICK ADD BUTTON (MOBILE ONLY) */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="md:hidden fixed bottom-20 right-5 w-14 h-14 bg-terracotta text-white rounded-full shadow-warm flex items-center justify-center z-40 active:scale-95 transition"
        aria-label="Add Memory"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* CREATE MEMORY MODAL */}
      {isCreateModalOpen && (
        <CreateMemoryModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
};

export default AppLayout;
