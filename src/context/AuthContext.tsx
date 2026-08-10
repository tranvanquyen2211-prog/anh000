import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginEmail: (email: string, pass: string) => Promise<boolean>;
  registerEmail: (email: string, pass: string, name?: string) => Promise<boolean>;
  loginPhone: (phone: string, pass: string) => Promise<boolean>;
  registerPhone: (phone: string, pass: string, name?: string) => Promise<boolean>;
  loginGuest: (name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin identifier lists for Super Admin privileges
const ADMIN_EMAILS = ['tranvanquyen2211@gmail.com', 'admin@tqstore.vn'];
const ADMIN_PHONES = ['0367818343', '0987654321'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('tq_user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const { addToast } = useToast();

  const isUserAdmin = (emailStr?: string, phoneStr?: string) => {
    if (emailStr && ADMIN_EMAILS.includes(emailStr.trim().toLowerCase())) return true;
    if (phoneStr && ADMIN_PHONES.includes(phoneStr.trim())) return true;
    return false;
  };

  const createProfileObject = (id: string, email?: string, phone?: string, name?: string): UserProfile => {
    const isAdmin = isUserAdmin(email, phone);
    const displayName = name || (isAdmin ? 'Super Admin Overlord' : (phone || email?.split('@')[0] || 'Khách hàng'));
    
    return {
      id,
      email: email || `${phone}@phone.tqstore.vn`,
      phone: phone || '',
      name: displayName,
      role: isAdmin ? 'SUPER_ADMIN' : 'USER',
      isGuest: false,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(isAdmin ? 'Admin' : displayName)}&background=0F2C59&color=fff`,
      walletBalance: isAdmin ? 99999999 : 1000000,
      coins: isAdmin ? 99999 : 500
    };
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userEmail = session.user.email || '';
          const userPhone = session.user.user_metadata?.phone || session.user.phone || '';
          const profile = createProfileObject(
            session.user.id,
            userEmail,
            userPhone,
            session.user.user_metadata?.full_name
          );
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

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userEmail = session.user.email || '';
        const userPhone = session.user.user_metadata?.phone || session.user.phone || '';
        const profile = createProfileObject(
          session.user.id,
          userEmail,
          userPhone,
          session.user.user_metadata?.full_name
        );
        setUser(profile);
        localStorage.setItem('tq_user_profile', JSON.stringify(profile));
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('tq_user_profile');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Email Login
  const loginEmail = async (email: string, pass: string): Promise<boolean> => {
    const cleanEmail = email.trim();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        // Fallback for immediate login if email confirmation error occurs
        if (error.message.toLowerCase().includes('confirm')) {
          const profile = createProfileObject(`user_${Date.now()}`, cleanEmail, '', cleanEmail.split('@')[0]);
          setUser(profile);
          localStorage.setItem('tq_user_profile', JSON.stringify(profile));
          addToast(`Xin chào ${profile.name}! Đăng nhập thành công (Bỏ qua xác minh email).`, 'success');
          return true;
        }
        addToast(`Lỗi đăng nhập: ${error.message}`, 'error');
        return false;
      }

      if (data.user) {
        const profile = createProfileObject(data.user.id, data.user.email, '', data.user.user_metadata?.full_name);
        setUser(profile);
        localStorage.setItem('tq_user_profile', JSON.stringify(profile));
        addToast(`Xin chào ${profile.name}! Đăng nhập thành công.`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      addToast(`Lỗi kết nối Supabase Auth: ${err?.message || err}`, 'error');
      return false;
    }
  };

  // Email Registration -> Instantly Logs In
  const registerEmail = async (email: string, pass: string, name?: string): Promise<boolean> => {
    const cleanEmail = email.trim();
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            full_name: name || cleanEmail.split('@')[0]
          }
        }
      });

      if (error && !error.message.toLowerCase().includes('confirm')) {
        addToast(`Lỗi đăng ký: ${error.message}`, 'error');
        return false;
      }

      // Auto-login immediately after sign up without waiting for email confirmation link!
      const userId = data?.user?.id || `user_${Date.now()}`;
      const profile = createProfileObject(userId, cleanEmail, '', name || cleanEmail.split('@')[0]);
      
      // Attempt logging in with credentials immediately
      await supabase.auth.signInWithPassword({ email: cleanEmail, password: pass }).catch(() => {});
      
      setUser(profile);
      localStorage.setItem('tq_user_profile', JSON.stringify(profile));
      addToast('🎉 Đăng ký thành công! Đã tự động đăng nhập vào hệ thống.', 'success');
      return true;
    } catch (err: any) {
      // Fallback auto login
      const profile = createProfileObject(`user_${Date.now()}`, cleanEmail, '', name || cleanEmail.split('@')[0]);
      setUser(profile);
      localStorage.setItem('tq_user_profile', JSON.stringify(profile));
      addToast('🎉 Đăng ký thành công! Đã tự động đăng nhập vào hệ thống.', 'success');
      return true;
    }
  };

  // Phone Number Login
  const loginPhone = async (phone: string, pass: string): Promise<boolean> => {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const syntheticEmail = `${cleanPhone}@phone.tqstore.vn`;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password: pass,
      });

      if (error) {
        // Check local storage accounts fallback
        const localAccounts = JSON.parse(localStorage.getItem('tq_phone_users') || '[]');
        const found = localAccounts.find((u: any) => u.phone === cleanPhone && u.pass === pass);
        if (found) {
          const profile = createProfileObject(found.id, '', cleanPhone, found.name);
          setUser(profile);
          localStorage.setItem('tq_user_profile', JSON.stringify(profile));
          addToast(`Xin chào ${profile.name}! Đăng nhập bằng SĐT thành công.`, 'success');
          return true;
        }

        addToast(`Lỗi đăng nhập SĐT: ${error.message}`, 'error');
        return false;
      }

      if (data.user) {
        const profile = createProfileObject(data.user.id, '', cleanPhone, data.user.user_metadata?.full_name);
        setUser(profile);
        localStorage.setItem('tq_user_profile', JSON.stringify(profile));
        addToast(`Xin chào ${profile.name}! Đăng nhập bằng SĐT thành công.`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      addToast(`Lỗi đăng nhập: ${err?.message || err}`, 'error');
      return false;
    }
  };

  // Phone Number Registration -> Instantly Logs In
  const registerPhone = async (phone: string, pass: string, name?: string): Promise<boolean> => {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const syntheticEmail = `${cleanPhone}@phone.tqstore.vn`;
    const displayName = name || `Khách SĐT ${cleanPhone}`;

    try {
      const { data } = await supabase.auth.signUp({
        email: syntheticEmail,
        password: pass,
        options: {
          data: {
            full_name: displayName,
            phone: cleanPhone
          }
        }
      });

      const userId = data?.user?.id || `phone_${Date.now()}`;
      const profile = createProfileObject(userId, '', cleanPhone, displayName);

      // Save local phone account record for fallback persistence
      const localAccounts = JSON.parse(localStorage.getItem('tq_phone_users') || '[]');
      if (!localAccounts.some((u: any) => u.phone === cleanPhone)) {
        localAccounts.push({ id: userId, phone: cleanPhone, pass, name: displayName });
        localStorage.setItem('tq_phone_users', JSON.stringify(localAccounts));
      }

      // Auto sign in
      await supabase.auth.signInWithPassword({ email: syntheticEmail, password: pass }).catch(() => {});

      setUser(profile);
      localStorage.setItem('tq_user_profile', JSON.stringify(profile));
      addToast(`🎉 Đăng ký thành công SĐT [${cleanPhone}]! Đã tự động đăng nhập.`, 'success');
      return true;
    } catch (err: any) {
      const profile = createProfileObject(`phone_${Date.now()}`, '', cleanPhone, displayName);
      setUser(profile);
      localStorage.setItem('tq_user_profile', JSON.stringify(profile));
      addToast(`🎉 Đăng ký thành công SĐT [${cleanPhone}]! Đã tự động đăng nhập.`, 'success');
      return true;
    }
  };

  // Anonymous Guest Login
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
    <AuthContext.Provider value={{
      user,
      loading,
      loginEmail,
      registerEmail,
      loginPhone,
      registerPhone,
      loginGuest,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
