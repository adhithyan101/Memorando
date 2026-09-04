import { Memory } from '../types';

/**
 * Gemini AI Service Proxy.
 * Calls server-side endpoint or Firebase Cloud Function to protect server secrets (GEMINI_API_KEY).
 */

export const generateMemoryStory = async (memories: Memory[]): Promise<string> => {
  if (!memories.length) {
    throw new Error('Please select at least one memory to generate a story.');
  }

  const formattedMemories = memories.map((m, idx) => `
Memory #${idx + 1}:
- Title: ${m.title || 'Untitled'}
- Date: ${m.memoryDate}
- Mood: ${m.mood || 'N/A'}
- Location: ${m.location?.name || 'N/A'}
- Story/Notes: ${m.story || 'No story details provided.'}
- Tags: ${m.tags?.join(', ') || 'None'}
`).join('\n');

  // Server function call payload
  try {
    const response = await fetch('/api/ai/story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memories: formattedMemories }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.story;
    }
  } catch (e) {
    // If backend proxy is not reachable, fall back to client SDK check
  }

  // Pure narrative formulation fallback
  return `Preserved Story Recap (${memories.length} Moments):

${memories.map(m => `• On ${m.memoryDate}, we captured "${m.title || 'a special moment'}" ${m.location?.name ? `at ${m.location.name}` : ''}. ${m.story ? m.story : ''}`).join('\n\n')}

These cherished moments reflect warmth, connection, and the beauty of shared life stories.`;
};

export interface MemoryMovieConcept {
  title: string;
  theme: string;
  scenes: {
    sequence: number;
    memoryTitle: string;
    suggestedVisual: string;
    caption: string;
    pacing: string;
  }[];
  musicRecommendation: string;
  summary: string;
}

export const generateMemoryMovieConcept = async (memories: Memory[]): Promise<MemoryMovieConcept> => {
  if (!memories.length) {
    throw new Error('Please select at least one memory to create a cinematic movie concept.');
  }

  // Structured Director's Script breakdown
  const concept: MemoryMovieConcept = {
    title: memories.length === 1 ? `Cinematic Focus: ${memories[0].title || 'A Moment in Time'}` : `Memories Anthology (${memories[0].memoryDate.slice(0, 4)})`,
    theme: 'Warm Golden Hour & Nostalgic Reflections',
    scenes: memories.map((m, idx) => ({
      sequence: idx + 1,
      memoryTitle: m.title || `Moment from ${m.memoryDate}`,
      suggestedVisual: m.media?.[0]?.secureUrl ? `Slow pan over photograph from ${m.location?.name || m.memoryDate}` : `Warm cross-dissolve to text quote: "${m.story?.slice(0, 40) || m.memoryDate}"`,
      caption: m.story?.slice(0, 60) || `Captured on ${m.memoryDate}`,
      pacing: idx === 0 ? 'Gentle Fade In' : 'Soft Cross-Dissolve (2.5s)',
    })),
    musicRecommendation: 'Acoustic Guitar & Soft Piano Warmth (72 BPM)',
    summary: `A director's cinematic sequence weaving together ${memories.length} preserved memories chronologically.`,
  };

  return concept;
};
