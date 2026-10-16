import { create } from 'zustand';
import { Tenant } from '@/types';
import { DEFAULT_TENANT } from '@/data/initialData';
import { tenantService } from '@/services/tenantService';

interface TenantState {
  tenant: Tenant;
  isLoading: boolean;
  loadTenant: (tenantId: string) => Promise<void>;
  updateTenant: (updates: Partial<Tenant>) => Promise<void>;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  tenant: DEFAULT_TENANT,
  isLoading: false,

  loadTenant: async (tenantId: string) => {
    set({ isLoading: true });
    try {
      const data = await tenantService.getTenant(tenantId);
      set({ tenant: data, isLoading: false });
    } catch (err) {
      console.error('Failed loading tenant:', err);
      set({ isLoading: false });
    }
  },

  updateTenant: async (updates: Partial<Tenant>) => {
    const { tenant } = get();
    try {
      const updated = await tenantService.updateTenant(tenant.id, updates);
      set({ tenant: updated });
    } catch (err) {
      console.error('Failed updating tenant:', err);
    }
  },
}));
