import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  User, 
  Calendar, 
  Clock as ClockIcon, 
  MapPin, 
  Tag, 
  Heart, 
  Music, 
  Smile, 
  Loader2, 
  Film, 
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getPeople, createMemory, updateMemory } from '../../services/firestore';
import { uploadToCloudinary } from '../../services/cloudinary';
import { VoiceRecorder } from '../media/VoiceRecorder';
import { Person, Memory, MediaItem, VoiceNote, MoodType } from '../../types';

interface CreateMemoryModalProps {
  memoryToEdit?: Memory | null;
  initialPersonId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateMemoryModal: React.FC<CreateMemoryModalProps> = ({
  memoryToEdit,
  initialPersonId,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>(
    memoryToEdit?.personIds || (initialPersonId ? [initialPersonId] : [])
  );
  
  const [title, setTitle] = useState(memoryToEdit?.title || '');
  const [story, setStory] = useState(memoryToEdit?.story || '');
  const [date, setDate] = useState(memoryToEdit?.memoryDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(memoryToEdit?.memoryTime || '');
  const [mood, setMood] = useState<MoodType | undefined>(memoryToEdit?.mood);
  const [locationName, setLocationName] = useState(memoryToEdit?.location?.name || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(memoryToEdit?.tags || []);
  const [isFavorite, setIsFavorite] = useState(memoryToEdit?.isFavorite || false);
  const [musicTitle, setMusicTitle] = useState(memoryToEdit?.music?.title || '');
  const [musicArtist, setMusicArtist] = useState(memoryToEdit?.music?.artist || '');
  
  const [mediaList, setMediaList] = useState<MediaItem[]>(memoryToEdit?.media || []);
  const [voiceNote, setVoiceNote] = useState<VoiceNote | null>(memoryToEdit?.voiceNote || null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const moodList: { key: MoodType; label: string; emoji: string }[] = [
    { key: 'happy', label: 'Happy', emoji: '😊' },
    { key: 'nostalgic', label: 'Nostalgic', emoji: '🌅' },
    { key: 'peaceful', label: 'Peaceful', emoji: '🌿' },
    { key: 'loved', label: 'Loved', emoji: '❤️' },
    { key: 'grateful', label: 'Grateful', emoji: '🙏' },
    { key: 'excited', label: 'Excited', emoji: '✨' },
    { key: 'bittersweet', label: 'Bittersweet', emoji: '🍂' },
    { key: 'reflective', label: 'Reflective', emoji: '🌙' },
  ];

  useEffect(() => {
    if (currentUser) {
      getPeople(currentUser.uid).then(setPeople).catch(console.error);
    }
  }, [currentUser]);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setFormError(null);

    try {
      const newMediaItems: MediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const resType = file.type.startsWith('video') ? 'video' : 'image';
        const item = await uploadToCloudinary(file, resType, (percent) => {
          setUploadProgress(percent);
        });
        newMediaItems.push(item);
      }
      setMediaList((prev) => [...prev, ...newMediaItems]);
    } catch (err: any) {
      setFormError('Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const togglePersonSelection = (id: string) => {
    if (selectedPersonIds.includes(id)) {
      setSelectedPersonIds(selectedPersonIds.filter(item => item !== id));
    } else {
      setSelectedPersonIds([...selectedPersonIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedPersonIds.length) {
      setFormError('Please select at least one person associated with this memory.');
      return;
    }

    if (!date) {
      setFormError('Please select a date for this memory.');
      return;
    }

    if (!currentUser) return;

    try {
      setSubmitting(true);
      const memoryPayload = {
        personIds: selectedPersonIds,
        title: title.trim() || undefined,
        story: story.trim() || undefined,
        memoryDate: date,
        memoryTime: time || undefined,
        mood,
        location: locationName.trim() ? { name: locationName.trim() } : undefined,
        tags: tags.length ? tags : undefined,
        isFavorite,
        media: mediaList.length ? mediaList : undefined,
        voiceNote: voiceNote || undefined,
        music: musicTitle.trim() ? { title: musicTitle.trim(), artist: musicArtist.trim() || undefined } : undefined,
      };

      if (memoryToEdit) {
        await updateMemory(memoryToEdit.id, memoryPayload);
      } else {
        await createMemory(currentUser.uid, memoryPayload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to preserve memory.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card-light dark:bg-card-dark rounded-3xl w-full max-w-2xl shadow-2xl border border-sand dark:border-sand-dark overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-sand dark:border-sand-dark flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center font-serif font-bold">
              +
            </div>
            <h2 className="font-serif text-xl font-bold text-charcoal dark:text-charcoal-dark">
              {memoryToEdit ? 'Edit Memory' : 'Preserve a Memory'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-xl border transition ${
                isFavorite 
                  ? 'bg-peach/20 border-peach text-terracotta' 
                  : 'border-sand dark:border-sand-dark text-slate hover:text-charcoal'
              }`}
              title="Mark as Favorite"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            <button 
              onClick={onClose}
              className="p-2 text-slate hover:text-charcoal dark:text-slate-dark rounded-full hover:bg-sand/40 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 text-xs text-red-600 dark:text-red-300">
              {formError}
            </div>
          )}

          {/* LINKED PEOPLE (REQUIRED) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1.5 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-terracotta" />
              <span>Who was this memory created with? *</span>
            </label>

            {people.length === 0 ? (
              <p className="text-xs text-slate italic p-3 bg-bg-light dark:bg-bg-dark rounded-xl border border-sand dark:border-sand-dark">
                You haven't created any people yet. Please add a person first from the People page.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {people.map((person) => {
                  const isSelected = selectedPersonIds.includes(person.id);
                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => togglePersonSelection(person.id)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        isSelected 
                          ? 'bg-terracotta text-white border-terracotta shadow-sm' 
                          : 'bg-bg-light dark:bg-bg-dark text-slate dark:text-slate-dark border-sand dark:border-sand-dark hover:border-terracotta/50'
                      }`}
                    >
                      {person.profilePhotoUrl ? (
                        <img src={person.profilePhotoUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-peach/40 text-[9px] flex items-center justify-center font-bold">
                          {person.name[0]}
                        </div>
                      )}
                      <span>{person.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* DATE & TIME */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-terracotta" />
                <span>Date *</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1 flex items-center space-x-1">
                <ClockIcon className="w-3.5 h-3.5 text-terracotta" />
                <span>Time (Optional)</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
            </div>
          </div>

          {/* TITLE & STORY */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunset walk at Golden Gate Park"
              className="w-full px-4 py-2.5 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm font-serif focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1">
              Written Story (Optional)
            </label>
            <textarea
              rows={4}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="What made this moment special? Describe the feeling, smells, conversations..."
              className="w-full px-4 py-2.5 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 leading-relaxed"
            />
          </div>

          {/* PHOTOS & VIDEOS (CLOUDINARY) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark flex items-center space-x-1">
                <ImageIcon className="w-3.5 h-3.5 text-terracotta" />
                <span>Photos & Videos</span>
              </label>
              <label className="inline-flex items-center space-x-1 text-xs font-semibold text-terracotta cursor-pointer hover:underline">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Media</span>
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  multiple 
                  onChange={handleMediaUpload}
                  className="hidden" 
                  disabled={uploading}
                />
              </label>
            </div>

            {uploading && (
              <div className="mb-2 space-y-1">
                <div className="flex justify-between text-xs text-slate">
                  <span>Uploading to Cloudinary...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-sand rounded-full overflow-hidden">
                  <div className="h-full bg-terracotta transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {mediaList.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {mediaList.map((item, idx) => (
                  <div key={item.id || idx} className="relative aspect-square rounded-xl overflow-hidden group bg-sand/40 border border-sand">
                    {item.resourceType === 'video' ? (
                      <video src={item.secureUrl} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.secureUrl} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate dark:text-slate-dark italic">No photos or videos attached yet.</p>
            )}
          </div>

          {/* VOICE NOTE RECORDER */}
          <VoiceRecorder 
            onVoiceNoteRecorded={setVoiceNote}
            existingVoiceNote={voiceNote}
          />

          {/* MOOD SELECTOR */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1.5 flex items-center space-x-1">
              <Smile className="w-3.5 h-3.5 text-terracotta" />
              <span>Mood / Vibe</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {moodList.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMood(mood === m.key ? undefined : m.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center space-x-1.5 ${
                    mood === m.key 
                      ? 'bg-peach/30 text-terracotta border-peach shadow-sm font-semibold' 
                      : 'bg-bg-light dark:bg-bg-dark text-slate dark:text-slate-dark border-sand dark:border-sand-dark'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* LOCATION */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-terracotta" />
              <span>Location (Optional)</span>
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Kyoto, Japan / Central Park"
              className="w-full px-4 py-2.5 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            />
          </div>

          {/* MUSIC REFERENCE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1 flex items-center space-x-1">
                <Music className="w-3.5 h-3.5 text-terracotta" />
                <span>Song Title</span>
              </label>
              <input
                type="text"
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                placeholder="e.g. Autumn Leaves"
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1">
                Artist
              </label>
              <input
                type="text"
                value={musicArtist}
                onChange={(e) => setMusicArtist(e.target.value)}
                placeholder="e.g. Nat King Cole"
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
            </div>
          </div>

          {/* TAGS */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-terracotta" />
              <span>Tags</span>
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                placeholder="Add tag and press Enter"
                className="flex-1 px-3.5 py-2 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-xs focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-sand dark:bg-sand-dark text-charcoal dark:text-charcoal-dark text-xs rounded-xl hover:bg-terracotta hover:text-white transition"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span 
                    key={t}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-sand/60 dark:bg-sand-dark/40 text-xs text-charcoal dark:text-charcoal-dark"
                  >
                    <span>#{t}</span>
                    <button type="button" onClick={() => removeTag(t)} className="text-slate hover:text-red-500 ml-1">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t border-sand dark:border-sand-dark flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate dark:text-slate-dark hover:bg-sand/40 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-6 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold rounded-xl shadow-warm transition flex items-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>{memoryToEdit ? 'Save Memory' : 'Preserve Memory'}</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateMemoryModal;
