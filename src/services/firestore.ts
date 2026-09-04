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
import { Person, Memory, MemoryCapsule, FutureLetter, AppNotification, MediaItem, VoiceNote } from '../types';

// ==========================================
// PEOPLE SERVICES
// ==========================================

export const getPeople = async (userId: string): Promise<Person[]> => {
  if (!userId) return [];
  const q = query(
    collection(db, 'people'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person));
};

export const getPersonById = async (personId: string): Promise<Person | null> => {
  if (!personId) return null;
  const docRef = doc(db, 'people', personId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Person;
};

export const createPerson = async (userId: string, data: Omit<Person, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'people'), {
    ...data,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    serverCreatedAt: serverTimestamp(),
  });
  return docRef.id;
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
  const q = query(
    collection(db, 'memories'),
    where('userId', '==', userId),
    orderBy('memoryDate', 'desc')
  );
  const snap = await getDocs(q);
  
  return Promise.all(
    snap.docs.map(d => hydrateMemoryMediaAndVoice(d.id, d.data()))
  );
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
  const q = query(
    collection(db, 'memories'),
    where('userId', '==', userId),
    where('personIds', 'array-contains', personId),
    orderBy('memoryDate', 'desc')
  );
  const snap = await getDocs(q);
  return Promise.all(
    snap.docs.map(d => hydrateMemoryMediaAndVoice(d.id, d.data()))
  );
};

export const createMemory = async (
  userId: string, 
  data: Omit<Memory, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const { media, voiceNote, location, ...rest } = data;

  // Convert location coordinates to Firestore GeoPoint if lat/lng available
  let locationPayload = location;
  if (location && location.latitude !== undefined && location.longitude !== undefined) {
    locationPayload = {
      name: location.name,
      address: location.address,
      coordinates: new GeoPoint(location.latitude, location.longitude),
    };
  }

  // Create main memory document
  const docRef = await addDoc(collection(db, 'memories'), {
    ...rest,
    location: locationPayload || null,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    serverCreatedAt: serverTimestamp(),
  });

  // Save media items in subcollection: memories/{memoryId}/media
  if (media && media.length > 0) {
    for (const item of media) {
      await addDoc(collection(db, 'memories', docRef.id, 'media'), {
        publicId: item.publicId,
        secureUrl: item.secureUrl,
        resourceType: item.resourceType,
        format: item.format || null,
        width: item.width || null,
        height: item.height || null,
        duration: item.duration || null,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Save voice note in subcollection: memories/{memoryId}/voiceNotes
  if (voiceNote) {
    await addDoc(collection(db, 'memories', docRef.id, 'voiceNotes'), {
      publicId: voiceNote.publicId,
      secureUrl: voiceNote.secureUrl,
      duration: voiceNote.duration,
      transcript: voiceNote.transcript || null,
      createdAt: new Date().toISOString(),
    });
  }

  return docRef.id;
};

export const updateMemory = async (memoryId: string, data: Partial<Memory>): Promise<void> => {
  const { media, voiceNote, location, ...rest } = data;

  let locationPayload = location;
  if (location && location.latitude !== undefined && location.longitude !== undefined) {
    locationPayload = {
      name: location.name,
      address: location.address,
      coordinates: new GeoPoint(location.latitude, location.longitude),
    };
  }

  const docRef = doc(db, 'memories', memoryId);
  await updateDoc(docRef, {
    ...rest,
    ...(locationPayload !== undefined ? { location: locationPayload } : {}),
    updatedAt: new Date().toISOString(),
  });
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
  const q = query(
    collection(db, 'memoryCapsules'),
    where('userId', '==', userId),
    orderBy('unlockDate', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MemoryCapsule));
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
  const q = query(
    collection(db, 'futureLetters'),
    where('userId', '==', userId),
    orderBy('unlockDate', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FutureLetter));
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
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
};
