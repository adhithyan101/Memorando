import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Tag, User, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMemories, getPeople } from '../services/firestore';
import { Memory, Person } from '../types';

export const SearchPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [queryText, setQueryText] = useState('');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      Promise.all([
        getMemories(currentUser.uid),
        getPeople(currentUser.uid)
      ]).then(([m, p]) => {
        setMemories(m);
        setPeople(p);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [currentUser]);

  const q = queryText.toLowerCase().trim();

  const matchingMemories = q ? memories.filter(m => 
    m.title?.toLowerCase().includes(q) ||
    m.story?.toLowerCase().includes(q) ||
    m.location?.name.toLowerCase().includes(q) ||
    m.tags?.some(t => t.toLowerCase().includes(q))
  ) : [];

  const matchingPeople = q ? people.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.nickname?.toLowerCase().includes(q) ||
    p.relationship?.toLowerCase().includes(q)
  ) : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      
      {/* SEARCH INPUT */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-charcoal-dark">Search Your Album</h1>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-terracotta" />
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search stories, people, tags, or places..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-card-light dark:bg-card-dark border border-sand dark:border-sand-dark text-base shadow-warm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            autoFocus
          />
        </div>
      </div>

      {/* INITIAL STATE */}
      {!q && (
        <div className="p-8 text-center text-slate dark:text-slate-dark text-xs space-y-2">
          <Sparkles className="w-6 h-6 text-terracotta/50 mx-auto" />
          <p>Type keywords to search through your preserved life moments.</p>
        </div>
      )}

      {/* SEARCH RESULTS */}
      {q && (
        <div className="space-y-8">
          
          {/* MATCHING PEOPLE */}
          {matchingPeople.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-serif font-bold text-lg text-charcoal dark:text-charcoal-dark flex items-center space-x-2">
                <User className="w-4 h-4 text-terracotta" />
                <span>People ({matchingPeople.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchingPeople.map(p => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/person/${p.id}`)}
                    className="p-4 bg-card-light dark:bg-card-dark rounded-2xl border border-sand dark:border-sand-dark cursor-pointer hover:border-terracotta transition flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-peach/30 text-terracotta flex items-center justify-center font-serif font-bold">
                      {p.profilePhotoUrl ? <img src={p.profilePhotoUrl} alt="" className="w-full h-full rounded-full object-cover" /> : p.name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-charcoal dark:text-charcoal-dark">{p.name}</h4>
                      <p className="text-xs text-slate dark:text-slate-dark">{p.relationship || 'Loved One'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MATCHING MEMORIES */}
          {matchingMemories.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-serif font-bold text-lg text-charcoal dark:text-charcoal-dark flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-terracotta" />
                <span>Memories ({matchingMemories.length})</span>
              </h2>
              <div className="space-y-3">
                {matchingMemories.map(m => (
                  <div
                    key={m.id}
                    onClick={() => navigate(`/memory/${m.id}`)}
                    className="p-5 bg-card-light dark:bg-card-dark rounded-2xl border border-sand dark:border-sand-dark cursor-pointer hover:shadow-warm transition flex flex-col sm:flex-row gap-4 items-start"
                  >
                    {m.media?.[0]?.secureUrl && (
                      <img src={m.media[0].secureUrl} alt="" className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-terracotta uppercase">{m.memoryDate}</span>
                      <h3 className="font-serif font-bold text-base text-charcoal dark:text-charcoal-dark">{m.title || 'Untitled Memory'}</h3>
                      <p className="text-xs text-slate dark:text-slate-dark line-clamp-2">{m.story}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchingPeople.length === 0 && matchingMemories.length === 0 && (
            <div className="p-8 text-center text-slate dark:text-slate-dark text-sm">
              No results found matching "{queryText}".
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default SearchPage;
