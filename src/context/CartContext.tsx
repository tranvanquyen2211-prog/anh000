import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product, Order } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { supabase } from '../lib/supabase';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number | string) => void;
  updateQuantity: (productId: number | string, delta: number) => void;
  toggleItemSelection: (productId: number | string) => void;
  toggleSelectAll: (selected: boolean) => void;
  clearCart: () => void;
  totalItemsCount: number;
  selectedItemsCount: number;
  subtotalPrice: number;
  checkout: (paymentMethod: 'wallet' | 'cash' | 'transfer', address: string) => Promise<boolean>;
  orders: Order[];
  fetchUserOrders: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`tq_cart_${user.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`tq_cart_${user.id}`);
      if (saved) setCart(JSON.parse(saved));
      else setCart([]);
      fetchUserOrders();
    } else {
      setCart([]);
      setOrders([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`tq_cart_${user.id}`, JSON.stringify(cart));
    }
  }, [cart, user?.id]);

  const addToCart = (product: Product) => {
    if (!user) {
      addToast('Vui lòng đăng nhập hoặc đăng nhập Khách để thêm sản phẩm!', 'info');
      return;
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        updated[existingIndex].selected = true;
        return updated;
      }
      return [...prev, { ...product, quantity: 1, selected: true }];
    });

    addToast(`Đã thêm "${product.title}" vào giỏ hàng!`, 'success');
  };

  const removeFromCart = (productId: number | string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    addToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  };

  const updateQuantity = (productId: number | string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const toggleItemSelection = (productId: number | string) => {
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, selected: !item.selected } : item
    ));
  };

  const toggleSelectAll = (selected: boolean) => {
    setCart(prev => prev.map(item => ({ ...item, selected })));
  };

  const clearCart = () => {
    setCart([]);
  };

  const selectedCartItems = cart.filter(item => item.selected !== false);
  const totalItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const selectedItemsCount = selectedCartItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalPrice = selectedCartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const fetchUserOrders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data as Order[]);
      } else {
        const local = localStorage.getItem(`tq_orders_${user.id}`);
        if (local) setOrders(JSON.parse(local));
      }
    } catch (e) {
      const local = localStorage.getItem(`tq_orders_${user.id}`);
      if (local) setOrders(JSON.parse(local));
    }
  };

  const checkout = async (paymentMethod: 'wallet' | 'cash' | 'transfer', address: string): Promise<boolean> => {
    if (!user) {
      addToast('Bạn cần đăng nhập để thực hiện Đặt hàng!', 'error');
      return false;
    }

    if (selectedCartItems.length === 0) {
      addToast('Vui lòng chọn sản phẩm trong giỏ để đặt hàng!', 'error');
      return false;
    }

    const orderId = `ORD-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      user_id: user.id,
      user_email: user.email,
      user_name: user.name,
      total_price: subtotalPrice,
      payment_method: paymentMethod,
      shipping_address: address,
      status: 'completed',
      created_at: new Date().toISOString(),
      items: selectedCartItems.map(item => ({
        product_id: item.id,
        product_name: item.title,
        quantity: item.quantity,
        price: item.price,
        img: item.img
      }))
    };

    try {
      const { error: orderError } = await supabase.from('orders').insert([
        {
          id: orderId,
          user_id: user.id,
          user_email: user.email,
          total_price: subtotalPrice,
          payment_method: paymentMethod,
          shipping_address: address,
          status: 'completed'
        }
      ]);

      if (!orderError) {
        const orderItemsPayload = selectedCartItems.map(item => ({
          order_id: orderId,
          product_name: item.title,
          quantity: item.quantity,
          price: item.price
        }));
        await supabase.from('order_items').insert(orderItemsPayload);
      }
    } catch (err) {
      console.warn('Supabase DB placement fallback active:', err);
    }

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem(`tq_orders_${user.id}`, JSON.stringify(updatedOrders));

    setCart(prev => prev.filter(i => i.selected === false));

    addToast(`🎉 Đặt hàng thành công! Mã đơn #${orderId}. Tổng tiền: ${subtotalPrice.toLocaleString('vi-VN')} VNĐ.`, 'success');
    return true;
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleItemSelection,
      toggleSelectAll,
      clearCart,
      totalItemsCount,
      selectedItemsCount,
      subtotalPrice,
      checkout,
      orders,
      fetchUserOrders
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
