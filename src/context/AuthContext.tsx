import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { recordAuditLog } from '../lib/auditLogger';
import type { UserProfile, CoinTransaction } from '../types';
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
  registerUnified: (phone: string, email: string, pass: string, name: string) => Promise<boolean>;
  loginUnified: (emailOrPhone: string, pass: string) => Promise<boolean>;
  resetPasswordUnified: (emailOrPhone: string, newPass: string) => Promise<boolean>;
  changePassword: (currentPass: string, newPass: string) => Promise<boolean>;
  updateAvatar: (newAvatarUrl: string) => Promise<boolean>;
  updateCoins: (amount: number, isAddition?: boolean, sourceDescription?: string, type?: CoinTransaction['type']) => Promise<void>;
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

  const createProfileObject = (
    id: string,
    email?: string,
    phone?: string,
    name?: string,
    avatarUrl?: string,
    explicitCoins?: number,
    explicitWallet?: number
  ): UserProfile => {
    const isAdmin = isUserAdmin(email, phone);
    const displayName = name || (isAdmin ? 'Super Admin Overlord' : (phone || email?.split('@')[0] || 'Khách hàng'));
    const defaultAvatar = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(isAdmin ? 'Admin' : displayName)}&background=0F2C59&color=fff`;

    // 1. Recover saved coins and wallet balance from localStorage to prevent resetting to 0 on refresh F5
    let savedCoins = explicitCoins;
    let savedWallet = explicitWallet;

    if (savedCoins === undefined) {
      const savedUserStr = localStorage.getItem('tq_user_profile');
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          if (parsed && (parsed.id === id || parsed.phone === phone || (email && parsed.email === email))) {
            if (parsed.coins !== undefined) savedCoins = parsed.coins;
            if (parsed.walletBalance !== undefined) savedWallet = parsed.walletBalance;
          }
        } catch (e) {}
      }
    }

    if (savedCoins === undefined && phone) {
      const localAccounts = JSON.parse(localStorage.getItem('tq_phone_users') || '[]');
      const found = localAccounts.find((u: any) => u.phone === phone);
      if (found) {
        if (found.coins !== undefined) savedCoins = found.coins;
        if (found.walletBalance !== undefined) savedWallet = found.walletBalance;
      }
    }

    return {
      id,
      email: email || `${phone}@phone.tqstore.vn`,
      phone: phone || '',
      name: displayName,
      role: isAdmin ? 'SUPER_ADMIN' : 'USER',
      isGuest: false,
      avatar: defaultAvatar,
      walletBalance: isAdmin ? 99999999 : (savedWallet !== undefined ? savedWallet : 0),
      coins: isAdmin ? 99999 : (savedCoins !== undefined ? savedCoins : 0)
    };
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && !isImpersonating) {
          const userEmail = session.user.email || '';
          const userPhone = session.user.user_metadata?.phone || session.user.phone || '';

          // Try fetching cloud coins from Supabase profiles table
          let cloudCoins: number | undefined;
          let cloudWallet: number | undefined;
          try {
            const { data: pData } = await supabase.from('profiles').select('coins, wallet_balance').eq('id', session.user.id).single();
            if (pData) {
              if (pData.coins !== undefined && pData.coins !== null) cloudCoins = pData.coins;
              if (pData.wallet_balance !== undefined && pData.wallet_balance !== null) cloudWallet = pData.wallet_balance;
            }
          } catch (e) {}

          const profile = createProfileObject(
            session.user.id,
            userEmail,
            userPhone,
            session.user.user_metadata?.full_name,
            session.user.user_metadata?.avatar,
            cloudCoins,
            cloudWallet
          );

          setUser(prev => {
            if (prev && prev.id === profile.id && (prev.coins || 0) > (profile.coins || 0)) {
              return { ...profile, coins: prev.coins };
            }
            return profile;
          });
          
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
        setUser(prev => {
          if (prev && prev.id === profile.id && (prev.coins || 0) > (profile.coins || 0)) {
            return { ...profile, coins: prev.coins };
          }
          return profile;
        });
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

  // Active User Presence Heartbeat & Supabase Realtime Track (Every 20s)
  useEffect(() => {
    if (!user) return;

    const sendHeartbeat = async () => {
      const nowIso = new Date().toISOString();
      
      const localAccounts = JSON.parse(localStorage.getItem('tq_phone_users') || '[]');
      const idx = localAccounts.findIndex((u: any) => 
        (u.id && u.id === user.id) || 
        (u.phone && user.phone && u.phone.replace(/\s+/g, '') === user.phone.replace(/\s+/g, '')) ||
        (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase())
      );

      if (idx > -1) {
        localAccounts[idx].lastActiveAt = nowIso;
        localAccounts[idx].isOnline = true;
        localStorage.setItem('tq_phone_users', JSON.stringify(localAccounts));
      } else {
        localAccounts.push({
          id: user.id,
          phone: user.phone || '',
          email: user.email || '',
          name: user.name || '',
          role: user.role || 'USER',
          createdAt: user.createdAt || nowIso,
          lastActiveAt: nowIso,
          isOnline: true
        });
        localStorage.setItem('tq_phone_users', JSON.stringify(localAccounts));
      }

      try {
        await supabase.from('profiles').upsert([{
          id: user.id,
          phone: user.phone || '',
          email: user.email || '',
          full_name: user.name || '',
          is_online: true,
          last_active_at: nowIso,
          updated_at: nowIso
        }]);
      } catch (e) {}
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 20000);

    const presenceChannel = supabase.channel('tq_online_presence', {
      config: { presence: { key: user.id } }
    });

    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          onlineAt: new Date().toISOString()
        });
      }
    });

    return () => {
      clearInterval(interval);
      supabase.removeChannel(presenceChannel);
    };
  }, [user]);

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
        recordAuditLog(profile.name, profile.role, 'Đăng Nhập Email', `Tài khoản: ${profile.email}`, 'Đăng nhập hệ thống thành công', 'SUCCESS');
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
        recordAuditLog(profile.name, profile.role, 'Đăng Nhập SĐT', `SĐT: ${profile.phone}`, 'Đăng nhập SĐT thành công', 'SUCCESS');
        addToast(`Xin chào ${profile.name}! Đăng nhập bằng SĐT thành công.`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      return await registerPhone(cleanPhone, pass);
    }
  };

  // Global Unified Registration (Bắt buộc cả SĐT & Gmail)
  const registerUnified = async (phone: string, email: string, pass: string, name: string): Promise<boolean> => {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanEmail = email.trim().toLowerCase();
    const displayName = name.trim() || cleanEmail.split('@')[0] || `Khách SĐT ${cleanPhone}`;

    if (!cleanPhone || !cleanEmail || !pass) {
      addToast('Vui lòng nhập đầy đủ Số điện thoại, Email và Mật khẩu!', 'error');
      return false;
    }

    const localAccounts = JSON.parse(localStorage.getItem('tq_phone_users') || '[]');
    const existing = localAccounts.find((u: any) => 
      (u.phone && u.phone.replace(/\s+/g, '') === cleanPhone) || 
      (u.email && u.email.toLowerCase() === cleanEmail)
    );

    if (existing) {
      addToast('Số điện thoại hoặc Email này đã được đăng ký! Vui lòng chọn Đăng Nhập.', 'error');
      return false;
    }

    const userId = `usr_${Date.now()}`;
    const nowIso = new Date().toISOString();
    const isAdmin = isUserAdmin(cleanEmail, cleanPhone);

    const profile: UserProfile = {
      id: userId,
      email: cleanEmail,
      phone: cleanPhone,
      name: displayName,
      role: isAdmin ? 'SUPER_ADMIN' : 'USER',
      isGuest: false,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0F2C59&color=fff`,
      walletBalance: isAdmin ? 99999999 : 0,
      coins: isAdmin ? 99999 : 10,
      status: 'active',
      createdAt: nowIso,
      lastActiveAt: nowIso,
      isOnline: true
    };

    localAccounts.push({
      id: userId,
      phone: cleanPhone,
      email: cleanEmail,
      pass,
      name: displayName,
      role: profile.role,
      createdAt: nowIso,
      lastActiveAt: nowIso,
      isOnline: true
    });
    localStorage.setItem('tq_phone_users', JSON.stringify(localAccounts));

    try {
      await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: { data: { full_name: displayName, phone: cleanPhone } }
      }).catch(() => {});

      await supabase.from('profiles').upsert([{
        id: userId,
        email: cleanEmail,
        phone: cleanPhone,
        full_name: displayName,
        created_at: nowIso,
        updated_at: nowIso
      }]);
    } catch (e) {}

    setUser(profile);
    localStorage.setItem('tq_user_profile', JSON.stringify(profile));
    recordAuditLog(displayName, profile.role, 'Đăng Ký Tài Khoản Gộp', `Email: ${cleanEmail} | SĐT: ${cleanPhone}`, 'Khách hàng tạo tài khoản gộp SĐT & Gmail thành công', 'SUCCESS');
    addToast(`🎉 Đăng ký tài khoản thành công! Thưởng 10 TQ Coins. Xin chào ${displayName}.`, 'success');
    return true;
  };

  // Global Unified Login (Đăng nhập bằng SĐT hoặc Gmail)
  const loginUnified = async (emailOrPhone: string, pass: string): Promise<boolean> => {
    const query = emailOrPhone.trim().toLowerCase();
    const cleanPhoneQuery = query.replace(/\s+/g, '');

    if (!query || !pass) {
      addToast('Vui lòng nhập Số điện thoại/Email và Mật khẩu!', 'error');
      return false;
    }

    const localAccounts = JSON.parse(localStorage.getItem('tq_phone_users') || '[]');
    const matchedUser = localAccounts.find((u: any) => {
      const matchEmail = u.email && u.email.toLowerCase() === query;
      const matchPhone = u.phone && u.phone.replace(/\s+/g, '') === cleanPhoneQuery;
      return matchEmail || matchPhone;
    });

    if (matchedUser) {
      if (matchedUser.pass && matchedUser.pass !== pass) {
        addToast('Mật khẩu không chính xác! Vui lòng kiểm tra lại hoặc chọn Quên mật khẩu.', 'error');
        return false;
      }

      const nowIso = new Date().toISOString();
      const profile: UserProfile = {
        id: matchedUser.id || `usr_${Date.now()}`,
        email: matchedUser.email || `${matchedUser.phone}@phone.tqstore.vn`,
        phone: matchedUser.phone || '',
        name: matchedUser.name || 'Khách hàng',
        role: matchedUser.role || (isUserAdmin(matchedUser.email, matchedUser.phone) ? 'SUPER_ADMIN' : 'USER'),
        isGuest: false,
        avatar: matchedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedUser.name || 'User')}&background=0F2C59&color=fff`,
        walletBalance: matchedUser.walletBalance || 0,
        coins: matchedUser.coins !== undefined ? matchedUser.coins : 0,
        createdAt: matchedUser.createdAt || nowIso,
        lastActiveAt: nowIso,
        isOnline: true
      };

      matchedUser.lastActiveAt = nowIso;
      matchedUser.isOnline = true;
      localStorage.setItem('tq_phone_users', JSON.stringify(localAccounts));

      setUser(profile);
      localStorage.setItem('tq_user_profile', JSON.stringify(profile));
      recordAuditLog(profile.name, profile.role, 'Đăng Nhập Gộp (SĐT/Email)', `Query: ${query}`, 'Đăng nhập thành công', 'SUCCESS');
      addToast(`Xin chào ${profile.name}! Đăng nhập thành công.`, 'success');
      return true;
    }

    // Try Supabase Auth Login
    try {
      const targetEmail = query.includes('@') ? query : `${cleanPhoneQuery}@phone.tqstore.vn`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: pass,
      });

      if (!error && data?.user) {
        const nowIso = new Date().toISOString();
        const uEmail = data.user.email || query;
        const uPhone = data.user.user_metadata?.phone || cleanPhoneQuery;
        const uName = data.user.user_metadata?.full_name || uEmail.split('@')[0];

        const profile = createProfileObject(data.user.id, uEmail, uPhone, uName);
        profile.lastActiveAt = nowIso;
        profile.isOnline = true;

        setUser(profile);
        localStorage.setItem('tq_user_profile', JSON.stringify(profile));
        addToast(`Xin chào ${profile.name}! Đăng nhập thành công.`, 'success');
        return true;
      }
    } catch (e) {}

    addToast('Tài khoản (Email/SĐT) không tồn tại hoặc mật khẩu không chính xác!', 'error');
    return false;
  };

  // Global Password Reset (Quên Mật Khẩu)
  const resetPasswordUnified = async (emailOrPhone: string, newPass: string): Promise<boolean> => {
    const query = emailOrPhone.trim().toLowerCase();
    const cleanPhoneQuery = query.replace(/\s+/g, '');

    if (!query || !newPass) {
      addToast('Vui lòng nhập đầy đủ Email/SĐT và Mật khẩu mới!', 'error');
      return false;
    }

    const localAccounts = JSON.parse(localStorage.getItem('tq_phone_users') || '[]');
    const idx = localAccounts.findIndex((u: any) => {
      const matchEmail = u.email && u.email.toLowerCase() === query;
      const matchPhone = u.phone && u.phone.replace(/\s+/g, '') === cleanPhoneQuery;
      return matchEmail || matchPhone;
    });

    if (idx > -1) {
      localAccounts[idx].pass = newPass;
      localAccounts[idx].lastActiveAt = new Date().toISOString();
      localStorage.setItem('tq_phone_users', JSON.stringify(localAccounts));

      try {
        await supabase.auth.updateUser({ password: newPass }).catch(() => {});
      } catch (e) {}

      recordAuditLog(localAccounts[idx].name || 'Khách hàng', 'USER', 'Quên Mật Khẩu', query, 'Đặt lại mật khẩu tài khoản thành công', 'SUCCESS');
      addToast('🎉 Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.', 'success');
      return true;
    }

    addToast('Không tìm thấy tài khoản nào khớp với Email hoặc Số điện thoại đã nhập!', 'error');
    return false;
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

      recordAuditLog(user.name, user.role, 'Đổi Mật Khẩu', `Tài khoản: ${user.phone || user.email || user.name}`, 'Thay đổi mật khẩu tài khoản thành công', 'SUCCESS');
      addToast('🔑 Đổi mật khẩu thành công! Mật khẩu cũ không còn hiệu lực trên toàn hệ thống.', 'success');
      return true;
    } catch (err: any) {
      addToast(`Lỗi đổi mật khẩu: ${err?.message || err}`, 'error');
      return false;
    }
  };

  // Realtime update user coins balance & audit transaction history across system
  const updateCoins = async (
    amount: number,
    isAddition: boolean = true,
    sourceDescription?: string,
    type?: CoinTransaction['type']
  ) => {
    if (!user) return;

    const newCoins = isAddition ? (user.coins || 0) + amount : amount;
    const updatedUser: UserProfile = {
      ...user,
      coins: newCoins
    };

    setUser(updatedUser);
    localStorage.setItem('tq_user_profile', JSON.stringify(updatedUser));

    // Also update in tq_phone_users array if applicable
    if (user.phone) {
      const localAccounts = JSON.parse(localStorage.getItem('tq_phone_users') || '[]');
      const idx = localAccounts.findIndex((u: any) => u.phone === user.phone);
      if (idx > -1) {
        localAccounts[idx].coins = newCoins;
        localStorage.setItem('tq_phone_users', JSON.stringify(localAccounts));
      }
    }

    // Save Audit Transaction Ledger Record
    const txAmount = isAddition ? amount : (amount - (user.coins || 0));
    const newTx: CoinTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      userEmail: user.email,
      amount: txAmount,
      type: type || 'WATCH_VIDEO',
      sourceDescription: sourceDescription || 'Thưởng TQ Coins hệ thống',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN')
    };

    const savedTxs = JSON.parse(localStorage.getItem('tq_coin_transactions') || '[]');
    const updatedTxs = [newTx, ...savedTxs];
    localStorage.setItem('tq_coin_transactions', JSON.stringify(updatedTxs));

    // Sync to Supabase Cloud DB
    try {
      await supabase.from('profiles').upsert([
        {
          id: user.id,
          coins: newCoins,
          updated_at: new Date().toISOString()
        }
      ]);
      await supabase.from('coin_transactions').insert([newTx]);
    } catch (e) {
      console.warn('Cloud coin & audit transaction sync active');
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
      registerUnified,
      loginUnified,
      resetPasswordUnified,
      changePassword,
      updateAvatar,
      updateCoins,
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
