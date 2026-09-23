import React, { useState } from 'react';
import { X, Upload, User, Heart, Calendar, Palette, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createPerson, updatePerson } from '../../services/firestore';
import { uploadToCloudinary, validateImageFile } from '../../services/cloudinary';
import { Person } from '../../types';

interface PersonFormModalProps {
  personToEdit?: Person | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const PersonFormModal: React.FC<PersonFormModalProps> = ({ 
  personToEdit, 
  onClose, 
  onSuccess 
}) => {
  const { currentUser } = useAuth();

  const [name, setName] = useState(personToEdit?.name || '');
  const [nickname, setNickname] = useState(personToEdit?.nickname || '');
  const [relationship, setRelationship] = useState(personToEdit?.relationship || '');
  const [birthday, setBirthday] = useState(personToEdit?.birthday || '');
  const [description, setDescription] = useState(personToEdit?.description || '');
  const [favoriteColor, setFavoriteColor] = useState(personToEdit?.favoriteColor || '#D97757');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(personToEdit?.profilePhotoUrl || '');
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const relationships = ['Partner', 'Best Friend', 'Family', 'Parent', 'Child', 'Sibling', 'Close Friend', 'Mentor'];
  const colorOptions = ['#D97757', '#A8C3A0', '#F4B8A8', '#E7C57B', '#6E6E6E', '#8B5CF6'];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. File Validation BEFORE upload
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setFormError(validation.error || 'Please select a valid image file.');
      return;
    }

    try {
      setFormError(null);
      setUploading(true);
      setUploadProgress(0);
      if (import.meta.env.DEV) {
        console.log('[Memorando] Upload started');
      }

      // 2. Cloudinary Upload
      const media = await uploadToCloudinary(file, 'image', (percent) => setUploadProgress(percent));
      if (media && media.secureUrl) {
        setProfilePhotoUrl(media.secureUrl);
        if (import.meta.env.DEV) {
          console.log('[Memorando] Profile photo state updated');
        }
      } else {
        throw new Error("Photo upload failed, please try again later.");
      }
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('[PersonFormModal] Photo upload error:', err);
      }
      setFormError(err.message || "Photo upload failed, please try again later.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter a name for this person.');
      return;
    }

    if (!currentUser) {
      setFormError('Please sign in again to update your profile photo.');
      return;
    }

    try {
      setSubmitting(true);
      if (import.meta.env.DEV) {
        console.log('[Memorando] Firestore update started');
      }

      if (personToEdit) {
        await updatePerson(personToEdit.id, {
          name: name.trim(),
          nickname: nickname.trim() || undefined,
          relationship: relationship || undefined,
          birthday: birthday || undefined,
          description: description.trim() || undefined,
          favoriteColor,
          profilePhotoUrl: profilePhotoUrl || undefined,
        });
      } else {
        await createPerson(currentUser.uid, {
          name: name.trim(),
          nickname: nickname.trim() || undefined,
          relationship: relationship || undefined,
          birthday: birthday || undefined,
          description: description.trim() || undefined,
          favoriteColor,
          profilePhotoUrl: profilePhotoUrl || undefined,
        });
      }

      if (import.meta.env.DEV) {
        console.log('[Memorando] Firestore update successful');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('[PersonFormModal] Firestore save error:', err);
      }
      if (profilePhotoUrl && profilePhotoUrl !== personToEdit?.profilePhotoUrl) {
        setFormError("Photo uploaded, but we couldn't save your profile changes. Please try again.");
      } else {
        setFormError(err.message || 'Failed to save person details.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card-light dark:bg-card-dark rounded-3xl w-full max-w-lg shadow-2xl border border-sand dark:border-sand-dark overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-sand dark:border-sand-dark flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-xl font-bold text-charcoal dark:text-charcoal-dark">
              {personToEdit ? 'Edit Person' : 'Add Someone Special'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate hover:text-charcoal dark:text-slate-dark rounded-full hover:bg-sand/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 text-xs text-red-600 dark:text-red-300">
              {formError}
            </div>
          )}

          {/* PROFILE PHOTO UPLOAD */}
          <div className="flex items-center space-x-4">
            <div className="relative w-20 h-20 rounded-full bg-sand/60 dark:bg-sand-dark/40 flex items-center justify-center overflow-hidden border-2 border-sand dark:border-sand-dark flex-shrink-0">
              {profilePhotoUrl ? (
                <img src={profilePhotoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-slate/50" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-[10px]">
                  <Loader2 className="w-5 h-5 animate-spin mb-1" />
                  <span>{uploadProgress}%</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal dark:text-charcoal-dark mb-1">
                Profile Photo
              </label>
              <label className="inline-flex items-center space-x-2 px-3 py-2 bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark rounded-xl text-xs font-medium text-terracotta cursor-pointer hover:bg-peach/10 transition">
                <Upload className="w-3.5 h-3.5" />
                <span>{profilePhotoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* NAME */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full px-4 py-2.5 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              required
            />
          </div>

          {/* NICKNAME & RELATIONSHIP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1">
                Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. May"
                className="w-full px-4 py-2.5 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              >
                <option value="">Select...</option>
                {relationships.map((rel) => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>
          </div>

          {/* BIRTHDAY */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-terracotta" />
              <span>Birthday</span>
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1">
              Short Note / About
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why this relationship is meaningful..."
              className="w-full px-4 py-2.5 rounded-xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            />
          </div>

          {/* FAVORITE COLOR */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1.5 flex items-center space-x-1">
              <Palette className="w-3.5 h-3.5 text-terracotta" />
              <span>Accent Theme Color</span>
            </label>
            <div className="flex items-center space-x-3">
              {colorOptions.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setFavoriteColor(hex)}
                  className={`w-7 h-7 rounded-full transition transform ${
                    favoriteColor === hex ? 'scale-125 ring-2 ring-offset-2 ring-terracotta' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
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
                <span>{personToEdit ? 'Save Changes' : 'Create Person'}</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default PersonFormModal;
