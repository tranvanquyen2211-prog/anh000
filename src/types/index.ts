export type ShopType = 'RENTAL' | 'RETAIL' | 'FNB' | 'BEAUTY';

export interface Product {
  id: number | string;
  title: string;
  name?: string;
  price: number;
  shopType: ShopType;
  shopName: string;
  img: string;
  images?: string[];
  badge?: string;
  details?: string;
  stock?: number;
  salesCount?: number;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selected?: boolean;
}

export interface Order {
  id: string;
  user_id?: string;
  user_email?: string;
  user_phone?: string;
  user_name?: string;
  total_price: number;
  payment_method: 'wallet' | 'cash' | 'transfer';
  shipping_address?: string;
  receive_method?: 'shipping' | 'pickup';
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
  platform_fee_rate?: number;
  platform_fee_amount?: number;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string | number;
  product_name: string;
  quantity: number;
  price: number;
  img?: string;
}

export interface ChatMessage {
  id: string;
  user_id?: string;
  user_email?: string;
  user_phone?: string;
  user_name: string;
  content: string;
  created_at: string;
  sender_type: 'customer' | 'support' | 'shop';
}

export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  role: 'USER' | 'SHOP' | 'STAFF' | 'SUPER_ADMIN';
  isGuest?: boolean;
  avatar?: string;
  walletBalance?: number;
  coins?: number;
  status?: 'active' | 'locked';
  shopType?: 'RENTAL' | 'RETAIL' | 'FNB' | 'BEAUTY';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ThemeConfig {
  siteName: string;
  tagline: string;
  logoText: string;
  primaryColor: string;
  accentColor: string;
  themeMode: 'light' | 'dark' | 'glass';
  heroTitle: string;
  heroSubtitle: string;
  heroDiscount: string;
  heroImgUrl: string;
  promoBarText: string;
  walletDiscountRate: number;
  coinCashbackRate: number;
}
