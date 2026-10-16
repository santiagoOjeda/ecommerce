'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '@/types';
import { auth, isFirebaseConfigured, db } from '@/lib/firebase/config';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const DEMO_USER_KEY = 'ecommerce_demo_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check demo user or Firebase Auth
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          // 1. Immediately establish the authenticated user so the UI updates without delay
          const currentUser: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuario',
            photoURL: fbUser.photoURL,
            role: 'customer',
          };
          setUser(currentUser);
          setLoading(false);

          // 2. Safely query Firestore role in the background with timeout (never blocking UI if Firestore DB is not yet created)
          if (db) {
            try {
              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Firestore timeout')), 2500)
              );
              const fetchPromise = getDoc(doc(db, 'users', fbUser.uid));
              const userDoc: any = await Promise.race([fetchPromise, timeoutPromise]);
              if (userDoc?.exists?.()) {
                const data = userDoc.data();
                setUser((prev) =>
                  prev ? { ...prev, role: data.role || prev.role, displayName: data.displayName || prev.displayName } : null
                );
              }
            } catch (err) {
              console.warn('Could not read user profile role from Firestore:', err);
            }
          }
        } else {
          setUser(null);
          setLoading(false);
        }
      });
      return () => unsubscribe();
    } else {
      // Offline / Local development fallback
      try {
        const saved = localStorage.getItem(DEMO_USER_KEY);
        if (saved) {
          setUser(JSON.parse(saved));
        } else {
          const defaultCustomer: UserProfile = {
            uid: 'demo-customer-1',
            email: 'cliente@ejemplo.com',
            displayName: 'Santiago Ojeda',
            role: 'customer',
          };
          setUser(defaultCustomer);
          localStorage.setItem(DEMO_USER_KEY, JSON.stringify(defaultCustomer));
        }
      } catch {
        setUser(null);
      }
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      // Immediately set user in state
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || email.split('@')[0],
        photoURL: cred.user.photoURL,
        role: 'customer',
      });
    } else {
      const isMockAdmin = email.toLowerCase().includes('admin');
      const mockUser: UserProfile = {
        uid: `user-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        role: isMockAdmin ? 'admin' : 'customer',
      };
      setUser(mockUser);
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser));
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);

      // Set display name in Firebase Auth profile
      try {
        await updateProfile(cred.user, { displayName: name });
      } catch (err) {
        console.warn('Could not update Firebase Auth profile display name', err);
      }

      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name,
        role: 'customer',
      };

      // Set user immediately
      setUser(profile);

      // Write to Firestore asynchronously in background (won't crash auth if Firestore is still initializing)
      if (db) {
        try {
          const cleanProfile = Object.fromEntries(
            Object.entries(profile).filter(([_, v]) => v !== undefined)
          );
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firestore timeout')), 2500)
          );
          await Promise.race([
            setDoc(doc(db, 'users', cred.user.uid), cleanProfile),
            timeoutPromise
          ]);
        } catch (err) {
          console.warn('Could not write user profile to Firestore (database may be pending creation):', err);
        }
      }
    } else {
      const mockUser: UserProfile = {
        uid: `user-${Date.now()}`,
        email,
        displayName: name,
        role: 'customer',
      };
      setUser(mockUser);
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser));
    }
  };

  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth) {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Usuario',
        photoURL: cred.user.photoURL,
        role: 'customer',
      });
    } else {
      const mockUser: UserProfile = {
        uid: `google-${Date.now()}`,
        email: 'usuario.google@ejemplo.com',
        displayName: 'Google User',
        role: 'customer',
      };
      setUser(mockUser);
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser));
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DEMO_USER_KEY);
    }
  };

  const setDemoRole = (role: UserRole) => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        setDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
