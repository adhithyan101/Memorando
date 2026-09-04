import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Film, Check, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMemories } from '../services/firestore';
import { generateMemoryStory, generateMemoryMovieConcept, MemoryMovieConcept } from '../services/gemini';
import { Memory } from '../types';

export const AIStoryPage: React.FC = () => {
  const { currentUser } = useAuth();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'story' | 'movie'>('story');
  
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [movieConcept, setMovieConcept] = useState<MemoryMovieConcept | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      getMemories(currentUser.uid).then(setMemories).catch(console.error);
    }
  }, [currentUser]);

  const toggleSelectMemory = (id: string) => {
    if (selectedMemoryIds.includes(id)) {
      setSelectedMemoryIds(selectedMemoryIds.filter(i => i !== id));
    } else {
      setSelectedMemoryIds([...selectedMemoryIds, id]);
    }
  };

  const handleGenerateStory = async () => {
    setError(null);
    if (selectedMemoryIds.length === 0) {
      setError('Please select at least one memory to generate an AI story.');
      return;
    }

    const selected = memories.filter(m => selectedMemoryIds.includes(m.id));
    try {
      setLoading(true);
      const story = await generateMemoryStory(selected);
      setGeneratedStory(story);
    } catch (err: any) {
      setError(err.message || 'Failed to generate story with Gemini AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMovieConcept = async () => {
    setError(null);
    if (selectedMemoryIds.length === 0) {
      setError('Please select at least one memory to create a movie concept.');
      return;
    }

    const selected = memories.filter(m => selectedMemoryIds.includes(m.id));
    try {
      setLoading(true);
      const concept = await generateMemoryMovieConcept(selected);
      setMovieConcept(concept);
    } catch (err: any) {
      setError(err.message || 'Failed to generate movie concept with Gemini AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div>
        <div className="flex items-center space-x-2 text-terracotta">
          <Compass className="w-6 h-6" />
          <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-charcoal-dark">AI Memory Companion</h1>
        </div>
        <p className="text-sm text-slate dark:text-slate-dark mt-1">
          Craft meaningful narratives and cinematic concepts using Google Gemini based strictly on your preserved memories.
        </p>
      </div>

      {/* MODE TABS */}
      <div className="flex border-b border-sand dark:border-sand-dark">
        <button
          onClick={() => setActiveTab('story')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'story' ? 'border-terracotta text-terracotta' : 'border-transparent text-slate hover:text-charcoal'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Memory Story</span>
        </button>

        <button
          onClick={() => setActiveTab('movie')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'movie' ? 'border-terracotta text-terracotta' : 'border-transparent text-slate hover:text-charcoal'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>AI Memory Movie Concept</span>
        </button>
      </div>

      {/* MEMORY SELECTION GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-charcoal dark:text-charcoal-dark">
            Select Memories to Include ({selectedMemoryIds.length})
          </h2>
          {memories.length > 0 && (
            <button
              onClick={() => setSelectedMemoryIds(selectedMemoryIds.length === memories.length ? [] : memories.map(m => m.id))}
              className="text-xs text-terracotta underline font-semibold"
            >
              {selectedMemoryIds.length === memories.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {memories.length === 0 ? (
          <p className="text-xs text-slate italic p-4 bg-card-light rounded-2xl border border-sand">
            You don't have any memories stored yet. Add memories first to generate AI stories.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1">
            {memories.map((m) => {
              const isSelected = selectedMemoryIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => toggleSelectMemory(m.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-center space-x-2.5 ${
                    isSelected ? 'bg-peach/20 border-terracotta text-terracotta font-semibold' : 'bg-card-light border-sand text-charcoal'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isSelected ? 'bg-terracotta text-white border-terracotta' : 'border-sand'}`}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <div className="overflow-hidden text-xs">
                    <p className="truncate font-serif">{m.title || m.memoryDate}</p>
                    <p className="text-[10px] text-slate truncate">{m.memoryDate}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-xs text-red-600 border border-red-200 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* GENERATE BUTTON */}
      <div>
        {activeTab === 'story' ? (
          <button
            onClick={handleGenerateStory}
            disabled={loading || selectedMemoryIds.length === 0}
            className="py-3 px-6 bg-terracotta hover:bg-terracotta-hover text-white text-sm font-semibold rounded-2xl shadow-warm flex items-center space-x-2 disabled:opacity-50 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generate Narrative Story</span>
          </button>
        ) : (
          <button
            onClick={handleGenerateMovieConcept}
            disabled={loading || selectedMemoryIds.length === 0}
            className="py-3 px-6 bg-terracotta hover:bg-terracotta-hover text-white text-sm font-semibold rounded-2xl shadow-warm flex items-center space-x-2 disabled:opacity-50 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
            <span>Generate Movie Concept</span>
          </button>
        )}
      </div>

      {/* GENERATED STORY RESULT */}
      {activeTab === 'story' && generatedStory && (
        <div className="p-8 rounded-3xl bg-card-light dark:bg-card-dark border border-sand dark:border-sand-dark shadow-warm space-y-4">
          <div className="flex items-center justify-between border-b border-sand dark:border-sand-dark pb-3">
            <span className="px-3 py-1 rounded-full bg-peach/20 text-terracotta text-xs font-semibold uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Narrative (Gemini)</span>
            </span>
            <button
              onClick={handleGenerateStory}
              className="text-xs text-terracotta hover:underline flex items-center space-x-1 font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>
          <div className="font-serif text-lg leading-relaxed text-charcoal dark:text-charcoal-dark whitespace-pre-wrap">
            {generatedStory}
          </div>
        </div>
      )}

      {/* GENERATED MOVIE CONCEPT RESULT */}
      {activeTab === 'movie' && movieConcept && (
        <div className="p-8 rounded-3xl bg-card-light dark:bg-card-dark border border-sand dark:border-sand-dark shadow-warm space-y-6">
          <div className="flex items-center justify-between border-b border-sand dark:border-sand-dark pb-3">
            <div>
              <span className="px-3 py-1 rounded-full bg-peach/20 text-terracotta text-xs font-semibold uppercase tracking-wider">
                Cinematic Movie Architecture
              </span>
              <h3 className="font-serif text-2xl font-bold text-charcoal dark:text-charcoal-dark mt-2">{movieConcept.title}</h3>
            </div>
            <span className="text-xs font-serif italic text-terracotta">{movieConcept.theme}</span>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase text-slate">Scene Sequence Breakdown</h4>
            <div className="space-y-3">
              {movieConcept.scenes.map((scene) => (
                <div key={scene.sequence} className="p-4 rounded-2xl bg-bg-light border border-sand space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-terracotta">
                    <span>Scene #{scene.sequence}: {scene.memoryTitle}</span>
                    <span>Pacing: {scene.pacing}</span>
                  </div>
                  <p className="text-charcoal font-serif">Visual: {scene.suggestedVisual}</p>
                  <p className="text-slate italic">Caption: "{scene.caption}"</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-peach/10 border border-peach/30 text-xs space-y-1">
            <p className="font-semibold text-terracotta">Recommended Music Score: {movieConcept.musicRecommendation}</p>
            <p className="text-slate">{movieConcept.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIStoryPage;
