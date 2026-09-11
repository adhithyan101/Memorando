import { GeoPoint, Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
  themePreference?: 'light' | 'dark' | 'system';
}

export interface Person {
  id: string;
  userId: string;
  name: string;
  nickname?: string;
  relationship?: string;
  profilePhotoUrl?: string;
  birthday?: string;
  description?: string;
  favoriteColor?: string;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  publicId?: string;
  secureUrl: string;
  resourceType: 'image' | 'video' | 'raw';
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
  createdAt: string;
}

export interface VoiceNote {
  id: string;
  publicId?: string;
  secureUrl: string;
  duration: number; // in seconds
  createdAt: string;
  transcript?: string;
}

export interface MusicRef {
  title: string;
  artist?: string;
  externalUrl?: string;
}

export interface LocationRef {
  name: string;
  address?: string;
  coordinates?: GeoPoint;
  latitude?: number;
  longitude?: number;
}

export type MoodType = 'happy' | 'nostalgic' | 'peaceful' | 'loved' | 'grateful' | 'excited' | 'bittersweet' | 'reflective';

export interface Memory {
  id: string;
  userId: string;
  personIds: string[]; // array of linked people IDs
  title?: string;
  story?: string;
  
  // EXPLICIT DATE MODEL
  memoryDate: string; // YYYY-MM-DD
  memoryTime?: string; // HH:mm format
  
  mood?: MoodType;
  location?: LocationRef;
  tags?: string[];
  isFavorite?: boolean;
  
  // Media & Voice Notes stored in subcollections or hydrated arrays
  media?: MediaItem[];
  voiceNote?: VoiceNote;
  music?: MusicRef;
  
  createdAt: string;
  updatedAt: string;
}

export interface MemoryCapsule {
  id: string;
  userId: string;
  recipientPersonId?: string;
  title: string;
  message: string;
  media?: MediaItem[];
  unlockDate: string; // ISO date string YYYY-MM-DD
  // isUnlocked is dynamically derived via: new Date() >= new Date(unlockDate)
  createdAt: string;
}

export interface FutureLetter {
  id: string;
  userId: string;
  recipientName: string;
  recipientPersonId?: string;
  title: string;
  message: string;
  media?: MediaItem[];
  unlockDate: string; // ISO date string YYYY-MM-DD
  // isUnlocked is dynamically derived via: new Date() >= new Date(unlockDate)
  createdAt: string;
}

export interface AIGeneration {
  id: string;
  userId: string;
  type: 'story' | 'movie_concept';
  sourceMemoryIds: string[];
  generatedContent: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'capsule_unlocked' | 'letter_unlocked' | 'on_this_day' | 'system';
  isRead: boolean;
  createdAt: string;
}
