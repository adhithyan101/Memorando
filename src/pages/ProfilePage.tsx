import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  Edit3, 
  Camera, 
  Heart, 
  Users, 
  Image as ImageIcon, 
  AtSign, 
  LogOut, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPeople, getMemories } from '../services/firestore';
import { Person, Memory } from '../types';
import EditProfileModal from '../components/modals/EditProfileModal';

export const ProfilePage: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = async () => {
    if (!currentUser) return;
    try {
      setStatsLoading(true);
      const [fetchedPeople, fetchedMemories] = await Promise.all([
        getPeople(currentUser.uid).catch((err) => {
          if (import.meta.env.DEV) console.error('Error fetching people for profile stats:', err);
          return [];
        }),
        getMemories(currentUser.uid).catch((err) => {
          if (import.meta.env.DEV) console.error('Error fetching memories for profile stats:', err);
          return [];
        }),
      ]);
      setPeople(fetchedPeople);
      setMemories(fetchedMemories);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error loading profile stats:', err);
      }
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [currentUser]);

  const displayName = userProfile?.displayName || currentUser?.displayName || 'Memory Keeper';
  const photoURL = userProfile?.photoURL || currentUser?.photoURL || null;
  const bio = userProfile?.bio;
  const username = userProfile?.username;
  const birthday = userProfile?.birthday;
  const email = userProfile?.email || currentUser?.email || '';
  const fallbackInitial = (displayName || email || 'M')[0].toUpperCase();

  const memoriesCount = memories.length;
  const peopleCount = people.length;
  const favoritesCount = memories.filter((m) => m.isFavorite).length;

  const joinedYear = userProfile?.createdAt 
    ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-fadeIn pb-12">
      
      {/* PAGE HEADER TITLE */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-charcoal-dark">Personal Scrapbook Profile</h1>
          <p className="text-sm text-slate dark:text-slate-dark mt-1">Your memory keeper identity & album metadata.</p>
        </div>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="py-2.5 px-4 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold rounded-2xl shadow-warm flex items-center space-x-2 transition transform active:scale-95"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* MAIN PROFILE HERO CARD */}
      <div className="bg-card-light dark:bg-card-dark rounded-3xl p-8 border border-sand dark:border-sand-dark shadow-warm relative overflow-hidden">
        
        {/* Subtle decorative background accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-peach/10 dark:bg-peach/5 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          
          {/* PROFILE PHOTO AVATAR */}
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-peach/30 border-4 border-card-light dark:border-card-dark shadow-warm overflow-hidden flex items-center justify-center text-terracotta font-serif font-bold text-4xl flex-shrink-0">
              {photoURL ? (
                <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span>{fallbackInitial}</span>
              )}
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute bottom-1 right-1 p-2 bg-terracotta text-white rounded-full shadow-md hover:bg-terracotta-hover transition transform group-hover:scale-110"
              title="Change Profile Photo"
              aria-label="Change Profile Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* USER DETAILS */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal dark:text-charcoal-dark">
                {displayName}
              </h2>
              {username && (
                <span className="px-2.5 py-0.5 rounded-full bg-sand/60 dark:bg-sand-dark/40 text-xs font-medium text-terracotta border border-sand dark:border-sand-dark">
                  {username.startsWith('@') ? username : `@${username}`}
                </span>
              )}
            </div>

            {bio ? (
              <p className="text-sm text-charcoal/80 dark:text-charcoal-dark/80 italic font-serif leading-relaxed max-w-lg">
                "{bio}"
              </p>
            ) : (
              <p className="text-xs text-slate/60 dark:text-slate-dark/60 italic">
                No bio added yet. Click 'Edit Profile' to add a short note about yourself.
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate dark:text-slate-dark">
              {email && (
                <div className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-terracotta" />
                  <span>{email}</span>
                </div>
              )}
              {birthday && (
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-terracotta" />
                  <span>Birthday: {birthday}</span>
                </div>
              )}
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate/50" />
                <span>Joined {joinedYear}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* STATISTICS CARDS (REAL FIREBASE DATA) */}
      <div className="grid grid-cols-3 gap-4">
        
        {/* MEMORIES */}
        <div className="bg-card-light dark:bg-card-dark p-5 rounded-3xl border border-sand dark:border-sand-dark shadow-warm text-center space-y-1 hover:border-terracotta/40 transition">
          <div className="w-10 h-10 rounded-2xl bg-peach/20 text-terracotta flex items-center justify-center mx-auto mb-2">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div className="font-serif font-bold text-2xl text-charcoal dark:text-charcoal-dark">
            {statsLoading ? '...' : memoriesCount}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark">
            Memories
          </p>
        </div>

        {/* PEOPLE */}
        <div className="bg-card-light dark:bg-card-dark p-5 rounded-3xl border border-sand dark:border-sand-dark shadow-warm text-center space-y-1 hover:border-terracotta/40 transition">
          <div className="w-10 h-10 rounded-2xl bg-sage/20 text-sage flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5" />
          </div>
          <div className="font-serif font-bold text-2xl text-charcoal dark:text-charcoal-dark">
            {statsLoading ? '...' : peopleCount}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark">
            People
          </p>
        </div>

        {/* FAVORITES */}
        <div className="bg-card-light dark:bg-card-dark p-5 rounded-3xl border border-sand dark:border-sand-dark shadow-warm text-center space-y-1 hover:border-terracotta/40 transition">
          <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center mx-auto mb-2">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div className="font-serif font-bold text-2xl text-charcoal dark:text-charcoal-dark">
            {statsLoading ? '...' : favoritesCount}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark">
            Favorites
          </p>
        </div>

      </div>

      {/* ABOUT YOU CARD */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-3xl border border-sand dark:border-sand-dark shadow-warm space-y-4">
        <div className="flex items-center space-x-2 border-b border-sand dark:border-sand-dark pb-3">
          <User className="w-5 h-5 text-terracotta" />
          <h3 className="font-serif text-lg font-bold text-charcoal dark:text-charcoal-dark">About You</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-3.5 rounded-2xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark space-y-1">
            <span className="font-semibold uppercase tracking-wider text-slate dark:text-slate-dark text-[10px]">
              Display Name
            </span>
            <p className="font-medium text-charcoal dark:text-charcoal-dark text-sm">{displayName}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark space-y-1">
            <span className="font-semibold uppercase tracking-wider text-slate dark:text-slate-dark text-[10px]">
              Email Address
            </span>
            <p className="font-medium text-charcoal dark:text-charcoal-dark text-sm">{email || 'Not provided'}</p>
          </div>

          {username && (
            <div className="p-3.5 rounded-2xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark space-y-1">
              <span className="font-semibold uppercase tracking-wider text-slate dark:text-slate-dark text-[10px]">
                Username
              </span>
              <p className="font-medium text-charcoal dark:text-charcoal-dark text-sm">{username}</p>
            </div>
          )}

          {birthday && (
            <div className="p-3.5 rounded-2xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark space-y-1">
              <span className="font-semibold uppercase tracking-wider text-slate dark:text-slate-dark text-[10px]">
                Birthday
              </span>
              <p className="font-medium text-charcoal dark:text-charcoal-dark text-sm">{birthday}</p>
            </div>
          )}

          {bio && (
            <div className="md:col-span-2 p-3.5 rounded-2xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark space-y-1">
              <span className="font-semibold uppercase tracking-wider text-slate dark:text-slate-dark text-[10px]">
                Personal Philosophy / Bio
              </span>
              <p className="font-serif italic text-charcoal/90 dark:text-charcoal-dark/90 text-xs leading-relaxed">{bio}</p>
            </div>
          )}

        </div>
      </div>

      {/* ACCOUNT & PRIVACY CARD */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-3xl border border-sand dark:border-sand-dark shadow-warm space-y-4">
        <div className="flex items-center space-x-2 border-b border-sand dark:border-sand-dark pb-3">
          <ShieldCheck className="w-5 h-5 text-sage" />
          <h3 className="font-serif text-lg font-bold text-charcoal dark:text-charcoal-dark">Account & Security</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-sand/30 dark:bg-sand-dark/20 border border-sand dark:border-sand-dark">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sage/20 text-sage flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-charcoal dark:text-charcoal-dark">Private Golden Album</h4>
              <p className="text-[11px] text-slate dark:text-slate-dark">
                Your memories, people, and profile are private and scoped to your authenticated account.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-card-light dark:bg-card-dark border border-sand dark:border-sand-dark rounded-full text-slate dark:text-slate-dark flex-shrink-0">
            Memorando v1.0
          </span>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to sign out of Memorando?')) {
              logout();
            }
          }}
          className="w-full py-3.5 px-4 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-300 font-semibold text-xs rounded-2xl transition flex items-center justify-center space-x-2 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Memorando</span>
        </button>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <EditProfileModal
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={loadStats}
        />
      )}

    </div>
  );
};

export default ProfilePage;
