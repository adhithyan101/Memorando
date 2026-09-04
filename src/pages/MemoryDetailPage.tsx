import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Edit3, 
  Trash2, 
  Share2, 
  MapPin, 
  Calendar, 
  Clock, 
  Smile, 
  Tag, 
  Music, 
  Mic, 
  Play, 
  Pause,
  User,
  Sparkles,
  Maximize2,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMemoryById, deleteMemory, toggleFavoriteMemory, getPeople } from '../services/firestore';
import { Memory, Person } from '../types';
import CreateMemoryModal from '../components/modals/CreateMemoryModal';

export const MemoryDetailPage: React.FC = () => {
  const { memoryId } = useParams<{ memoryId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [memory, setMemory] = useState<Memory | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isFullscreenMedia, setIsFullscreenMedia] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const loadData = async () => {
    if (!memoryId || !currentUser) return;
    try {
      setLoading(true);
      const [fetchedMemory, fetchedPeople] = await Promise.all([
        getMemoryById(memoryId),
        getPeople(currentUser.uid)
      ]);
      setMemory(fetchedMemory);
      setIsFavorite(fetchedMemory?.isFavorite || false);
      setPeople(fetchedPeople);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [memoryId, currentUser]);

  const handleFavoriteToggle = async () => {
    if (!memory) return;
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    await toggleFavoriteMemory(memory.id, isFavorite);
  };

  const handleDelete = async () => {
    if (!memory) return;
    if (window.confirm('Are you sure you want to delete this memory from your album?')) {
      await deleteMemory(memory.id);
      navigate('/');
    }
  };

  const handleShare = () => {
    if (navigator.share && memory) {
      navigator.share({
        title: memory.title || 'Preserved Memory',
        text: memory.story || 'A special moment on Memorando',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Memory URL copied to clipboard!');
    }
  };

  const toggleVoiceNote = () => {
    if (!memory?.voiceNote?.secureUrl) return;

    if (!audioElement) {
      const audio = new Audio(memory.voiceNote.secureUrl);
      audio.onended = () => setIsPlayingAudio(false);
      setAudioElement(audio);
      audio.play();
      setIsPlayingAudio(true);
    } else {
      if (isPlayingAudio) {
        audioElement.pause();
        setIsPlayingAudio(false);
      } else {
        audioElement.play();
        setIsPlayingAudio(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Sparkles className="w-8 h-8 text-terracotta animate-pulse" />
        <p className="text-sm text-slate">Opening memory...</p>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold">Memory not found</h2>
        <button onClick={() => navigate('/')} className="text-xs text-terracotta underline font-semibold">
          Return Home
        </button>
      </div>
    );
  }

  const linkedPeople = people.filter(p => memory.personIds.includes(p.id));
  const currentMedia = memory.media?.[activeMediaIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* NAVIGATION & ACTIONS HEADER */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate dark:text-slate-dark hover:text-charcoal transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleFavoriteToggle}
            className={`p-2.5 rounded-2xl border transition ${
              isFavorite 
                ? 'bg-peach/20 border-peach text-terracotta' 
                : 'bg-card-light dark:bg-card-dark border-sand text-slate hover:text-charcoal'
            }`}
            title="Favorite"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 bg-card-light dark:bg-card-dark border border-sand dark:border-sand-dark rounded-2xl text-slate hover:text-charcoal transition"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-2.5 bg-card-light dark:bg-card-dark border border-sand dark:border-sand-dark rounded-2xl text-slate hover:text-charcoal transition"
            title="Edit"
          >
            <Edit3 className="w-5 h-5" />
          </button>

          <button
            onClick={handleDelete}
            className="p-2.5 bg-card-light dark:bg-card-dark border border-sand dark:border-sand-dark rounded-2xl text-slate hover:text-red-500 transition"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MEDIA GALLERY DISPLAY */}
      {memory.media && memory.media.length > 0 && (
        <div className="space-y-3">
          <div className="relative aspect-[16/10] bg-sand/30 rounded-3xl overflow-hidden border border-sand dark:border-sand-dark shadow-warm">
            {currentMedia?.resourceType === 'video' ? (
              <video src={currentMedia.secureUrl} controls className="w-full h-full object-contain bg-black" />
            ) : (
              <img 
                src={currentMedia?.secureUrl} 
                alt="" 
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setIsFullscreenMedia(true)}
              />
            )}

            <button
              onClick={() => setIsFullscreenMedia(true)}
              className="absolute top-4 right-4 p-2.5 bg-black/50 text-white rounded-full backdrop-blur hover:bg-black/70 transition"
              title="Full Screen View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* MEDIA THUMBNAILS */}
          {memory.media.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {memory.media.map((item, idx) => (
                <button
                  key={item.id || idx}
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition ${
                    activeMediaIndex === idx ? 'border-terracotta scale-105 shadow' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={item.secureUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MEMORY DETAILS & STORY */}
      <div className="bg-card-light dark:bg-card-dark rounded-3xl border border-sand dark:border-sand-dark p-6 md:p-8 space-y-6 shadow-warm">
        
        {/* Title & Linked People */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-peach/20 text-terracotta text-xs font-semibold uppercase tracking-wider flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{memory.memoryDate}</span>
            </span>

            {memory.memoryTime && (
              <span className="px-3.5 py-1.5 rounded-full bg-sand/50 dark:bg-sand-dark/30 text-xs text-charcoal dark:text-charcoal-dark flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-terracotta" />
                <span>{memory.memoryTime}</span>
              </span>
            )}

            {memory.mood && (
              <span className="px-3.5 py-1.5 rounded-full bg-gold/20 text-charcoal text-xs font-medium flex items-center space-x-1">
                <Smile className="w-3.5 h-3.5 text-terracotta" />
                <span>Mood: {memory.mood}</span>
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-charcoal dark:text-charcoal-dark tracking-tight">
            {memory.title || 'Untitled Memory'}
          </h1>

          {/* Linked People Badges */}
          {linkedPeople.length > 0 && (
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-xs text-slate dark:text-slate-dark">With:</span>
              <div className="flex flex-wrap gap-2">
                {linkedPeople.map(p => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/person/${p.id}`)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-xs font-medium text-charcoal dark:text-charcoal-dark hover:border-terracotta transition"
                  >
                    <User className="w-3.5 h-3.5 text-terracotta" />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Written Story */}
        {memory.story && (
          <div className="border-t border-b border-sand dark:border-sand-dark py-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-3">Written Story</h2>
            <p className="font-serif text-lg leading-relaxed text-charcoal dark:text-charcoal-dark whitespace-pre-wrap">
              {memory.story}
            </p>
          </div>
        )}

        {/* VOICE NOTE PLAYER */}
        {memory.voiceNote?.secureUrl && (
          <div className="p-4 rounded-2xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleVoiceNote}
                className="w-10 h-10 rounded-full bg-terracotta text-white flex items-center justify-center shadow-warm hover:bg-terracotta-hover transition"
              >
                {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <div>
                <p className="text-xs font-semibold text-charcoal dark:text-charcoal-dark flex items-center space-x-1">
                  <Mic className="w-3.5 h-3.5 text-terracotta" />
                  <span>Voice Note Memory</span>
                </p>
                <p className="text-[11px] text-slate dark:text-slate-dark">
                  Duration: {Math.floor(memory.voiceNote.duration / 60)}m {memory.voiceNote.duration % 60}s
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MUSIC & LOCATION & TAGS METADATA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {memory.location?.name && (
            <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark">
              <MapPin className="w-4 h-4 text-terracotta" />
              <div>
                <p className="font-semibold text-charcoal dark:text-charcoal-dark">Location</p>
                <p className="text-slate dark:text-slate-dark">{memory.location.name}</p>
              </div>
            </div>
          )}

          {memory.music?.title && (
            <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark">
              <Music className="w-4 h-4 text-terracotta" />
              <div>
                <p className="font-semibold text-charcoal dark:text-charcoal-dark">{memory.music.title}</p>
                <p className="text-slate dark:text-slate-dark">{memory.music.artist || 'Attached Song'}</p>
              </div>
            </div>
          )}
        </div>

        {/* TAGS */}
        {memory.tags && memory.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {memory.tags.map(t => (
              <span key={t} className="px-3 py-1 rounded-full bg-sand/50 dark:bg-sand-dark/30 text-xs text-charcoal dark:text-charcoal-dark flex items-center space-x-1">
                <Tag className="w-3 h-3 text-terracotta" />
                <span>#{t}</span>
              </span>
            ))}
          </div>
        )}

      </div>

      {/* FULLSCREEN MEDIA MODAL */}
      {isFullscreenMedia && currentMedia && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreenMedia(false)}
            className="absolute top-4 right-4 p-3 text-white hover:text-peach transition"
          >
            <X className="w-8 h-8" />
          </button>
          <img src={currentMedia.secureUrl} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      {/* EDIT MEMORY MODAL */}
      {isEditModalOpen && (
        <CreateMemoryModal
          memoryToEdit={memory}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default MemoryDetailPage;
