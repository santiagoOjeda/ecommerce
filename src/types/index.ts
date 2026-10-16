export type UserRole = 'admin' | 'customer';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  primaryColor: string;
  description?: string;
  contactEmail?: string;
  currency: string;
  bannerUrl?: string;
}

export interface Product {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  isActive: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  notes?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: UserRole;
  tenantId?: string;
  shippingAddress?: ShippingAddress;
}

export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'in_process' | 'delivered';

export interface Order {
  id: string;
  tenantId: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  items: {
    productId: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  mpPreferenceId?: string;
  mpPaymentId?: string;
  shippingAddress?: ShippingAddress;
  createdAt: number;
  updatedAt?: number;
}
