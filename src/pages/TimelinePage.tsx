import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Heart, 
  MapPin, 
  User, 
  Smile, 
  Calendar as CalendarIcon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMemories, getPeople } from '../services/firestore';
import { Memory, Person, MoodType } from '../types';
import CreateMemoryModal from '../components/modals/CreateMemoryModal';

export const TimelinePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('all');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [fetchedMemories, fetchedPeople] = await Promise.all([
        getMemories(currentUser.uid),
        getPeople(currentUser.uid)
      ]);
      setMemories(fetchedMemories);
      setPeople(fetchedPeople);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Filter & Sort Logic
  const filteredMemories = memories.filter((m) => {
    const matchesSearch = 
      (m.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.story?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.location?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesPerson = selectedPersonId === 'all' || m.personIds.includes(selectedPersonId);
    const matchesMood = selectedMood === 'all' || m.mood === selectedMood;

    return matchesSearch && matchesPerson && matchesMood;
  }).sort((a, b) => {
    const timeA = new Date(a.memoryDate).getTime();
    const timeB = new Date(b.memoryDate).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  // Group by Year & Month
  const groupedMemories: { [key: string]: Memory[] } = {};
  filteredMemories.forEach((memory) => {
    const yearMonth = memory.memoryDate ? memory.memoryDate.slice(0, 7) : 'Unknown'; // YYYY-MM
    if (!groupedMemories[yearMonth]) {
      groupedMemories[yearMonth] = [];
    }
    groupedMemories[yearMonth].push(memory);
  });

  const formatYearMonth = (ym: string) => {
    const [year, month] = ym.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-terracotta">
            <Clock className="w-6 h-6" />
            <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-charcoal-dark">Memory Timeline</h1>
          </div>
          <p className="text-sm text-slate dark:text-slate-dark mt-1">
            A chronological photo album of your preserved moments over time.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="py-3 px-5 bg-terracotta hover:bg-terracotta-hover text-white text-sm font-semibold rounded-2xl shadow-warm flex items-center justify-center space-x-2 transition transform active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Add Memory</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-card-light dark:bg-card-dark p-4 rounded-3xl border border-sand dark:border-sand-dark space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search timeline..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-xs focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            />
          </div>

          {/* Filter Person */}
          <select
            value={selectedPersonId}
            onChange={(e) => setSelectedPersonId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-xs text-charcoal dark:text-charcoal-dark focus:outline-none"
          >
            <option value="all">All People</option>
            {people.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Filter Mood */}
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="px-3 py-2 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-xs text-charcoal dark:text-charcoal-dark focus:outline-none"
          >
            <option value="all">All Moods</option>
            <option value="happy">Happy 😊</option>
            <option value="nostalgic">Nostalgic 🌅</option>
            <option value="peaceful">Peaceful 🌿</option>
            <option value="loved">Loved ❤️</option>
            <option value="grateful">Grateful 🙏</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
            className="px-3 py-2 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-xs text-charcoal dark:text-charcoal-dark focus:outline-none"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* EMPTY STATE */}
      {!loading && Object.keys(groupedMemories).length === 0 && (
        <div className="p-12 bg-card-light dark:bg-card-dark rounded-3xl border border-dashed border-sand dark:border-sand-dark text-center space-y-4 max-w-xl mx-auto my-12">
          <Sparkles className="w-12 h-12 text-terracotta/60 mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-charcoal-dark">No memories match your timeline view.</h2>
          <p className="text-sm text-slate dark:text-slate-dark">Try adjusting your search filters or create a new memory.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="py-3 px-6 bg-terracotta text-white text-xs font-semibold rounded-2xl shadow transition"
          >
            Add Memory
          </button>
        </div>
      )}

      {/* CHRONOLOGICAL GROUPS */}
      <div className="space-y-10 relative before:absolute before:left-4 md:before:left-1/2 before:top-4 before:bottom-4 before:w-0.5 before:bg-sand dark:before:bg-sand-dark">
        {Object.entries(groupedMemories).map(([yearMonth, items]) => (
          <div key={yearMonth} className="space-y-6">
            
            {/* YEAR-MONTH BANNER */}
            <div className="flex justify-center sticky top-20 z-10">
              <span className="px-4 py-1.5 rounded-full bg-terracotta text-white font-serif font-bold text-xs shadow-warm">
                {formatYearMonth(yearMonth)}
              </span>
            </div>

            {/* MEMORIES IN THIS MONTH */}
            <div className="space-y-6">
              {items.map((m, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div 
                    key={m.id}
                    onClick={() => navigate(`/memory/${m.id}`)}
                    className={`relative flex flex-col md:flex-row items-center gap-4 cursor-pointer group ${
                      isEven ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Timeline Node Icon */}
                    <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-peach border-2 border-card-light dark:border-card-dark z-10 group-hover:scale-125 transition" />

                    {/* Memory Card */}
                    <div className="ml-10 md:ml-0 w-full md:w-[calc(50%-2rem)] bg-card-light dark:bg-card-dark p-5 rounded-3xl border border-sand dark:border-sand-dark hover:shadow-warm transition space-y-3">
                      {m.media?.[0]?.secureUrl && (
                        <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-sand/30">
                          <img src={m.media[0].secureUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-terracotta uppercase">{m.memoryDate}</span>
                        {m.isFavorite && <Heart className="w-4 h-4 text-peach fill-current" />}
                      </div>

                      <h3 className="font-serif font-bold text-lg text-charcoal dark:text-charcoal-dark">{m.title || 'Untitled Memory'}</h3>
                      
                      {m.story && (
                        <p className="text-xs text-slate dark:text-slate-dark line-clamp-3 leading-relaxed">
                          {m.story}
                        </p>
                      )}

                      {m.location?.name && (
                        <div className="flex items-center space-x-1 text-xs text-slate dark:text-slate-dark pt-1">
                          <MapPin className="w-3.5 h-3.5 text-terracotta" />
                          <span>{m.location.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

      {/* CREATE MEMORY MODAL */}
      {isCreateModalOpen && (
        <CreateMemoryModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default TimelinePage;
