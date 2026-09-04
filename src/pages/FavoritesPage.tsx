import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMemories } from '../services/firestore';
import { Memory } from '../types';

export const FavoritesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      getMemories(currentUser.uid)
        .then((all) => setFavorites(all.filter(m => m.isFavorite)))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [currentUser]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center space-x-2 text-peach">
        <Heart className="w-7 h-7 fill-current" />
        <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-charcoal-dark">Favorite Memories</h1>
      </div>
      <p className="text-sm text-slate dark:text-slate-dark">
        Moments kept close to your heart.
      </p>

      {/* AUTHENTIC EMPTY STATE */}
      {!loading && favorites.length === 0 && (
        <div className="p-12 bg-card-light dark:bg-card-dark rounded-3xl border border-dashed border-sand dark:border-sand-dark text-center space-y-4 max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-peach/20 text-terracotta flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-charcoal-dark">
            Some moments are worth keeping close.
          </h2>
          <p className="text-sm text-slate dark:text-slate-dark">
            Click the heart icon on any memory to save it to your favorites album.
          </p>
        </div>
      )}

      {/* FAVORITES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {favorites.map((memory) => (
          <div
            key={memory.id}
            onClick={() => navigate(`/memory/${memory.id}`)}
            className="bg-card-light dark:bg-card-dark rounded-3xl border border-sand dark:border-sand-dark overflow-hidden cursor-pointer hover:shadow-warm transition group flex flex-col justify-between"
          >
            <div className="aspect-[4/3] bg-sand/30 overflow-hidden relative">
              {memory.media?.[0]?.secureUrl ? (
                <img src={memory.media[0].secureUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-peach/10 text-terracotta">
                  <Sparkles className="w-8 h-8 mb-2 opacity-60" />
                  <p className="font-serif italic text-xs">{memory.story?.slice(0, 60) || 'Preserved moment'}</p>
                </div>
              )}
              <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-peach backdrop-blur">
                <Heart className="w-4 h-4 fill-current" />
              </div>
            </div>

            <div className="p-5 space-y-2">
              <span className="text-[11px] font-semibold text-terracotta uppercase">{memory.memoryDate}</span>
              <h3 className="font-serif font-bold text-lg text-charcoal dark:text-charcoal-dark line-clamp-1">{memory.title || 'Untitled Memory'}</h3>
              {memory.story && (
                <p className="text-xs text-slate dark:text-slate-dark line-clamp-2 leading-relaxed">
                  {memory.story}
                </p>
              )}
              {memory.location?.name && (
                <div className="flex items-center space-x-1 text-xs text-slate dark:text-slate-dark pt-1">
                  <MapPin className="w-3.5 h-3.5 text-terracotta" />
                  <span>{memory.location.name}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
