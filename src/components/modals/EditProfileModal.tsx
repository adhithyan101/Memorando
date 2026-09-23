import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Camera, Trash2, User, Mail, Calendar, Sparkles, Loader2, AtSign, AlignLeft, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { uploadToCloudinary, validateImageFile } from '../../services/cloudinary';

interface EditProfileModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose, onSuccess }) => {
  const { currentUser, userProfile, updateUserProfileData } = useAuth();

  const [displayName, setDisplayName] = useState(
    userProfile?.displayName || currentUser?.displayName || ''
  );
  const [username, setUsername] = useState(userProfile?.username || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [birthday, setBirthday] = useState(userProfile?.birthday || '');
  const [photoURL, setPhotoURL] = useState<string | null>(
    userProfile?.photoURL || currentUser?.photoURL || null
  );

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const bioMaxChars = 200;

  useEffect(() => {
    if (formError && formRef.current) {
      formRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [formError]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setFormError(validation.error || 'Please select a valid image file.');
      return;
    }

    try {
      setFormError(null);
      setUploading(true);
      setUploadProgress(0);

      const media = await uploadToCloudinary(file, 'image', (percent) => {
        setUploadProgress(percent);
      });

      if (media && media.secureUrl) {
        setPhotoURL(media.secureUrl);
      } else {
        throw new Error('Photo upload failed. Please try again.');
      }
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('[EditProfileModal] Photo upload error:', err);
      }
      setFormError(err.message || 'Photo upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoURL(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!displayName.trim()) {
      setFormError('Please enter a display name.');
      return;
    }

    if (bio.length > bioMaxChars) {
      setFormError(`Bio cannot exceed ${bioMaxChars} characters.`);
      return;
    }

    if (!currentUser) {
      setFormError('You must be signed in to update your profile.');
      return;
    }

    try {
      setSubmitting(true);
      const cleanUsername = username.trim().replace(/^@/, '');

      await updateUserProfileData({
        displayName: displayName.trim(),
        username: cleanUsername ? `@${cleanUsername}` : undefined,
        bio: bio.trim() || undefined,
        birthday: birthday || undefined,
        photoURL: photoURL,
      });

      setSuccessMsg('Profile updated successfully!');

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 600);
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('[EditProfileModal] Profile update error:', err);
      }
      setFormError(err.message || "Couldn't save your profile changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fallbackInitial = (displayName || currentUser?.email || 'U')[0].toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card-light dark:bg-card-dark rounded-3xl w-full max-w-lg shadow-2xl border border-sand dark:border-sand-dark overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-sand dark:border-sand-dark flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-xl font-bold text-charcoal dark:text-charcoal-dark">
              Edit Your Profile
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate hover:text-charcoal dark:text-slate-dark rounded-full hover:bg-sand/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          
          {formError && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 text-xs text-red-600 dark:text-red-300">
              {formError}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 text-xs text-green-700 dark:text-green-300 flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* AVATAR / PROFILE PHOTO UPLOAD */}
          <div className="flex flex-col items-center justify-center py-2 space-y-3">
            <div className="relative w-28 h-28 rounded-full bg-peach/30 border-4 border-card-light dark:border-card-dark shadow-warm overflow-hidden flex items-center justify-center text-terracotta font-serif font-bold text-4xl group">
              {photoURL ? (
                <img src={photoURL} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <span>{fallbackInitial}</span>
              )}

              {uploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs space-y-1">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
              )}

              <label 
                className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Change</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                  disabled={uploading || submitting}
                />
              </label>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <label className="inline-flex items-center space-x-1.5 font-medium text-terracotta hover:underline cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                  disabled={uploading || submitting}
                />
              </label>

              {photoURL && (
                <>
                  <span className="text-slate/40">•</span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={uploading || submitting}
                    className="inline-flex items-center space-x-1 font-medium text-slate dark:text-slate-dark hover:text-red-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* DISPLAY NAME */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1.5">
              Display Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/50" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Adhithyan"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                required
              />
            </div>
          </div>

          {/* USERNAME */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1.5">
              Username (Optional)
            </label>
            <div className="relative">
              <AtSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/50" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. memory_keeper"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
            </div>
          </div>

          {/* BIO */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark flex items-center space-x-1">
                <AlignLeft className="w-3.5 h-3.5 text-terracotta" />
                <span>Personal Bio (Optional)</span>
              </label>
              <span className={`text-[11px] ${bio.length > bioMaxChars ? 'text-red-500 font-bold' : 'text-slate/60'}`}>
                {bio.length}/{bioMaxChars}
              </span>
            </div>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a little about yourself or your memory philosophy..."
              className="w-full px-4 py-2.5 rounded-2xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 leading-relaxed"
              maxLength={bioMaxChars}
            />
          </div>

          {/* BIRTHDAY */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1.5 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-terracotta" />
              <span>Birthday (Optional)</span>
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            />
          </div>

          {/* EMAIL (READ ONLY) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark mb-1.5 flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-slate/60" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={currentUser?.email || ''}
              disabled
              className="w-full px-4 py-2.5 rounded-2xl bg-sand/30 dark:bg-sand-dark/20 border border-sand dark:border-sand-dark text-sm text-slate dark:text-slate-dark opacity-80 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate/70 mt-1 italic">Email address is managed by your account sign-in provider.</p>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t border-sand dark:border-sand-dark flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || uploading}
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
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default EditProfileModal;
