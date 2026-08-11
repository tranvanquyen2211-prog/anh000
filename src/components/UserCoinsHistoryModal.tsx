import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { CoinTransaction } from '../types';
import { X, Coins, Tv, Star, Crown, History, Sparkles, AlertCircle } from 'lucide-react';

interface UserCoinsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWatchToEarnModal?: () => void;
}

export const UserCoinsHistoryModal: React.FC<UserCoinsHistoryModalProps> = ({
  isOpen,
  onClose,
  onOpenWatchToEarnModal
}) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    if (!isOpen || !user) return;

    const loadUserTransactions = async () => {
      setLoading(true);

      // 1. Load from localStorage
      const localTxs: CoinTransaction[] = JSON.parse(localStorage.getItem('tq_coin_transactions') || '[]');
      const userLocalTxs = localTxs.filter(
        tx => tx.userId === user.id || (user.phone && tx.userPhone === user.phone) || (user.email && tx.userEmail === user.email)
      );

      // 2. Fetch from Supabase Cloud DB for complete history
      try {
        const { data, error } = await supabase
          .from('coin_transactions')
          .select('*')
          .or(`user_id.eq.${user.id},user_phone.eq.${user.phone || ''},user_email.eq.${user.email || ''}`)
          .order('timestamp', { ascending: false });

        if (!error && data && data.length > 0) {
          const cloudTxs: CoinTransaction[] = data.map((t: any) => ({
            id: t.id,
            userId: t.user_id || t.userId,
            userName: t.user_name || t.userName || user.name,
            userPhone: t.user_phone || t.userPhone,
            userEmail: t.user_email || t.userEmail,
            amount: t.amount || 0,
            type: t.type || 'WATCH_VIDEO',
            sourceDescription: t.source_description || t.sourceDescription || 'Tích xu hệ thống',
            timestamp: t.timestamp || t.created_at
          }));

          // Merge & deduplicate
          const map = new Map<string, CoinTransaction>();
          [...userLocalTxs, ...cloudTxs].forEach(item => map.set(item.id, item));
          setTransactions(Array.from(map.values()));
        } else {
          setTransactions(userLocalTxs);
        }
      } catch (e) {
        console.warn('Cloud user coin tx fetch fallback:', e);
        setTransactions(userLocalTxs);
      } finally {
        setLoading(false);
      }
    };

    loadUserTransactions();
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const totalEarned = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredTxs = transactions.filter(t => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-400/40 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Coins className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base text-amber-300 uppercase tracking-wider">
                VÍ XU TQ & NGUỒN GỐC TÍCH ĐIỂM
              </h3>
              <p className="text-xs text-slate-400">
                Minh bạch lịch sử tích xu, thưởng video & quà tặng tài khoản của bạn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar space-y-5">
          
          {/* Main Balance Highlight Card */}
          <div className="bg-gradient-to-r from-amber-500/20 via-orange/20 to-amber-600/20 border border-amber-400/40 rounded-3xl p-5 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                🪙 SỐ DƯ XU TQ HIỆN CÓ:
              </span>
              <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                <span className="text-3xl font-black text-amber-400 font-mono">
                  {(user.coins || 0).toLocaleString('vi-VN')}
                </span>
                <span className="text-sm font-extrabold text-amber-300">Xu TQ</span>
              </div>
              <p className="text-[11px] text-slate-300 italic">
                (1 Xu TQ = 1 VNĐ giảm trực tiếp khi thanh toán đơn hàng)
              </p>
            </div>

            {/* Quick Action Button */}
            {onOpenWatchToEarnModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenWatchToEarnModal();
                }}
                className="bg-gradient-to-r from-amber-400 to-orange hover:from-amber-500 hover:to-orange-hover text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-lg transition text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Tv className="w-4 h-4 text-slate-950" /> Xem Video Kiếm Xu Ngay
              </button>
            )}
          </div>

          {/* Stats Summary row */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-0.5">
              <span className="text-slate-400 font-medium block">Tổng Xu Đã Tích Lũy:</span>
              <span className="text-base font-black text-emerald-400 font-mono">+{totalEarned.toLocaleString('vi-VN')} Xu</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-0.5">
              <span className="text-slate-400 font-medium block">Tổng Lượt Giao Dịch:</span>
              <span className="text-base font-black text-amber-400 font-mono">{transactions.length} Lượt</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-400" /> NGUỒN GỐC TÍCH XU CHI TIẾT
            </h4>

            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {['ALL', 'WATCH_VIDEO', 'REVIEW_BONUS', 'ADMIN_GRANT'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition cursor-pointer shrink-0 border ${
                    filterType === t
                      ? 'bg-amber-400 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {t === 'ALL' ? 'TẤT CẢ' : t === 'WATCH_VIDEO' ? '📺 VIDEO' : t === 'REVIEW_BONUS' ? '⭐ ĐÁNH GIÁ' : '👑 ADMIN'}
                </button>
              ))}
            </div>
          </div>

          {/* History List */}
          {loading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Sparkles className="w-6 h-6 animate-spin mx-auto text-amber-400" />
              <p className="text-xs">Đang tải nhật ký nguồn gốc Xu...</p>
            </div>
          ) : filteredTxs.length > 0 ? (
            <div className="space-y-2.5">
              {filteredTxs.map(tx => (
                <div
                  key={tx.id}
                  className="bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 p-3.5 rounded-2xl flex items-start justify-between gap-3 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      {tx.type === 'WATCH_VIDEO' && <Tv className="w-4 h-4 text-pink-400" />}
                      {tx.type === 'REVIEW_BONUS' && <Star className="w-4 h-4 text-emerald-400" />}
                      {tx.type === 'ADMIN_GRANT' && <Crown className="w-4 h-4 text-purple-400" />}
                      {tx.type === 'PURCHASE_CASHBACK' && <Coins className="w-4 h-4 text-amber-400" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{tx.sourceDescription}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block">{tx.timestamp}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-sm font-black font-mono block ${tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} Xu
                    </span>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                      {tx.type === 'WATCH_VIDEO' ? 'Xem Video' : tx.type === 'REVIEW_BONUS' ? 'Đánh Giá' : tx.type === 'ADMIN_GRANT' ? 'Admin Cấp' : 'Hoàn Xu'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800/60 p-6 space-y-3">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-300">Chưa tìm thấy nhật ký tích xu</p>
                <p className="text-[11px] text-slate-500">Hãy bấm "Xem Video Kiếm Xu Ngay" để bắt đầu tích lũy Xu TQ!</p>
              </div>
              {onOpenWatchToEarnModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenWatchToEarnModal();
                  }}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  📺 Xem Video Ngay (+Xu)
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
