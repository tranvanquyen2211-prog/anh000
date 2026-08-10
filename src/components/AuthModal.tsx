import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, UserCheck, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginEmail, registerEmail, loginGuest } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'guest'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    const success = await loginEmail(email, password);
    setIsSubmitting(false);
    if (success) onClose();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    const success = await registerEmail(email, password, name);
    setIsSubmitting(false);
    if (success) {
      setActiveTab('login');
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await loginGuest(guestName.trim() || undefined);
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-gray-100 transform transition-all animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-navy p-1 transition rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Buttons */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 rounded-xl transition ${
              activeTab === 'login' ? 'bg-navy text-white shadow-sm' : 'text-gray-600 hover:text-navy'
            }`}
          >
            Đăng Nhập Email
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 rounded-xl transition ${
              activeTab === 'register' ? 'bg-navy text-white shadow-sm' : 'text-gray-600 hover:text-navy'
            }`}
          >
            Đăng Ký
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guest')}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1 ${
              activeTab === 'guest' ? 'bg-orange text-white shadow-sm' : 'text-gray-600 hover:text-orange'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Khách Hàng
          </button>
        </div>

        {/* Login Tab */}
        {activeTab === 'login' && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-navy tracking-tight">Đăng Nhập TQ Store</h3>
              <p className="text-xs text-gray-500 mt-1">Kết nối Supabase Auth bảo mật cao</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email tài khoản</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="user@example.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-navy hover:bg-navy-dark text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </button>
            </form>
          </div>
        )}

        {/* Register Tab */}
        {activeTab === 'register' && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-navy tracking-tight">Đăng Ký Tài Khoản Mới</h3>
              <p className="text-xs text-gray-500 mt-1">Tạo tài khoản mua sắm và nhận ưu đãi tích xu</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email đăng ký</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="user@example.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mật khẩu (ít nhất 6 ký tự)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange hover:bg-orange-hover text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Đang đăng ký...' : 'Tạo Tài Khoản'}
              </button>
            </form>
          </div>
        )}

        {/* Guest Tab */}
        {activeTab === 'guest' && (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-orange/10 text-orange rounded-full flex items-center justify-center mx-auto mb-2">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-navy">Đăng Nhập Khách Hàng (Ẩn Danh)</h3>
              <p className="text-xs text-gray-500 mt-1">Trải nghiệm mua sắm & nhắn tin thời gian thực ngay lập tức không cần mật khẩu!</p>
            </div>

            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tên hiển thị khi nhắn tin (Tùy chọn)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="VD: Khách hàng may mắn"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange to-amber-500 hover:from-orange-hover hover:to-amber-600 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isSubmitting ? 'Đang tạo phiên...' : 'Vào Mua Sắm Ngay'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
