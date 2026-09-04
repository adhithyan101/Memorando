import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Plus, Calendar, Sparkles, X, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMemoryCapsules, createMemoryCapsule } from '../services/firestore';
import { MemoryCapsule } from '../types';

export const MemoryCapsulesPage: React.FC = () => {
  const { currentUser } = useAuth();
  
  const [capsules, setCapsules] = useState<MemoryCapsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCapsules = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const fetched = await getMemoryCapsules(currentUser.uid);
      setCapsules(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCapsules();
  }, [currentUser]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || !unlockDate || !currentUser) return;

    try {
      setSubmitting(true);
      await createMemoryCapsule(currentUser.uid, {
        title: title.trim(),
        message: message.trim(),
        unlockDate,
      });
      setIsModalOpen(false);
      setTitle('');
      setMessage('');
      setUnlockDate('');
      loadCapsules();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-terracotta">
            <Lock className="w-6 h-6" />
            <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-charcoal-dark">Memory Capsules</h1>
          </div>
          <p className="text-sm text-slate dark:text-slate-dark mt-1">
            Time-locked memories saved to be opened on a future date.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-3 px-5 bg-terracotta hover:bg-terracotta-hover text-white text-sm font-semibold rounded-2xl shadow-warm flex items-center justify-center space-x-2 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Create Time Capsule</span>
        </button>
      </div>

      {/* EMPTY STATE */}
      {!loading && capsules.length === 0 && (
        <div className="p-12 bg-card-light dark:bg-card-dark rounded-3xl border border-dashed border-sand dark:border-sand-dark text-center space-y-4 max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-charcoal-dark">
            No time capsules created yet.
          </h2>
          <p className="text-sm text-slate dark:text-slate-dark">
            Lock away a message, story, or photograph to revisit years into the future.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="py-3 px-6 bg-terracotta text-white font-medium rounded-2xl shadow-warm transition"
          >
            Lock your first capsule
          </button>
        </div>
      )}

      {/* CAPSULES LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {capsules.map((capsule) => {
          const isUnlocked = new Date(capsule.unlockDate) <= new Date();
          return (
            <div
              key={capsule.id}
              className={`p-6 rounded-3xl border transition space-y-4 ${
                isUnlocked 
                  ? 'bg-card-light dark:bg-card-dark border-sage/50 shadow-warm' 
                  : 'bg-sand/30 dark:bg-sand-dark/20 border-sand dark:border-sand-dark'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${isUnlocked ? 'bg-sage/20 text-sage' : 'bg-terracotta/10 text-terracotta'}`}>
                  {isUnlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>
                <span className="text-xs font-semibold uppercase text-slate dark:text-slate-dark">
                  {isUnlocked ? 'Unlocked' : `Unlocks: ${capsule.unlockDate}`}
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-xl text-charcoal dark:text-charcoal-dark">{capsule.title}</h3>
                {isUnlocked ? (
                  <p className="text-sm text-slate dark:text-slate-dark pt-2 leading-relaxed whitespace-pre-wrap">{capsule.message}</p>
                ) : (
                  <div className="mt-3 p-4 rounded-xl bg-card-light/60 dark:bg-card-dark/60 text-center text-xs text-slate italic">
                    🔒 Locked until {capsule.unlockDate}. Content hidden.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card-light dark:bg-card-dark rounded-3xl w-full max-w-md p-6 border border-sand shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-serif text-xl font-bold">New Memory Capsule</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Message to 2030"
                  className="w-full px-4 py-2 rounded-xl bg-bg-light border border-sand text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate mb-1">Message / Note *</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your time capsule message..."
                  className="w-full px-4 py-2 rounded-xl bg-bg-light border border-sand text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate mb-1">Unlock Date *</label>
                <input
                  type="date"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-bg-light border border-sand text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-terracotta text-white text-xs font-semibold rounded-xl">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lock Capsule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryCapsulesPage;
