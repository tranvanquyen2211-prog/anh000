import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginEmail: (email: string, pass: string) => Promise<boolean>;
  registerEmail: (email: string, pass: string, name?: string) => Promise<boolean>;
  loginGuest: (name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define Admin email addresses that receive SUPER_ADMIN privileges
const ADMIN_EMAILS = ['tranvanquyen2211@gmail.com', 'admin@tqstore.vn'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('tq_user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const { addToast } = useToast();

  const isEmailAdmin = (emailAddress?: string) => {
    if (!emailAddress) return false;
    return ADMIN_EMAILS.includes(emailAddress.trim().toLowerCase());
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userEmail = session.user.email || '';
          const profile: UserProfile = {
            id: session.user.id,
            email: userEmail,
            name: session.user.user_metadata?.full_name || (isEmailAdmin(userEmail) ? 'Super Admin' : userEmail.split('@')[0] || 'Khách hàng'),
            role: isEmailAdmin(userEmail) ? 'SUPER_ADMIN' : 'USER',
            isGuest: session.user.is_anonymous || false,
            avatar: session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(isEmailAdmin(userEmail) ? 'Admin' : (userEmail.split('@')[0] || 'Khách'))}&background=0F2C59&color=fff`,
            walletBalance: isEmailAdmin(userEmail) ? 99999999 : 1000000,
            coins: isEmailAdmin(userEmail) ? 99999 : 500
          };
          setUser(profile);
          localStorage.setItem('tq_user_profile', JSON.stringify(profile));
        }
      } catch (err) {
        console.error('Error fetching Supabase session:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userEmail = session.user.email || '';
        const profile: UserProfile = {
          id: session.user.id,
          email: userEmail,
          name: session.user.user_metadata?.full_name || (isEmailAdmin(userEmail) ? 'Super Admin' : userEmail.split('@')[0] || 'Khách hàng'),
          role: isEmailAdmin(userEmail) ? 'SUPER_ADMIN' : 'USER',
          isGuest: session.user.is_anonymous || false,
          avatar: session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(isEmailAdmin(userEmail) ? 'Admin' : (userEmail.split('@')[0] || 'Khách'))}&background=0F2C59&color=fff`,
          walletBalance: isEmailAdmin(userEmail) ? 99999999 : 1000000,
          coins: isEmailAdmin(userEmail) ? 99999 : 500
        };
        setUser(profile);
        localStorage.setItem('tq_user_profile', JSON.stringify(profile));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('tq_user_profile');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loginEmail = async (email: string, pass: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        addToast(`Lỗi đăng nhập: ${error.message}`, 'error');
        return false;
      }

      if (data.user) {
        const userEmail = data.user.email || email.trim();
        const profile: UserProfile = {
          id: data.user.id,
          email: userEmail,
          name: data.user.user_metadata?.full_name || (isEmailAdmin(userEmail) ? 'Super Admin' : userEmail.split('@')[0]),
          role: isEmailAdmin(userEmail) ? 'SUPER_ADMIN' : 'USER',
          isGuest: false,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(isEmailAdmin(userEmail) ? 'Admin' : userEmail.split('@')[0])}&background=0F2C59&color=fff`,
          walletBalance: isEmailAdmin(userEmail) ? 99999999 : 1000000,
          coins: isEmailAdmin(userEmail) ? 99999 : 500
        };
        setUser(profile);
        localStorage.setItem('tq_user_profile', JSON.stringify(profile));
        addToast(`Xin chào ${isEmailAdmin(userEmail) ? 'Super Admin Overlord' : profile.name}! Đăng nhập thành công.`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      addToast(`Lỗi kết nối Supabase Auth: ${err?.message || err}`, 'error');
      return false;
    }
  };

  const registerEmail = async (email: string, pass: string, name?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          data: {
            full_name: name || (isEmailAdmin(email) ? 'Super Admin' : email.split('@')[0])
          }
        }
      });

      if (error) {
        addToast(`Lỗi đăng ký: ${error.message}`, 'error');
        return false;
      }

      if (data.user) {
        addToast('Đăng ký tài khoản Admin thành công! Bạn có thể đăng nhập ngay.', 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      addToast(`Lỗi đăng ký: ${err?.message || err}`, 'error');
      return false;
    }
  };

  const loginGuest = async (customName?: string): Promise<boolean> => {
    try {
      const guestName = customName || `Khách ${Math.floor(1000 + Math.random() * 9000)}`;
      let guestId = `guest_${Date.now()}`;
      
      const { data, error } = await supabase.auth.signInAnonymously();
      if (!error && data.user) {
        guestId = data.user.id;
      }

      const profile: UserProfile = {
        id: guestId,
        email: `${guestId}@guest.tqstore.vn`,
        name: guestName,
        role: 'USER',
        isGuest: true,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(guestName)}&background=FF6B00&color=fff`,
        walletBalance: 500000,
        coins: 100
      };

      setUser(profile);
      localStorage.setItem('tq_user_profile', JSON.stringify(profile));
      addToast(`Đã đăng nhập dưới danh nghĩa Khách hàng: ${guestName}`, 'info');
      return true;
    } catch (err) {
      const guestName = customName || `Khách ${Math.floor(1000 + Math.random() * 9000)}`;
      const profile: UserProfile = {
        id: `guest_${Date.now()}`,
        email: `guest_${Date.now()}@guest.tqstore.vn`,
        name: guestName,
        role: 'USER',
        isGuest: true,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(guestName)}&background=FF6B00&color=fff`,
        walletBalance: 500000,
        coins: 100
      };
      setUser(profile);
      localStorage.setItem('tq_user_profile', JSON.stringify(profile));
      addToast(`Đã đăng nhập dưới danh nghĩa Khách: ${guestName}`, 'info');
      return true;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout warning:', e);
    }
    setUser(null);
    localStorage.removeItem('tq_user_profile');
    addToast('Đã đăng xuất tài khoản.', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginEmail, registerEmail, loginGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
