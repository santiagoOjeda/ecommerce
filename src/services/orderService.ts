import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { Order, OrderStatus } from '@/types';
import { collection, doc, getDocs, getDoc, setDoc, query, where, orderBy } from 'firebase/firestore';

const LOCAL_STORAGE_ORDERS_KEY = 'ecommerce_orders_cache';

function getLocalOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: Order[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Error saving orders', err);
  }
}

export const orderService = {
  async getOrders(tenantId: string, userId?: string): Promise<Order[]> {
    if (isFirebaseConfigured && db) {
      try {
        const ordersRef = collection(db, 'tenants', tenantId, 'orders');
        let q = query(ordersRef, orderBy('createdAt', 'desc'));
        if (userId) {
          q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
        }
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        }
      } catch (err) {
        console.warn('Firestore orders error, reading local fallback:', err);
      }
    }

    const local = getLocalOrders();
    return local.filter(o => o.tenantId === tenantId && (!userId || o.userId === userId));
  },

  async getOrderById(tenantId: string, orderId: string): Promise<Order | null> {
    if (isFirebaseConfigured && db) {
      try {
        const orderRef = doc(db, 'tenants', tenantId, 'orders', orderId);
        const snapshot = await getDoc(orderRef);
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() } as Order;
        }
      } catch (err) {
        console.warn('Firestore order by id error:', err);
      }
    }

    const local = getLocalOrders();
    return local.find(o => o.id === orderId && o.tenantId === tenantId) || null;
  },

  async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullOrder: Order = {
      ...order,
      id: orderId,
      createdAt: Date.now(),
      status: order.status || 'pending',
    };

    if (isFirebaseConfigured && db) {
      try {
        const orderRef = doc(db, 'tenants', order.tenantId, 'orders', orderId);
        await setDoc(orderRef, fullOrder);
      } catch (err) {
        console.error('Firestore create order error:', err);
      }
    }

    const local = getLocalOrders();
    local.unshift(fullOrder);
    saveLocalOrders(local);

    return fullOrder;
  },

  async updateOrderStatus(tenantId: string, orderId: string, status: OrderStatus, mpPaymentId?: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        const orderRef = doc(db, 'tenants', tenantId, 'orders', orderId);
        const updateData: Partial<Order> = { status, updatedAt: Date.now() };
        if (mpPaymentId) updateData.mpPaymentId = mpPaymentId;
        await setDoc(orderRef, updateData, { merge: true });
      } catch (err) {
        console.error('Firestore update order status error:', err);
      }
    }

    const local = getLocalOrders();
    const target = local.find(o => o.id === orderId && o.tenantId === tenantId);
    if (target) {
      target.status = status;
      if (mpPaymentId) target.mpPaymentId = mpPaymentId;
      target.updatedAt = Date.now();
      saveLocalOrders(local);
    }
  }
};
