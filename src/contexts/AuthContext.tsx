import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  sendPasswordResetEmail, 
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrCreateUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        setUserProfile(snap.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          themePreference: 'light',
        };
        await setDoc(userRef, {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setUserProfile(newProfile);
      }
    } catch (err: any) {
      console.error('Error in fetchOrCreateUserProfile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchOrCreateUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
        await sendEmailVerification(res.user);
        await fetchOrCreateUserProfile(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await fetchOrCreateUserProfile(res.user);
      }
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('[AuthContext] Google Sign-In Error:', err);
      }
      if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        setError(
          `Domain Unauthorized (${currentDomain}): Please add '${currentDomain}' in Firebase Console -> Authentication -> Settings -> Authorized domains.`
        );
      } else if (err.code === 'auth/operation-not-allowed') {
        setError(
          'Google Sign-In is disabled in Firebase. Please enable Google provider under Firebase Console -> Authentication -> Sign-in method.'
        );
      } else if (err.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in window was closed before completing authentication.');
      } else {
        setError(err.message || 'Google sign in failed. Please try again.');
      }
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
      throw err;
    }
  };

  const resendVerification = async () => {
    if (currentUser) {
      setError(null);
      try {
        await sendEmailVerification(currentUser);
      } catch (err: any) {
        setError(err.message || 'Failed to resend verification email.');
        throw err;
      }
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message || 'Failed to sign out.');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      loading,
      error,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      resetPassword,
      resendVerification,
      logout,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
