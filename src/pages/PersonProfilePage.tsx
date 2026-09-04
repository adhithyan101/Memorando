import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Sparkles, 
  Heart, 
  MapPin, 
  ArrowLeft,
  Image as ImageIcon,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPersonById, getMemoriesForPerson, deletePerson } from '../services/firestore';
import { Person, Memory } from '../types';
import PersonFormModal from '../components/modals/PersonFormModal';
import CreateMemoryModal from '../components/modals/CreateMemoryModal';

export const PersonProfilePage: React.FC = () => {
  const { personId } = useParams<{ personId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [person, setPerson] = useState<Person | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditPersonOpen, setIsEditPersonOpen] = useState(false);
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);

  const loadData = async () => {
    if (!personId || !currentUser) return;
    try {
      setLoading(true);
      const [fetchedPerson, fetchedMemories] = await Promise.all([
        getPersonById(personId),
        getMemoriesForPerson(currentUser.uid, personId)
      ]);
      setPerson(fetchedPerson);
      setMemories(fetchedMemories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [personId, currentUser]);

  const handleDeletePerson = async () => {
    if (!person) return;
    if (window.confirm(`Are you sure you want to remove ${person.name} from your album?`)) {
      await deletePerson(person.id);
      navigate('/people');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Sparkles className="w-8 h-8 text-terracotta animate-pulse" />
        <p className="text-sm text-slate">Opening memory book...</p>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold">Person not found</h2>
        <button onClick={() => navigate('/people')} className="text-xs text-terracotta underline font-semibold">
          Return to People
        </button>
      </div>
    );
  }

  const favoriteMemories = memories.filter(m => m.isFavorite);
  const allPhotos = memories.flatMap(m => m.media || []).filter(m => m.resourceType === 'image');

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* BACK BUTTON */}
      <button 
        onClick={() => navigate('/people')}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate dark:text-slate-dark hover:text-charcoal dark:hover:text-charcoal-dark transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to People</span>
      </button>

      {/* PERSON HERO BANNER */}
      <div 
        className="relative rounded-3xl p-6 md:p-8 bg-card-light dark:bg-card-dark border border-sand dark:border-sand-dark shadow-warm overflow-hidden"
        style={{ borderTop: `4px solid ${person.favoriteColor || '#D97757'}` }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
          {/* Avatar */}
          <div 
            className="w-28 h-28 rounded-3xl overflow-hidden bg-sand/40 border-2 flex items-center justify-center text-terracotta font-serif font-bold text-3xl flex-shrink-0 shadow-md"
            style={{ borderColor: person.favoriteColor || '#D97757' }}
          >
            {person.profilePhotoUrl ? (
              <img src={person.profilePhotoUrl} alt={person.name} className="w-full h-full object-cover" />
            ) : (
              <span>{person.name[0]}</span>
            )}
          </div>

          {/* Identity & Stats */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-charcoal-dark">{person.name}</h1>
                {person.nickname && (
                  <p className="font-serif italic text-sm text-terracotta">"{person.nickname}"</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 self-center md:self-auto">
                <button
                  onClick={() => setIsAddMemoryOpen(true)}
                  className="py-2.5 px-4 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold rounded-xl shadow transition flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Memory</span>
                </button>

                <button
                  onClick={() => setIsEditPersonOpen(true)}
                  className="p-2.5 bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark rounded-xl text-slate hover:text-charcoal transition"
                  title="Edit Person"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleDeletePerson}
                  className="p-2.5 bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark rounded-xl text-slate hover:text-red-500 transition"
                  title="Delete Person"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Badges & Description */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              {person.relationship && (
                <span className="px-3 py-1 rounded-full bg-peach/20 text-terracotta text-xs font-semibold">
                  {person.relationship}
                </span>
              )}
              {person.birthday && (
                <span className="px-3 py-1 rounded-full bg-sand/50 dark:bg-sand-dark/30 text-xs text-charcoal dark:text-charcoal-dark flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-terracotta" />
                  <span>Birthday: {person.birthday}</span>
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-sand/50 dark:bg-sand-dark/30 text-xs text-charcoal dark:text-charcoal-dark flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                <span>{memories.length} Memories Together</span>
              </span>
            </div>

            {person.description && (
              <p className="text-sm text-slate dark:text-slate-dark pt-2 leading-relaxed max-w-2xl">
                {person.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SHARED MEDIA PHOTO GALLERY PREVIEW */}
      {allPhotos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-charcoal dark:text-charcoal-dark flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-terracotta" />
              <span>Shared Moments ({allPhotos.length})</span>
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {allPhotos.slice(0, 6).map((photo, idx) => (
              <div key={photo.id || idx} className="aspect-square rounded-2xl overflow-hidden bg-sand/30 border border-sand">
                <img src={photo.secureUrl} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-300" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEMORIES TIMELINE WITH PERSON */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-charcoal-dark flex items-center space-x-2">
          <Clock className="w-6 h-6 text-terracotta" />
          <span>Memories Created Together</span>
        </h2>

        {memories.length === 0 ? (
          <div className="p-8 bg-card-light dark:bg-card-dark rounded-3xl border border-dashed border-sand dark:border-sand-dark text-center space-y-3">
            <Sparkles className="w-8 h-8 text-terracotta/60 mx-auto" />
            <h3 className="font-serif text-lg font-bold">No memories created with {person.name} yet.</h3>
            <p className="text-xs text-slate dark:text-slate-dark">Start preserving moments created together.</p>
            <button
              onClick={() => setIsAddMemoryOpen(true)}
              className="py-2.5 px-5 bg-terracotta text-white text-xs font-semibold rounded-xl shadow transition"
            >
              Add first memory
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {memories.map((memory) => (
              <div
                key={memory.id}
                onClick={() => navigate(`/memory/${memory.id}`)}
                className="bg-card-light dark:bg-card-dark rounded-3xl border border-sand dark:border-sand-dark p-6 cursor-pointer hover:shadow-warm transition flex flex-col md:flex-row gap-6 items-start"
              >
                {memory.media?.[0]?.secureUrl && (
                  <div className="w-full md:w-48 aspect-[4/3] rounded-2xl overflow-hidden bg-sand/30 flex-shrink-0">
                    <img src={memory.media[0].secureUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-terracotta uppercase">{memory.memoryDate}</span>
                    {memory.isFavorite && <Heart className="w-4 h-4 text-peach fill-current" />}
                  </div>
                  <h3 className="font-serif font-bold text-xl text-charcoal dark:text-charcoal-dark">{memory.title || 'Untitled Memory'}</h3>
                  {memory.story && (
                    <p className="text-sm text-slate dark:text-slate-dark line-clamp-3 leading-relaxed">
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
        )}
      </div>

      {/* MODALS */}
      {isEditPersonOpen && (
        <PersonFormModal
          personToEdit={person}
          onClose={() => setIsEditPersonOpen(false)}
          onSuccess={loadData}
        />
      )}

      {isAddMemoryOpen && (
        <CreateMemoryModal
          initialPersonId={person.id}
          onClose={() => setIsAddMemoryOpen(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default PersonProfilePage;
