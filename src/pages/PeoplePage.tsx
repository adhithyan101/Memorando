import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Trash2, Edit3, Heart, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPeople, deletePerson, getMemories } from '../services/firestore';
import { Person, Memory } from '../types';
import PersonFormModal from '../components/modals/PersonFormModal';

export const PeoplePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [people, setPeople] = useState<Person[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);

  const loadData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      if (import.meta.env.DEV) {
        console.log('[Memorando] Loading people... Auth user UID:', currentUser.uid);
      }
      const [fetchedPeople, fetchedMemories] = await Promise.all([
        getPeople(currentUser.uid).catch(err => {
          if (import.meta.env.DEV) {
            console.error('[Memorando] Firestore error code=' + (err.code || 'unknown') + ' message=' + err.message);
          }
          return [];
        }),
        getMemories(currentUser.uid).catch(err => {
          if (import.meta.env.DEV) {
            console.warn('[Memorando] Non-critical error loading memories:', err);
          }
          return [];
        })
      ]);
      if (import.meta.env.DEV) {
        console.log('[Memorando] People query returned:', fetchedPeople.length, 'documents');
        console.log('[Memorando] People data:', fetchedPeople);
      }
      setPeople(fetchedPeople);
      setMemories(fetchedMemories);
      if (import.meta.env.DEV) {
        console.log('[Memorando] People state updated:', fetchedPeople.length, 'people');
      }
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('[Memorando] Firestore error: code=' + (err.code || 'unknown') + ' message=' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleDelete = async (personId: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove ${name} from your album?`)) {
      await deletePerson(personId);
      loadData();
    }
  };

  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.relationship?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPersonStats = (personId: string) => {
    const personMemories = memories.filter(m => m.personIds.includes(personId));
    const memoryCount = personMemories.length;
    const lastMemory = personMemories.sort((a, b) => new Date(b.memoryDate).getTime() - new Date(a.memoryDate).getTime())[0];
    return { memoryCount, lastDate: lastMemory?.memoryDate || null };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* PAGE TITLE BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-terracotta">
            <Users className="w-6 h-6" />
            <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-charcoal-dark">People in Your Story</h1>
          </div>
          <p className="text-sm text-slate dark:text-slate-dark mt-1">
            The loved ones, friends, and family who share your life's moments.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="py-3 px-5 bg-terracotta hover:bg-terracotta-hover text-white text-sm font-semibold rounded-2xl shadow-warm flex items-center justify-center space-x-2 transition transform active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Add Someone</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      {people.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or relationship..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-card-light dark:bg-card-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          />
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && people.length === 0 && (
        <div className="p-12 bg-card-light dark:bg-card-dark rounded-3xl border border-dashed border-sand dark:border-sand-dark text-center space-y-4 max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-peach/20 text-terracotta flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-charcoal-dark">
            You haven't added anyone yet.
          </h2>
          <p className="text-sm text-slate dark:text-slate-dark leading-relaxed">
            Memorando is built around your relationships. Add a partner, friend, or family member to start preserving memories together.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-3 px-6 bg-terracotta hover:bg-terracotta-hover text-white font-medium rounded-2xl shadow-warm inline-flex items-center space-x-2 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add someone</span>
          </button>
        </div>
      )}

      {/* PEOPLE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPeople.map((person) => {
          const { memoryCount, lastDate } = getPersonStats(person.id);
          return (
            <div
              key={person.id}
              onClick={() => navigate(`/person/${person.id}`)}
              className="bg-card-light dark:bg-card-dark rounded-3xl border border-sand dark:border-sand-dark p-6 cursor-pointer hover:shadow-warm transition group relative flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Profile Photo & Badges */}
                <div className="flex items-start justify-between">
                  <div 
                    className="w-20 h-20 rounded-2xl overflow-hidden bg-sand/40 border-2 flex items-center justify-center text-terracotta font-serif font-bold text-2xl"
                    style={{ borderColor: person.favoriteColor || '#D97757' }}
                  >
                    {person.profilePhotoUrl ? (
                      <img src={person.profilePhotoUrl} alt={person.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{person.name[0]}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPersonToEdit(person); }}
                      className="p-2 text-slate hover:text-terracotta rounded-lg hover:bg-sand/40 transition"
                      title="Edit Person"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(person.id, person.name, e)}
                      className="p-2 text-slate hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                      title="Delete Person"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Name & Details */}
                <div>
                  <h3 className="font-serif font-bold text-xl text-charcoal dark:text-charcoal-dark">{person.name}</h3>
                  {person.nickname && (
                    <p className="text-xs text-terracotta italic font-serif font-medium">"{person.nickname}"</p>
                  )}
                  {person.relationship && (
                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-sand/50 dark:bg-sand-dark/30 text-xs font-semibold text-charcoal dark:text-charcoal-dark">
                      {person.relationship}
                    </span>
                  )}
                  {person.description && (
                    <p className="text-xs text-slate dark:text-slate-dark line-clamp-2 mt-2 leading-relaxed">
                      {person.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer Metadata */}
              <div className="pt-4 mt-6 border-t border-sand dark:border-sand-dark flex items-center justify-between text-xs text-slate dark:text-slate-dark">
                <div className="flex items-center space-x-1 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                  <span>{memoryCount} {memoryCount === 1 ? 'memory' : 'memories'}</span>
                </div>
                {lastDate && (
                  <span>Last: {lastDate}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT PERSON MODAL */}
      {(isAddModalOpen || personToEdit) && (
        <PersonFormModal
          personToEdit={personToEdit}
          onClose={() => { setIsAddModalOpen(false); setPersonToEdit(null); }}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default PeoplePage;
