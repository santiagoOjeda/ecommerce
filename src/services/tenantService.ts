import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { Tenant } from '@/types';
import { DEFAULT_TENANT } from '@/data/initialData';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const LOCAL_STORAGE_TENANT_KEY = 'ecommerce_tenant_cache';

export const tenantService = {
  async getTenant(tenantId: string): Promise<Tenant> {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`${LOCAL_STORAGE_TENANT_KEY}_${tenantId}`);
        if (cached) return JSON.parse(cached);
      } catch (err) {
        console.warn('Error reading cached tenant', err);
      }
    }

    if (isFirebaseConfigured && db) {
      try {
        const tenantRef = doc(db, 'tenants', tenantId);
        const snapshot = await getDoc(tenantRef);
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() } as Tenant;
          if (typeof window !== 'undefined') {
            localStorage.setItem(`${LOCAL_STORAGE_TENANT_KEY}_${tenantId}`, JSON.stringify(data));
          }
          return data;
        }
      } catch (err) {
        console.warn('Firestore tenant read error, using default tenant:', err);
      }
    }

    return { ...DEFAULT_TENANT, id: tenantId };
  },

  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant> {
    const current = await this.getTenant(tenantId);
    const updated: Tenant = {
      ...current,
      ...updates,
      id: tenantId,
    };

    if (isFirebaseConfigured && db) {
      try {
        const tenantRef = doc(db, 'tenants', tenantId);
        await setDoc(tenantRef, updated, { merge: true });
      } catch (err) {
        console.error('Firestore tenant update error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_TENANT_KEY}_${tenantId}`, JSON.stringify(updated));
    }

    return updated;
  }
};
