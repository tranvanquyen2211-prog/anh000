import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, UserCheck, Sparkles, Phone } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginEmail, registerEmail, loginPhone, registerPhone, loginGuest } = useAuth();
  
  const [authMode, setAuthMode] = useState<'phone' | 'email' | 'guest'>('phone');
  const [isRegistering, setIsRegistering] = useState(false);

  // Form Inputs
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let success = false;
    if (authMode === 'phone') {
      if (isRegistering) {
        success = await registerPhone(phone, password, name);
      } else {
        success = await loginPhone(phone, password);
      }
    } else if (authMode === 'email') {
      if (isRegistering) {
        success = await registerEmail(email, password, name);
      } else {
        success = await loginEmail(email, password);
      }
    } else if (authMode === 'guest') {
      success = await loginGuest(guestName.trim() || undefined);
    }

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
            onClick={() => { setAuthMode('phone'); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              authMode === 'phone' ? 'bg-navy text-white shadow-sm' : 'text-gray-600 hover:text-navy'
            }`}
          >
            <Phone className="w-3.5 h-3.5" /> Số Điện Thoại
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('email'); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              authMode === 'email' ? 'bg-navy text-white shadow-sm' : 'text-gray-600 hover:text-navy'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Email
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('guest'); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              authMode === 'guest' ? 'bg-orange text-white shadow-sm' : 'text-gray-600 hover:text-orange'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Khách Hàng
          </button>
        </div>

        {/* Header Title */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-black text-navy tracking-tight">
            {authMode === 'guest'
              ? 'Đăng Nhập Khách (Ẩn Danh)'
              : isRegistering
              ? `Đăng Ký bằng ${authMode === 'phone' ? 'Số Điện Thoại' : 'Email'}`
              : `Đăng Nhập bằng ${authMode === 'phone' ? 'Số Điện Thoại' : 'Email'}`}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {isRegistering
              ? 'Tự động đăng nhập vào hệ thống ngay sau khi đăng ký thành công!'
              : 'Kết nối hệ thống thời gian thực Supabase bảo mật cao'}
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Phone Input */}
          {authMode === 'phone' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Số điện thoại</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  placeholder="0987654321 / 0367818343"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
                />
              </div>
            </div>
          )}

          {/* Email Input */}
          {authMode === 'email' && (
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
          )}

          {/* Full Name Input (only during registration) */}
          {authMode !== 'guest' && isRegistering && (
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
          )}

          {/* Password Input */}
          {authMode !== 'guest' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mật khẩu</label>
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
          )}

          {/* Guest Display Name Input */}
          {authMode === 'guest' && (
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
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
              authMode === 'guest'
                ? 'bg-gradient-to-r from-orange to-amber-500 hover:from-orange-hover hover:to-amber-600'
                : isRegistering
                ? 'bg-orange hover:bg-orange-hover'
                : 'bg-navy hover:bg-navy-dark'
            }`}
          >
            {authMode === 'guest' ? (
              <>
                <UserCheck className="w-4 h-4" />
                {isSubmitting ? 'Đang tạo phiên...' : 'Vào Mua Sắm Ngay'}
              </>
            ) : isRegistering ? (
              isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng Ký & Đăng Nhập Ngay'
            ) : (
              isSubmitting ? 'Đang xác thực...' : 'Đăng Nhập'
            )}
          </button>
        </form>

        {/* Toggle Login/Register Mode */}
        {authMode !== 'guest' && (
          <div className="text-center mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              {isRegistering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-orange font-extrabold hover:underline cursor-pointer ml-1"
              >
                {isRegistering ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
