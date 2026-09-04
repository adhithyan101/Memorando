import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, Heart, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { getMemories } from '../services/firestore';
import { Memory } from '../types';

export const OnThisDayPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [onThisDayMemories, setOnThisDayMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  const todayFormatted = format(new Date(), 'MMMM d');
  const todayMMDD = format(new Date(), 'MM-dd');
  const todayYear = new Date().getFullYear().toString();

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      getMemories(currentUser.uid)
        .then((all) => {
          const matches = all.filter(m => {
            const memoryYear = m.memoryDate?.slice(0, 4);
            const memoryMMDD = m.memoryDate?.slice(5);
            return memoryMMDD === todayMMDD && memoryYear !== todayYear;
          });
          setOnThisDayMemories(matches);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [currentUser]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <div className="flex items-center space-x-2 text-terracotta">
          <Sparkles className="w-6 h-6" />
          <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-charcoal-dark">On This Day ({todayFormatted})</h1>
        </div>
        <p className="text-sm text-slate dark:text-slate-dark mt-1">
          Revisit memories created on today's date in years past.
        </p>
      </div>

      {/* AUTHENTIC EMPTY STATE */}
      {!loading && onThisDayMemories.length === 0 && (
        <div className="p-12 bg-card-light dark:bg-card-dark rounded-3xl border border-dashed border-sand dark:border-sand-dark text-center space-y-4 max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-peach/20 text-terracotta flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-charcoal-dark">
            No memories from this day yet.
          </h2>
          <p className="text-sm text-slate dark:text-slate-dark">
            As you continue using Memorando, moments created on {todayFormatted} will appear here next year.
          </p>
        </div>
      )}

      {/* MEMORIES LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {onThisDayMemories.map((m) => (
          <div
            key={m.id}
            onClick={() => navigate(`/memory/${m.id}`)}
            className="bg-card-light dark:bg-card-dark p-6 rounded-3xl border border-sand dark:border-sand-dark cursor-pointer hover:shadow-warm transition space-y-4"
          >
            {m.media?.[0]?.secureUrl && (
              <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-sand/30">
                <img src={m.media[0].secureUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-terracotta uppercase">{m.memoryDate}</span>
              <h3 className="font-serif font-bold text-xl text-charcoal dark:text-charcoal-dark">{m.title || 'Untitled Memory'}</h3>
              {m.story && <p className="text-xs text-slate dark:text-slate-dark line-clamp-3 leading-relaxed">{m.story}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnThisDayPage;
