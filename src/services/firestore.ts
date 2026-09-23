import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  GeoPoint
} from 'firebase/firestore';
import { db } from './firebase';
import { Person, Memory, MemoryCapsule, FutureLetter, AppNotification, MediaItem, VoiceNote, UserProfile } from '../types';

// ==========================================
// USER PROFILE SERVICES
// ==========================================

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) return null;
  const docRef = doc(db, 'users', userId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as UserProfile;
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  if (!userId) return;
  const docRef = doc(db, 'users', userId);
  const payload = sanitizeFirestorePayload({
    ...data,
    updatedAt: new Date().toISOString(),
  });
  await updateDoc(docRef, payload);
};

// ==========================================
// PEOPLE SERVICES
// ==========================================

export const getPeople = async (userId: string): Promise<Person[]> => {
  if (!userId) return [];
  if (import.meta.env.DEV) {
    console.log('[Memorando] Auth user UID for getPeople:', userId);
    console.log('[Memorando] People query path: collection("people").where("userId", "==", "' + userId + '")');
  }
  try {
    const q = query(
      collection(db, 'people'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person));
    items.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
    if (import.meta.env.DEV) {
      console.log('[Memorando] People query returned:', snap.docs.length, 'documents');
      console.log('[Memorando] People data:', items);
    }
    return items;
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.error('[Memorando] Firestore error in getPeople:', `code=${err.code || 'unknown'} message=${err.message}`);
    }
    throw err;
  }
};

export const getPersonById = async (personId: string): Promise<Person | null> => {
  if (!personId) return null;
  const docRef = doc(db, 'people', personId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Person;
};

export const createPerson = async (userId: string, data: Omit<Person, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  if (import.meta.env.DEV) {
    console.log('[Memorando] Auth user UID for createPerson:', userId);
    console.log('[Memorando] Creating person with data:', data);
  }
  try {
    const docRef = await addDoc(collection(db, 'people'), {
      ...data,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverCreatedAt: serverTimestamp(),
    });
    if (import.meta.env.DEV) {
      console.log('[Memorando] Firestore person document created:', docRef.id);
    }
    return docRef.id;
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.error('[Memorando] Firestore error in createPerson:', `code=${err.code || 'unknown'} message=${err.message}`);
    }
    throw err;
  }
};

export const updatePerson = async (personId: string, data: Partial<Person>): Promise<void> => {
  const docRef = doc(db, 'people', personId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deletePerson = async (personId: string): Promise<void> => {
  const docRef = doc(db, 'people', personId);
  await deleteDoc(docRef);
};

// ==========================================
// MEMORIES & MEDIA SUBCOLLECTIONS SERVICES
// ==========================================

const hydrateMemoryMediaAndVoice = async (memoryDocId: string, memoryData: any): Promise<Memory> => {
  // Fetch media subcollection: memories/{memoryId}/media
  const mediaSnap = await getDocs(collection(db, 'memories', memoryDocId, 'media'));
  const mediaItems: MediaItem[] = mediaSnap.docs.map(d => ({ id: d.id, ...d.data() } as MediaItem));

  // Fetch voice notes subcollection: memories/{memoryId}/voiceNotes
  const voiceSnap = await getDocs(collection(db, 'memories', memoryDocId, 'voiceNotes'));
  const voiceNote: VoiceNote | undefined = voiceSnap.docs.length > 0 ? ({ id: voiceSnap.docs[0].id, ...voiceSnap.docs[0].data() } as VoiceNote) : undefined;

  // Process GeoPoint location
  let location = memoryData.location;
  if (location && location.coordinates instanceof GeoPoint) {
    location = {
      ...location,
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
    };
  }

  return {
    id: memoryDocId,
    ...memoryData,
    location,
    media: mediaItems,
    voiceNote,
  } as Memory;
};

export const getMemories = async (userId: string): Promise<Memory[]> => {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'memories'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    
    const items = await Promise.all(
      snap.docs.map(d => hydrateMemoryMediaAndVoice(d.id, d.data()))
    );
    items.sort((a, b) => {
      const timeA = a.memoryDate ? new Date(a.memoryDate).getTime() : 0;
      const timeB = b.memoryDate ? new Date(b.memoryDate).getTime() : 0;
      return timeB - timeA;
    });
    return items;
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.error('[Memorando] Firestore error in getMemories:', `code=${err.code || 'unknown'} message=${err.message}`);
    }
    return [];
  }
};

export const getMemoryById = async (memoryId: string): Promise<Memory | null> => {
  if (!memoryId) return null;
  const docRef = doc(db, 'memories', memoryId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return hydrateMemoryMediaAndVoice(snap.id, snap.data());
};

export const getMemoriesForPerson = async (userId: string, personId: string): Promise<Memory[]> => {
  if (!userId || !personId) return [];
  try {
    const q = query(
      collection(db, 'memories'),
      where('userId', '==', userId),
      where('personIds', 'array-contains', personId)
    );
    const snap = await getDocs(q);
    const items = await Promise.all(
      snap.docs.map(d => hydrateMemoryMediaAndVoice(d.id, d.data()))
    );
    items.sort((a, b) => {
      const timeA = a.memoryDate ? new Date(a.memoryDate).getTime() : 0;
      const timeB = b.memoryDate ? new Date(b.memoryDate).getTime() : 0;
      return timeB - timeA;
    });
    return items;
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.error('[Memorando] Firestore error in getMemoriesForPerson:', `code=${err.code || 'unknown'} message=${err.message}`);
    }
    return [];
  }
};

