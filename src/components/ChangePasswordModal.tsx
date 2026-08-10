import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Key, Lock, CheckCircle } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { user, changePassword } = useAuth();
  const { addToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      addToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('Mật khẩu mới và Nhập lại mật khẩu không khớp nhau!', 'error');
      return;
    }

    setIsSubmitting(true);
    const success = await changePassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-gray-100 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-navy p-1 transition rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <Key className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-navy">Đổi Mật Khẩu Tài Khoản</h3>
          <p className="text-xs text-gray-500 mt-1">
            Tài khoản: <strong className="text-navy">{user.name}</strong> ({user.phone || user.email})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Mật khẩu hiện tại</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Mật khẩu mới (Tối thiểu 6 ký tự)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nhập lại mật khẩu mới</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
              />
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed font-medium">
            ⚠️ <strong>Lưu ý quan trọng:</strong> Sau khi bấm đổi mật khẩu thành công, mật khẩu cũ sẽ bị vô hiệu hóa hoàn toàn trên mọi thiết bị!
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange hover:bg-orange-hover text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {isSubmitting ? 'Đang cập nhật mật khẩu...' : 'Xác Nhận Đổi Mật Khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
};
