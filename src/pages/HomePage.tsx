import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Plus, 
  Users, 
  Clock, 
  Heart, 
  Calendar, 
  Compass, 
  ArrowRight,
  MapPin,
  Smile
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { getMemories, getPeople } from '../services/firestore';
import { Memory, Person } from '../types';
import CreateMemoryModal from '../components/modals/CreateMemoryModal';

export const HomePage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      Promise.all([
        getMemories(currentUser.uid),
        getPeople(currentUser.uid)
      ]).then(([fetchedMemories, fetchedPeople]) => {
        setMemories(fetchedMemories);
        setPeople(fetchedPeople);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [currentUser]);

  const favorites = memories.filter(m => m.isFavorite);
  
  // Check On This Day: memories matching current MM-DD in previous years
  const todayMMDD = format(new Date(), 'MM-dd');
  const todayYear = new Date().getFullYear().toString();
  const onThisDayMemories = memories.filter(m => {
    const memoryYear = m.memoryDate?.slice(0, 4);
    const memoryMMDD = m.memoryDate?.slice(5);
    return memoryMMDD === todayMMDD && memoryYear !== todayYear;
  });

  const todayFormatted = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* HEADER & GREETING */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card-light dark:bg-card-dark p-6 md:p-8 rounded-3xl border border-sand dark:border-sand-dark shadow-warm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-terracotta uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>{todayFormatted}</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-charcoal dark:text-charcoal-dark tracking-tight">
            Welcome back, {userProfile?.displayName || 'Memory Keeper'}
          </h1>
          <p className="text-sm text-slate dark:text-slate-dark mt-1">
            Preserving life's meaningful moments with those who matter most.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="py-3 px-6 bg-terracotta hover:bg-terracotta-hover text-white font-medium rounded-2xl shadow-warm flex items-center justify-center space-x-2 transition transform active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Memory</span>
        </button>
      </div>

      {/* REAL DATA STATISTICS (ONLY SHOWN IF DATA EXISTS) */}
      {memories.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-card-light dark:bg-card-dark border border-sand dark:border-sand-dark flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center font-bold">
              {memories.length}
            </div>
            <div>
              <p className="text-xs text-slate dark:text-slate-dark font-medium">Total Memories</p>
              <p className="text-sm font-semibold text-charcoal dark:text-charcoal-dark">Preserved</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card-light dark:bg-card-dark border border-sand dark:border-sand-dark flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sage/20 text-sage flex items-center justify-center font-bold">
              {people.length}
            </div>
            <div>
              <p className="text-xs text-slate dark:text-slate-dark font-medium">Special People</p>
              <p className="text-sm font-semibold text-charcoal dark:text-charcoal-dark">In your story</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card-light dark:bg-card-dark border border-sand dark:border-sand-dark flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-peach/20 text-terracotta flex items-center justify-center font-bold">
              {favorites.length}
            </div>
            <div>
              <p className="text-xs text-slate dark:text-slate-dark font-medium">Favorites</p>
              <p className="text-sm font-semibold text-charcoal dark:text-charcoal-dark">Close to heart</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card-light dark:bg-card-dark border border-sand dark:border-sand-dark flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold/20 text-charcoal flex items-center justify-center font-bold">
              {onThisDayMemories.length}
            </div>
            <div>
              <p className="text-xs text-slate dark:text-slate-dark font-medium">On This Day</p>
              <p className="text-sm font-semibold text-charcoal dark:text-charcoal-dark">Past moments</p>
            </div>
          </div>
        </div>
      )}

      {/* AUTHENTIC EMPTY STATE FOR NO MEMORIES */}
      {!loading && memories.length === 0 && (
        <div className="p-12 bg-card-light dark:bg-card-dark rounded-3xl border border-dashed border-sand dark:border-sand-dark text-center space-y-4 max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-charcoal-dark">
            Your story starts with a single moment.
          </h2>
          <p className="text-sm text-slate dark:text-slate-dark leading-relaxed">
            Memorando preserves memories with the people you love. Add your first memory to begin your personal scrapbook.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="py-3 px-6 bg-terracotta hover:bg-terracotta-hover text-white font-medium rounded-2xl shadow-warm inline-flex items-center space-x-2 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Create your first memory</span>
          </button>
        </div>
      )}

      {/* ON THIS DAY HIGHLIGHT SECTION */}
      {onThisDayMemories.length > 0 && (
        <div className="p-6 bg-peach/10 dark:bg-peach/5 rounded-3xl border border-peach/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-terracotta">
              <Sparkles className="w-5 h-5" />
              <h2 className="font-serif text-xl font-bold">On This Day</h2>
            </div>
            <button 
              onClick={() => navigate('/on-this-day')}
              className="text-xs font-semibold text-terracotta hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {onThisDayMemories.slice(0, 2).map((m) => (
              <div 
                key={m.id}
                onClick={() => navigate(`/memory/${m.id}`)}
                className="bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-sand dark:border-sand-dark cursor-pointer hover:shadow-card transition flex space-x-4"
              >
                {m.media?.[0]?.secureUrl ? (
                  <img src={m.media[0].secureUrl} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-sand/40 text-terracotta flex items-center justify-center font-serif font-bold flex-shrink-0">
                    📷
                  </div>
                )}
                <div className="overflow-hidden">
                  <span className="text-[10px] font-semibold uppercase text-terracotta">{m.memoryDate}</span>
                  <h3 className="font-serif font-bold text-base text-charcoal dark:text-charcoal-dark truncate">{m.title || 'Untitled Moment'}</h3>
                  <p className="text-xs text-slate dark:text-slate-dark line-clamp-2 mt-1">{m.story || 'Preserved memory...'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT MEMORIES GRID */}
      {memories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-charcoal-dark">Recent Moments</h2>
            <button 
              onClick={() => navigate('/timeline')}
              className="text-xs font-semibold text-terracotta hover:underline flex items-center space-x-1"
            >
              <span>View Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {memories.slice(0, 6).map((memory) => (
              <div
                key={memory.id}
                onClick={() => navigate(`/memory/${memory.id}`)}
                className="bg-card-light dark:bg-card-dark rounded-3xl border border-sand dark:border-sand-dark overflow-hidden cursor-pointer hover:shadow-warm transition group flex flex-col"
              >
                {/* Visual Media Cover */}
                <div className="aspect-[4/3] bg-sand/30 overflow-hidden relative">
                  {memory.media?.[0]?.secureUrl ? (
                    <img 
                      src={memory.media[0].secureUrl} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-peach/10 text-terracotta">
                      <Sparkles className="w-8 h-8 mb-2 opacity-60" />
                      <p className="font-serif italic text-xs">{memory.story?.slice(0, 60) || 'Preserved moment'}</p>
                    </div>
                  )}

                  {memory.isFavorite && (
                    <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-peach backdrop-blur">
                      <Heart className="w-4 h-4 fill-current" />
                    </div>
                  )}

                  {memory.mood && (
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/50 text-white text-xs backdrop-blur">
                      {memory.mood}
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-terracotta uppercase tracking-wider">{memory.memoryDate}</span>
                    <h3 className="font-serif font-bold text-lg text-charcoal dark:text-charcoal-dark line-clamp-1 mt-0.5">
                      {memory.title || 'Untitled Memory'}
                    </h3>
                    {memory.story && (
                      <p className="text-xs text-slate dark:text-slate-dark line-clamp-2 mt-1 leading-relaxed">
                        {memory.story}
                      </p>
                    )}
                  </div>

                  {memory.location?.name && (
                    <div className="flex items-center space-x-1 text-xs text-slate dark:text-slate-dark">
                      <MapPin className="w-3.5 h-3.5 text-terracotta" />
                      <span className="truncate">{memory.location.name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PEOPLE OVERVIEW PREVIEW */}
      {people.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-charcoal-dark">People in Your Story</h2>
            <button 
              onClick={() => navigate('/people')}
              className="text-xs font-semibold text-terracotta hover:underline flex items-center space-x-1"
            >
              <span>View All People</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {people.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/person/${p.id}`)}
                className="bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-sand dark:border-sand-dark cursor-pointer hover:border-terracotta/40 transition text-center space-y-2"
              >
                <div 
                  className="w-16 h-16 rounded-full mx-auto overflow-hidden bg-peach/30 flex items-center justify-center text-terracotta font-serif font-bold text-xl border-2"
                  style={{ borderColor: p.favoriteColor || '#D97757' }}
                >
                  {p.profilePhotoUrl ? (
                    <img src={p.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{p.name[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-charcoal dark:text-charcoal-dark truncate">{p.name}</h3>
                  <p className="text-[11px] text-slate dark:text-slate-dark">{p.relationship || 'Loved One'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE MEMORY MODAL */}
      {isCreateModalOpen && (
        <CreateMemoryModal 
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            if (currentUser) {
              getMemories(currentUser.uid).then(setMemories);
            }
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