// Helper to remove undefined properties from Firestore payloads so addDoc/updateDoc never throw invalid data error
const sanitizeFirestorePayload = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof GeoPoint)) {
        sanitized[key] = sanitizeFirestorePayload(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  return sanitized;
};

export const createMemory = async (
  userId: string, 
  data: Omit<Memory, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  if (import.meta.env.DEV) {
    console.log('[Memorando] Firestore memory creation started for Auth UID:', userId);
  }

  const { media, voiceNote, location, ...rest } = data;

  // Convert location coordinates to Firestore GeoPoint if lat/lng available
  let locationPayload = location;
  if (location && location.latitude !== undefined && location.longitude !== undefined) {
    locationPayload = {
      name: location.name,
      address: location.address || undefined,
      coordinates: new GeoPoint(location.latitude, location.longitude),
    };
  }

  const payload = sanitizeFirestorePayload({
    ...rest,
    location: locationPayload || null,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    serverCreatedAt: serverTimestamp(),
  });

  if (import.meta.env.DEV) {
    console.log('[Memorando] Memory payload:', payload);
  }

  try {
    // Create main memory document
    const docRef = await addDoc(collection(db, 'memories'), payload);
    if (import.meta.env.DEV) {
      console.log('[Memorando] Firestore memory created. Memory ID:', docRef.id);
    }

    // Save media items in subcollection: memories/{memoryId}/media
    if (media && media.length > 0) {
      if (import.meta.env.DEV) {
        console.log('[Memorando] Saving media items to subcollection memories/' + docRef.id + '/media');
      }
      for (const item of media) {
        await addDoc(collection(db, 'memories', docRef.id, 'media'), sanitizeFirestorePayload({
          publicId: item.publicId || null,
          secureUrl: item.secureUrl,
          resourceType: item.resourceType || 'image',
          format: item.format || null,
          width: item.width || null,
          height: item.height || null,
          duration: item.duration || null,
          createdAt: new Date().toISOString(),
        }));
      }
    }

    // Save voice note in subcollection: memories/{memoryId}/voiceNotes
    if (voiceNote) {
      if (import.meta.env.DEV) {
        console.log('[Memorando] Saving voice note to subcollection memories/' + docRef.id + '/voiceNotes');
      }
      await addDoc(collection(db, 'memories', docRef.id, 'voiceNotes'), sanitizeFirestorePayload({
        publicId: voiceNote.publicId || null,
        secureUrl: voiceNote.secureUrl,
        duration: voiceNote.duration || 0,
        transcript: voiceNote.transcript || null,
        createdAt: new Date().toISOString(),
      }));
    }

    return docRef.id;
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.error('[Memorando] MEMORY SAVE FAILED in createMemory:', `code=${err.code || 'unknown'} message=${err.message}`, err);
    }
    throw err;
  }
};

export const updateMemory = async (memoryId: string, data: Partial<Memory>): Promise<void> => {
  const { media, voiceNote, location, ...rest } = data;

  let locationPayload = location;
  if (location && location.latitude !== undefined && location.longitude !== undefined) {
    locationPayload = {
      name: location.name,
      address: location.address || undefined,
      coordinates: new GeoPoint(location.latitude, location.longitude),
    };
  }

  const payload = sanitizeFirestorePayload({
    ...rest,
    ...(locationPayload !== undefined ? { location: locationPayload } : {}),
    updatedAt: new Date().toISOString(),
  });

  const docRef = doc(db, 'memories', memoryId);
  await updateDoc(docRef, payload);
};

export const deleteMemory = async (memoryId: string): Promise<void> => {
  const docRef = doc(db, 'memories', memoryId);
  await deleteDoc(docRef);
};

export const toggleFavoriteMemory = async (memoryId: string, currentStatus: boolean): Promise<void> => {
  const docRef = doc(db, 'memories', memoryId);
  await updateDoc(docRef, {
    isFavorite: !currentStatus,
    updatedAt: new Date().toISOString(),
  });
};

// ==========================================
// MEMORY CAPSULES SERVICES
// ==========================================

export const getMemoryCapsules = async (userId: string): Promise<MemoryCapsule[]> => {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'memoryCapsules'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MemoryCapsule));
    items.sort((a, b) => (a.unlockDate || '').localeCompare(b.unlockDate || ''));
    return items;
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.error('[Memorando] Firestore error in getMemoryCapsules:', `code=${err.code || 'unknown'} message=${err.message}`);
    }
    return [];
  }
};

export const createMemoryCapsule = async (userId: string, data: Omit<MemoryCapsule, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'memoryCapsules'), {
    ...data,
    userId,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

// ==========================================
// FUTURE LETTERS SERVICES
// ==========================================

export const getFutureLetters = async (userId: string): Promise<FutureLetter[]> => {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'futureLetters'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FutureLetter));
    items.sort((a, b) => (a.unlockDate || '').localeCompare(b.unlockDate || ''));
    return items;
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.error('[Memorando] Firestore error in getFutureLetters:', `code=${err.code || 'unknown'} message=${err.message}`);
    }
    return [];
  }
};

export const createFutureLetter = async (userId: string, data: Omit<FutureLetter, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'futureLetters'), {
    ...data,
    userId,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

// ==========================================
// NOTIFICATIONS SERVICES
// ==========================================

export const getNotifications = async (userId: string): Promise<AppNotification[]> => {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return items;
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.error('[Memorando] Firestore error in getNotifications:', `code=${err.code || 'unknown'} message=${err.message}`);
    }
    return [];
  }
};
