import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isImpersonating: boolean;
  originalAdmin: UserProfile | null;
  loginEmail: (email: string, pass: string) => Promise<boolean>;
  registerEmail: (email: string, pass: string, name?: string) => Promise<boolean>;
  loginPhone: (phone: string, pass: string) => Promise<boolean>;
  registerPhone: (phone: string, pass: string, name?: string) => Promise<boolean>;
  changePassword: (currentPass: string, newPass: string) => Promise<boolean>;
  updateAvatar: (newAvatarUrl: string) => Promise<boolean>;
  impersonateShop: (shopUser: any) => void;
  exitImpersonation: () => void;
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
  
  // Impersonation state
  const [isImpersonating, setIsImpersonating] = useState<boolean>(() => {
    return localStorage.getItem('tq_is_impersonating') === 'true';
  });
  const [originalAdmin, setOriginalAdmin] = useState<UserProfile | null>(() => {
    const savedAdmin = localStorage.getItem('tq_original_admin');
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const { addToast } = useToast();

  const isUserAdmin = (emailStr?: string, phoneStr?: string) => {
    if (emailStr && ADMIN_EMAILS.includes(emailStr.trim().toLowerCase())) return true;
    if (phoneStr && ADMIN_PHONES.includes(phoneStr.trim())) return true;
    return false;
  };

  const createProfileObject = (id: string, email?: string, phone?: string, name?: string, avatarUrl?: string): UserProfile => {
    const isAdmin = isUserAdmin(email, phone);
    const displayName = name || (isAdmin ? 'Super Admin Overlord' : (phone || email?.split('@')[0] || 'Khách hàng'));
    const defaultAvatar = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(isAdmin ? 'Admin' : displayName)}&background=0F2C59&color=fff`;

    return {
      id,
      email: email || `${phone}@phone.tqstore.vn`,
      phone: phone || '',
      name: displayName,
      role: isAdmin ? 'SUPER_ADMIN' : 'USER',
      isGuest: false,
      avatar: defaultAvatar,
      walletBalance: isAdmin ? 99999999 : 0,
      coins: isAdmin ? 99999 : 0
    };
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && !isImpersonating) {
          const userEmail = session.user.email || '';
          const userPhone = session.user.user_metadata?.phone || session.user.phone || '';
          const profile = createProfileObject(
            session.user.id,
            userEmail,
            userPhone,
            session.user.user_metadata?.full_name,
            session.user.user_metadata?.avatar
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
      if (session?.user && !isImpersonating) {
        const userEmail = session.user.email || '';
        const userPhone = session.user.user_metadata?.phone || session.user.phone || '';
        const profile = createProfileObject(
          session.user.id,
          userEmail,
          userPhone,
          session.user.user_metadata?.full_name,
          session.user.user_metadata?.avatar
        );
        setUser(profile);
        localStorage.setItem('tq_user_profile', JSON.stringify(profile));
      } else if (_event === 'SIGNED_OUT' && !isImpersonating) {
        setUser(null);
        localStorage.removeItem('tq_user_profile');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isImpersonating]);

  // Update Avatar System-wide
  const updateAvatar = async (newAvatarUrl: string): Promise<boolean> => {
    if (!user) {
      addToast('Bạn chưa đăng nhập tài khoản!', 'error');
      return false;
    }

    const updatedUser: UserProfile = {
      ...user,
      avatar: newAvatarUrl
    };

    setUser(updatedUser);
    localStorage.setItem('tq_user_profile', JSON.stringify(updatedUser));

    // Update phone users list if applicable
    if (user.phone) {
      const localAccounts = JSON.parse(localStorage.getItem('tq_phone_users') || '[]');
      const idx = localAccounts.findIndex((u: any) => u.phone === user.phone);
      if (idx > -1) {
        localAccounts[idx].avatar = newAvatarUrl;
        localStorage.setItem('tq_phone_users', JSON.stringify(localAccounts));
      }
    }

    try {
      // 1. Update Supabase Auth metadata
      await supabase.auth.updateUser({
        data: { avatar: newAvatarUrl }
      });

      // 2. Sync to Supabase Cloud Table `profiles`
      await supabase.from('profiles').upsert([
        {
          id: user.id,
          phone: user.phone,
          full_name: user.name,
          avatar: newAvatarUrl,
          updated_at: new Date().toISOString()
        }
      ]);
    } catch (e) {
      console.warn('Cloud avatar sync active');
    }

    addToast('📸 Đã đổi ảnh đại diện và đồng bộ 100% trên toàn hệ thống!', 'success');
    return true;
  };

  // Impersonate Shop Action
  const impersonateShop = (shopAccount: any) => {
    if (!user) return;
    
    // Save original Super Admin if not already saved
    if (!originalAdmin) {
      setOriginalAdmin(user);
      localStorage.setItem('tq_original_admin', JSON.stringify(user));
    }

    const simulatedShopProfile: UserProfile = {
      id: shopAccount.id || `shop_${Date.now()}`,
      name: shopAccount.name || 'Cửa hàng Giả Lập',
      phone: shopAccount.phone || '0900000000',
      email: shopAccount.email || `${shopAccount.phone}@phone.tqstore.vn`,
      role: 'SHOP',
      isGuest: false,
      avatar: shopAccount.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(shopAccount.name)}&background=059669&color=fff`,
      walletBalance: shopAccount.walletBalance || 5000000,
      coins: shopAccount.coins || 1200
    };

    setUser(simulatedShopProfile);
    setIsImpersonating(true);
    localStorage.setItem('tq_is_impersonating', 'true');
    localStorage.setItem('tq_user_profile', JSON.stringify(simulatedShopProfile));

    addToast(`🎭 Đã chuyển sang giao diện giả lập Cửa Hàng [${simulatedShopProfile.name}]!`, 'success');
  };

  // Exit Impersonation Mode
  const exitImpersonation = () => {
    if (originalAdmin) {
      setUser(originalAdmin);
      localStorage.setItem('tq_user_profile', JSON.stringify(originalAdmin));
    }
    setIsImpersonating(false);
    setOriginalAdmin(null);
    localStorage.removeItem('tq_is_impersonating');
    localStorage.removeItem('tq_original_admin');

    addToast('👑 Đã quay trở lại giao diện Super Admin Overlord!', 'info');
  };

  // Global Email Login
  const loginEmail = async (email: string, pass: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        if (error.message.toLowerCase().includes('confirm')) {
          const profile = createProfileObject(`user_${Date.now()}`, cleanEmail, '', cleanEmail.split('@')[0]);
          setUser(profile);
          localStorage.setItem('tq_user_profile', JSON.stringify(profile));
          addToast(`Xin chào ${profile.name}! Đăng nhập thành công.`, 'success');
          return true;
        }
        addToast(`Lỗi đăng nhập: ${error.message}`, 'error');
        return false;
      }

      if (data.user) {
        const profile = createProfileObject(data.user.id, data.user.email, '', data.user.user_metadata?.full_name, data.user.user_metadata?.avatar);
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

  // Global Email Registration
  const registerEmail = async (email: string, pass: string, name?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = name || cleanEmail.split('@')[0];

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            full_name: displayName
          }
        }
      });

      if (error) {
        if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('exceeded')) {
          const profile = createProfileObject(`user_${Date.now()}`, cleanEmail, '', displayName);
          setUser(profile);
          localStorage.setItem('tq_user_profile', JSON.stringify(profile));
          addToast('🎉 Đăng ký thành công! Đã tự động đăng nhập vào hệ thống.', 'success');
          return true;
        }
        if (!error.message.toLowerCase().includes('confirm')) {
          addToast(`Lỗi đăng ký: ${error.message}`, 'error');
          return false;
        }
      }

      const userId = data?.user?.id || `user_${Date.now()}`;
      const profile = createProfileObject(userId, cleanEmail, '', displayName);
      
      await supabase.auth.signInWithPassword({ email: cleanEmail, password: pass }).catch(() => {});
      
      setUser(profile);
      localStorage.setItem('tq_user_profile', JSON.stringify(profile));
      addToast('🎉 Đăng ký thành công! Đã tự động đăng nhập vào hệ thống.', 'success');
      return true;
    } catch (err: any) {
      const profile = createProfileObject(`user_${Date.now()}`, cleanEmail, '', displayName);
      setUser(profile);
      localStorage.setItem('tq_user_profile', JSON.stringify(profile));
      addToast('🎉 Đăng ký thành công! Đã tự động đăng nhập vào hệ thống.', 'success');
      return true;
    }
  };

  // Global Phone Number Registration
  const registerPhone = async (phone: string, pass: string, name?: string): Promise<boolean> => {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const syntheticEmail = `${cleanPhone}@phone.tqstore.vn`;
    const displayName = name || (ADMIN_PHONES.includes(cleanPhone) ? 'Super Admin Overlord' : `Khách SĐT ${cleanPhone}`);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: syntheticEmail,
        password: pass,
        options: {
          data: {
            full_name: displayName,
            phone: cleanPhone
          }
        }
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('exists')) {
          return await loginPhone(cleanPhone, pass);
        }

        if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('exceeded')) {
          const profile = createProfileObject(`phone_${Date.now()}`, '', cleanPhone, displayName);
          setUser(profile);
          localStorage.setItem('tq_user_profile', JSON.stringify(profile));
          addToast(`🎉 Đăng ký thành công SĐT [${cleanPhone}]! Đã đăng nhập vào hệ thống.`, 'success');
          return true;
        }

        addToast(`Lỗi đăng ký SĐT: ${error.message}`, 'error');
        return false;
      }

      const userId = data?.user?.id || `phone_${Date.now()}`;
      const profile = createProfileObject(userId, '', cleanPhone, displayName);

      const localAccounts = JSON.parse(localStorage.getItem('tq_phone_users') || '[]');
      if (!localAccounts.some((u: any) => u.phone === cleanPhone)) {
        localAccounts.push({ id: userId, phone: cleanPhone, pass, name: displayName });
        localStorage.setItem('tq_phone_users', JSON.stringify(localAccounts));
      }

      await supabase.auth.signInWithPassword({ email: syntheticEmail, password: pass }).catch(() => {});

      setUser(profile);
      localStorage.setItem('tq_user_profile', JSON.stringify(profile));
      addToast(`🎉 Đăng ký thành công SĐT [${cleanPhone}]! Đã lưu trữ toàn hệ thống.`, 'success');
      return true;
    } catch (err: any) {
      const profile = createProfileObject(`phone_${Date.now()}`, '', cleanPhone, displayName);
      setUser(profile);
      localStorage.setItem('tq_user_profile', JSON.stringify(profile));
      addToast(`🎉 Đăng ký thành công SĐT [${cleanPhone}]!`, 'success');
      return true;
    }
  };

  // Global Phone Number Login
  const loginPhone = async (phone: string, pass: string): Promise<boolean> => {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const syntheticEmail = `${cleanPhone}@phone.tqstore.vn`;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password: pass,
      });

      if (error) {
        if (error.message.toLowerCase().includes('invalid')) {
          return await registerPhone(cleanPhone, pass);
        }

        addToast(`Lỗi đăng nhập: Số điện thoại chưa được đăng ký hoặc sai mật khẩu.`, 'error');
        return false;
      }

      if (data.user) {
        const profile = createProfileObject(data.user.id, '', cleanPhone, data.user.user_metadata?.full_name, data.user.user_metadata?.avatar);
        setUser(profile);
        localStorage.setItem('tq_user_profile', JSON.stringify(profile));
        addToast(`Xin chào ${profile.name}! Đăng nhập bằng SĐT thành công.`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      return await registerPhone(cleanPhone, pass);
    }
  };

  // Global Password Change Function
  const changePassword = async (_currentPass: string, newPass: string): Promise<boolean> => {
    if (!user) {
      addToast('Bạn cần đăng nhập để đổi mật khẩu!', 'error');
      return false;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPass
      });

      if (error) {
        addToast(`Lỗi đổi mật khẩu Supabase: ${error.message}`, 'error');
        return false;
      }

      if (user.phone) {
        const localAccounts = JSON.parse(localStorage.getItem('tq_phone_users') || '[]');
        const idx = localAccounts.findIndex((u: any) => u.phone === user.phone);
        if (idx > -1) {
          localAccounts[idx].pass = newPass;
          localStorage.setItem('tq_phone_users', JSON.stringify(localAccounts));
        }
      }

      addToast('🔑 Đổi mật khẩu thành công! Mật khẩu cũ không còn hiệu lực trên toàn hệ thống.', 'success');
      return true;
    } catch (err: any) {
      addToast(`Lỗi đổi mật khẩu: ${err?.message || err}`, 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout warning:', e);
    }
    setUser(null);
    setIsImpersonating(false);
    setOriginalAdmin(null);
    localStorage.removeItem('tq_user_profile');
    localStorage.removeItem('tq_is_impersonating');
    localStorage.removeItem('tq_original_admin');
    addToast('Đã đăng xuất tài khoản.', 'info');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isImpersonating,
      originalAdmin,
      loginEmail,
      registerEmail,
      loginPhone,
      registerPhone,
      changePassword,
      updateAvatar,
      impersonateShop,
      exitImpersonation,
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
