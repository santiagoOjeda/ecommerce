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
  GoogleAuthProvider 
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
          // Fetch role from Firestore
          let role: UserRole = 'customer';
          try {
            const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
            if (userDoc.exists()) {
              role = userDoc.data().role || 'customer';
            }
          } catch (err) {
            console.warn('Could not read user profile role', err);
          }

          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuario',
            photoURL: fbUser.photoURL,
            role,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Offline / Local development fallback
      try {
        const saved = localStorage.getItem(DEMO_USER_KEY);
        if (saved) {
          setUser(JSON.parse(saved));
        } else {
          // Default mock user with customer role
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
      await signInWithEmailAndPassword(auth, email, pass);
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
      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name,
        role: 'customer',
      };
      if (db) {
        await setDoc(doc(db, 'users', cred.user.uid), profile);
      }
      setUser(profile);
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
      await signInWithPopup(auth, provider);
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
