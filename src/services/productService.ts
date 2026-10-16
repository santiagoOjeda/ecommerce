import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/initialData';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'ecommerce_products_cache';

function getLocalCache(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function saveLocalCache(products: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Failed saving to localStorage', err);
  }
}

export const productService = {
  async getProducts(tenantId: string): Promise<Product[]> {
    if (isFirebaseConfigured && db) {
      try {
        const productsRef = collection(db, 'tenants', tenantId, 'products');
        const q = query(productsRef, where('isActive', '==', true));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        }
      } catch (err) {
        console.warn('Firestore read error, falling back to local cache:', err);
      }
    }
    const local = getLocalCache();
    return local.filter(p => p.tenantId === tenantId && p.isActive);
  },

  async getAllProductsForAdmin(tenantId: string): Promise<Product[]> {
    if (isFirebaseConfigured && db) {
      try {
        const productsRef = collection(db, 'tenants', tenantId, 'products');
        const snapshot = await getDocs(productsRef);
        if (!snapshot.empty) {
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        }
      } catch (err) {
        console.warn('Firestore admin read error:', err);
      }
    }
    const local = getLocalCache();
    return local.filter(p => p.tenantId === tenantId);
  },

  async getProductById(tenantId: string, id: string): Promise<Product | null> {
    if (isFirebaseConfigured && db) {
      try {
        const productRef = doc(db, 'tenants', tenantId, 'products', id);
        const snapshot = await getDoc(productRef);
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() } as Product;
        }
      } catch (err) {
        console.warn('Firestore single product read error:', err);
      }
    }
    const local = getLocalCache();
    return local.find(p => p.id === id && p.tenantId === tenantId) || null;
  },

  async saveProduct(tenantId: string, product: Partial<Product> & { id?: string }): Promise<Product> {
    const isNew = !product.id;
    const productId = product.id || `prod-${Date.now()}`;
    const fullProduct: Product = {
      id: productId,
      tenantId,
      title: product.title || 'Producto sin título',
      description: product.description || '',
      price: Number(product.price) || 0,
      images: product.images && product.images.length ? product.images : [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
      ],
      category: product.category || 'General',
      stock: Number(product.stock) || 0,
      isActive: product.isActive ?? true,
      createdAt: product.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (isFirebaseConfigured && db) {
      try {
        const productRef = doc(db, 'tenants', tenantId, 'products', productId);
        const cleanProduct = Object.fromEntries(
          Object.entries(fullProduct).filter(([_, v]) => v !== undefined)
        );
        await setDoc(productRef, cleanProduct, { merge: true });
      } catch (err) {
        console.error('Firestore save product error:', err);
      }
    }

    // Always update local cache for instant UI feedback
    const local = getLocalCache();
    const index = local.findIndex(p => p.id === productId);
    if (index >= 0) {
      local[index] = fullProduct;
    } else {
      local.unshift(fullProduct);
    }
    saveLocalCache(local);

    return fullProduct;
  },

  async deleteProduct(tenantId: string, id: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        const productRef = doc(db, 'tenants', tenantId, 'products', id);
        await deleteDoc(productRef);
      } catch (err) {
        console.error('Firestore delete product error:', err);
      }
    }

    const local = getLocalCache();
    const filtered = local.filter(p => p.id !== id);
    saveLocalCache(filtered);
  }
};
