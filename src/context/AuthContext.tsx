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

export const ADMIN_EMAIL = 'santiago.ojeda.dm@gmail.com';

export const isUserAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
};

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const DEMO_USER_KEY = 'ecommerce_demo_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check Firebase Auth or restore saved user
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const isCurrentAdmin = isUserAdmin(fbUser.email);
          const currentUser: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuario',
            photoURL: fbUser.photoURL,
            role: isCurrentAdmin ? 'admin' : 'customer',
          };
          setUser(currentUser);
          setLoading(false);

          // Sync user profile in Firestore
          if (db) {
            try {
              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Firestore timeout')), 2500)
              );
              const userRef = doc(db, 'users', fbUser.uid);
              const fetchPromise = getDoc(userRef);
              const userDoc: any = await Promise.race([fetchPromise, timeoutPromise]);

              if (userDoc?.exists?.()) {
                const data = userDoc.data();
                // Enforce that only ADMIN_EMAIL can have the admin role
                const finalRole: UserRole = isCurrentAdmin ? 'admin' : 'customer';
                setUser((prev) =>
                  prev ? { ...prev, role: finalRole, displayName: data.displayName || prev.displayName } : null
                );
              } else {
                // Initial creation of profile in Firestore
                await setDoc(userRef, {
                  uid: fbUser.uid,
                  email: fbUser.email,
                  displayName: currentUser.displayName,
                  role: isCurrentAdmin ? 'admin' : 'customer',
                  createdAt: Date.now(),
                }, { merge: true });
              }
            } catch (err) {
              console.warn('Could not sync user profile role with Firestore:', err);
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
          const parsed = JSON.parse(saved);
          setUser({
            ...parsed,
            role: isUserAdmin(parsed.email) ? 'admin' : 'customer',
          });
        } else {
          const defaultCustomer: UserProfile = {
            uid: 'demo-customer-1',
            email: 'cliente@ejemplo.com',
            displayName: 'Usuario Demo',
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
    const isCurrentAdmin = isUserAdmin(email);
    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || email.split('@')[0],
        photoURL: cred.user.photoURL,
        role: isCurrentAdmin ? 'admin' : 'customer',
      });
    } else {
      const mockUser: UserProfile = {
        uid: `user-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        role: isCurrentAdmin ? 'admin' : 'customer',
      };
      setUser(mockUser);
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser));
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    const isCurrentAdmin = isUserAdmin(email);
    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);

      try {
        await updateProfile(cred.user, { displayName: name });
      } catch (err) {
        console.warn('Could not update Firebase Auth profile display name', err);
      }

      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name,
        role: isCurrentAdmin ? 'admin' : 'customer',
      };

      setUser(profile);

      if (db) {
        try {
          await setDoc(doc(db, 'users', cred.user.uid), {
            ...profile,
            createdAt: Date.now(),
          }, { merge: true });
        } catch (err) {
          console.warn('Could not write user profile to Firestore:', err);
        }
      }
    } else {
      const mockUser: UserProfile = {
        uid: `user-${Date.now()}`,
        email,
        displayName: name,
        role: isCurrentAdmin ? 'admin' : 'customer',
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
      const isCurrentAdmin = isUserAdmin(cred.user.email);
      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Usuario',
        photoURL: cred.user.photoURL,
        role: isCurrentAdmin ? 'admin' : 'customer',
      };
      setUser(profile);

      if (db) {
        try {
          await setDoc(doc(db, 'users', cred.user.uid), {
            ...profile,
            updatedAt: Date.now(),
          }, { merge: true });
        } catch (err) {
          console.warn('Could not update Google user profile in Firestore:', err);
        }
      }
    } else {
      const mockAdmin = isUserAdmin('santiago.ojeda.dm@gmail.com');
      const mockUser: UserProfile = {
        uid: `google-${Date.now()}`,
        email: 'santiago.ojeda.dm@gmail.com',
        displayName: 'Santiago Ojeda',
        role: mockAdmin ? 'admin' : 'customer',
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: isUserAdmin(user?.email),
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
