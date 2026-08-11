import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import type { BankInfo, WalletTransaction } from '../types';
import {
  X,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Copy,
  CreditCard,
  History,
  Lock
} from 'lucide-react';

interface WalletDepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ADMIN_BANK_CONFIG: BankInfo = {
  bankName: 'MB Bank (Ngân hàng Quân Đội)',
  accountNumber: '0367818343',
  accountHolder: 'TRAN VAN QUYEN'
};

export const WalletDepositWithdrawModal: React.FC<WalletDepositWithdrawModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<number>(500000);
  const [userDepositBank, setUserDepositBank] = useState<string>('MB Bank');
  const [userDepositAccNum, setUserDepositAccNum] = useState<string>('');
  const [userDepositAccHolder, setUserDepositAccHolder] = useState<string>('');

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(200000);
  const [userWithdrawBank, setUserWithdrawBank] = useState<string>('MB Bank');
  const [userWithdrawAccNum, setUserWithdrawAccNum] = useState<string>('');
  const [userWithdrawAccHolder, setUserWithdrawAccHolder] = useState<string>('');

  // Transactions History State
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [securityErrorMsg, setSecurityErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;

    // Load registered deposit bank info if saved
    const savedUserStr = localStorage.getItem('tq_user_profile');
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        if (parsed.depositBankInfo) {
          setUserDepositBank(parsed.depositBankInfo.bankName || 'MB Bank');
          setUserDepositAccNum(parsed.depositBankInfo.accountNumber || '');
          setUserDepositAccHolder(parsed.depositBankInfo.accountHolder || '');

          setUserWithdrawBank(parsed.depositBankInfo.bankName || 'MB Bank');
          setUserWithdrawAccNum(parsed.depositBankInfo.accountNumber || '');
          setUserWithdrawAccHolder(parsed.depositBankInfo.accountHolder || '');
        }
      } catch (e) {}
    }

    // Load transactions from localStorage
    const savedTxs: WalletTransaction[] = JSON.parse(localStorage.getItem('tq_wallet_transactions') || '[]');
    const myTxs = savedTxs.filter(t => t.userId === user.id || (user.phone && t.userPhone === user.phone));
    setTransactions(myTxs);
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const transferSyntax = user.name ? `${user.name.toUpperCase()} ${user.phone || ''}`.trim() : `NAP VI ${user.phone || user.id}`;

  // Generated VietQR Code URL
  const vietQrUrl = `https://img.vietqr.io/image/MB-0367818343-compact2.png?amount=${depositAmount}&addInfo=${encodeURIComponent(transferSyntax)}&accountName=${encodeURIComponent(ADMIN_BANK_CONFIG.accountHolder)}`;

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`Đã sao chép ${label}: ${text}`, 'success');
  };

  // Submit Deposit Request
  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (depositAmount < 50000) {
      addToast('Số tiền nạp tối thiểu là 50.000 VNĐ!', 'error');
      return;
    }

    if (!userDepositAccNum.trim() || !userDepositAccHolder.trim()) {
      addToast('Vui lòng nhập đầy đủ Số tài khoản & Tên chủ tài khoản nạp tiền!', 'error');
      return;
    }

    const verifiedBankInfo: BankInfo = {
      bankName: userDepositBank,
      accountNumber: userDepositAccNum.trim(),
      accountHolder: userDepositAccHolder.trim().toUpperCase()
    };

    // Save Bank Info to User Profile for strict withdrawal verification
    const updatedUser = {
      ...user,
      depositBankInfo: verifiedBankInfo
    };

    localStorage.setItem('tq_user_profile', JSON.stringify(updatedUser));

    try {
      await supabase.from('profiles').upsert([
        {
          id: user.id,
          deposit_bank_info: verifiedBankInfo,
          updated_at: new Date().toISOString()
        }
      ]);
    } catch (e) {
      console.warn('Cloud deposit bank info sync active');
    }

    // Create Wallet Transaction Record
    const newTx: WalletTransaction = {
      id: `wtx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      userEmail: user.email,
      amount: depositAmount,
      type: 'DEPOSIT',
      bankInfo: verifiedBankInfo,
      transferSyntax,
      status: 'PENDING',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN')
    };

    const savedAllTxs = JSON.parse(localStorage.getItem('tq_wallet_transactions') || '[]');
    const updatedAll = [newTx, ...savedAllTxs];
    localStorage.setItem('tq_wallet_transactions', JSON.stringify(updatedAll));
    setTransactions([newTx, ...transactions]);

    window.dispatchEvent(new CustomEvent('tq_wallet_tx_updated', { detail: newTx }));

    try {
      await supabase.from('wallet_transactions').insert([newTx]);
    } catch (e) {
      console.warn('Cloud wallet tx sync active');
    }

    try {
      supabase.channel('public:wallet_transactions').send({
        type: 'broadcast',
        event: 'wallet_tx_created',
        payload: newTx
      });
    } catch (e) {}

    addToast(`🎉 ĐÃ KHỞI TẠO LỆNH NẠP ${depositAmount.toLocaleString('vi-VN')}Đ. VUI LÒNG CHUYỂN KHOẢN ĐÚNG NỘI DUNG VÀ MÃ QR!`, 'success');
  };

  // Submit Withdrawal Request with STRICT SECURITY VERIFICATION
  const handleSubmitWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityErrorMsg(null);

    const currentBalance = user.walletBalance || 0;

    if (withdrawAmount < 50000) {
      addToast('Số tiền rút tối thiểu là 50.000 VNĐ!', 'error');
      return;
    }

    if (withdrawAmount > currentBalance) {
      addToast(`Số dư Ví TQ Pay của bạn không đủ! Hiện có: ${currentBalance.toLocaleString('vi-VN')} VNĐ`, 'error');
      return;
    }

    if (!userWithdrawAccNum.trim() || !userWithdrawAccHolder.trim()) {
      addToast('Vui lòng nhập đầy đủ Số tài khoản & Tên chủ tài khoản nhận tiền!', 'error');
      return;
    }

    const cleanReqAccNum = userWithdrawAccNum.trim().replace(/\s+/g, '');
    const verifiedWithdrawBankInfo: BankInfo = {
      bankName: userWithdrawBank,
      accountNumber: cleanReqAccNum,
      accountHolder: userWithdrawAccHolder.trim().toUpperCase()
    };

    // 🔒 STRICT SECURITY CHECK: IF PREVIOUS DEPOSIT BANK EXISTS, MUST MATCH EXACTLY!
    const savedDepositBank = user.depositBankInfo || JSON.parse(localStorage.getItem('tq_user_profile') || '{}').depositBankInfo;

    if (savedDepositBank && savedDepositBank.accountNumber) {
      const cleanSavedAccNum = savedDepositBank.accountNumber.trim().replace(/\s+/g, '');
      const accNumMatches = cleanReqAccNum === cleanSavedAccNum;

      if (!accNumMatches) {
        const errorText = `❌ RÚT TIỀN BỊ KHÓA BẢO MẬT! Tài khoản nhận tiền bạn nhập (${userWithdrawBank} - STK: ${cleanReqAccNum}) KHÔNG KHỚP với Tài khoản Ngân hàng bạn đã dùng Nạp tiền (${savedDepositBank.bankName} - STK: ${cleanSavedAccNum}). Vì lý do an toàn tài sản & chống rút tiền gian lận, bạn BẮT BUỘC phải rút về đúng tài khoản ngân hàng đã Nạp tiền!`;
        setSecurityErrorMsg(errorText);
        addToast('❌ Rút tiền thất bại: Tài khoản nhận không khớp với tài khoản đã nạp!', 'error');
        return;
      }
    } else {
      // Auto-bind & register this bank account for future deposit/withdrawal matching
      const updatedUser = {
        ...user,
        depositBankInfo: verifiedWithdrawBankInfo
      };
      localStorage.setItem('tq_user_profile', JSON.stringify(updatedUser));
      try {
        await supabase.from('profiles').upsert([{ id: user.id, deposit_bank_info: verifiedWithdrawBankInfo }]);
      } catch (e) {}
    }

    // Freeze / Deduct pending withdrawal amount from user wallet balance
    const updatedBalance = currentBalance - withdrawAmount;
    user.walletBalance = updatedBalance;

    const currentUserStr = localStorage.getItem('tq_user_profile');
    if (currentUserStr) {
      const curr = JSON.parse(currentUserStr);
      curr.walletBalance = updatedBalance;
      localStorage.setItem('tq_user_profile', JSON.stringify(curr));
    }

    const savedUsers: any[] = JSON.parse(localStorage.getItem('tq_phone_users') || '[]');
    const userIndex = savedUsers.findIndex((u: any) => u.id === user.id || (user.phone && u.phone === user.phone));
    if (userIndex !== -1) {
      savedUsers[userIndex].walletBalance = updatedBalance;
      localStorage.setItem('tq_phone_users', JSON.stringify(savedUsers));
    }

    try {
      await supabase.from('profiles').upsert([{ id: user.id, wallet_balance: updatedBalance }]);
    } catch (e) {}

    // Create Withdrawal Request Record
    const newTx: WalletTransaction = {
      id: `wtx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      userEmail: user.email,
      amount: withdrawAmount,
      type: 'WITHDRAW',
      bankInfo: verifiedWithdrawBankInfo,
      status: 'PENDING',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN')
    };

    const savedAllTxs = JSON.parse(localStorage.getItem('tq_wallet_transactions') || '[]');
    const updatedAll = [newTx, ...savedAllTxs];
    localStorage.setItem('tq_wallet_transactions', JSON.stringify(updatedAll));
    setTransactions([newTx, ...transactions]);

    window.dispatchEvent(new CustomEvent('tq_wallet_tx_updated', { detail: newTx }));

    try {
      await supabase.from('wallet_transactions').insert([newTx]);
    } catch (e) {
      console.warn('Cloud wallet tx sync active');
    }

    try {
      supabase.channel('public:wallet_transactions').send({
        type: 'broadcast',
        event: 'wallet_tx_created',
        payload: newTx
      });
    } catch (e) {}

    addToast(`✅ LỆNH RÚT TIỀN ${withdrawAmount.toLocaleString('vi-VN')}Đ VỀ STK [${cleanReqAccNum}] ĐÃ ĐƯỢC GỬI ADMIN PHÊ DUYỆT!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Wallet className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base text-emerald-300 uppercase tracking-wider">
                VÍ TQ PAY • NẠP & RÚT TIỀN CHÍNH CHỦ
              </h3>
              <p className="text-xs text-slate-400">
                Nạp tiền tự động qua VietQR & Rút tiền bảo mật chuẩn ngân hàng
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

        {/* Current Wallet Balance Header Card */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">SỐ DƯ VÍ TQ PAY HIỆN CÓ:</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {(user.walletBalance || 0).toLocaleString('vi-VN')} VNĐ
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-bold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Khóa bảo mật tài khoản nạp/rút
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 bg-slate-950 border-b border-slate-800 text-xs font-black uppercase">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`py-3 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
              activeTab === 'deposit' ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10' : 'border-transparent text-slate-400 hover:bg-slate-900'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4 text-emerald-400" /> Nạp Tiền (QR/Bank)
          </button>

          <button
            onClick={() => setActiveTab('withdraw')}
            className={`py-3 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
              activeTab === 'withdraw' ? 'border-amber-400 text-amber-400 bg-amber-500/10' : 'border-transparent text-slate-400 hover:bg-slate-900'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4 text-amber-400" /> Rút Tiền Về STK
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
              activeTab === 'history' ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10' : 'border-transparent text-slate-400 hover:bg-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-cyan-400" /> Lịch Sử Nạp/Rút
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          
          {/* TAB 1: DEPOSIT MONEY */}
          {activeTab === 'deposit' && (
            <form onSubmit={handleSubmitDeposit} className="space-y-5 animate-in fade-in duration-200">
              
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  📥 CHỌN SỐ TIỀN CẦN NẠP VÀO VÍ:
                </h4>

                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  {[100000, 200000, 500000, 1000000, 2000000, 5000000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className={`py-2.5 rounded-xl border font-mono transition cursor-pointer ${
                        depositAmount === amt
                          ? 'bg-emerald-400 text-slate-950 border-emerald-400 font-black'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      +{amt.toLocaleString('vi-VN')}đ
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Số tiền tự nhập (VNĐ):</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={e => setDepositAmount(Number(e.target.value))}
                    min="50000"
                    step="10000"
                    className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-black text-lg rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-400"
                    required
                  />
                </div>
              </div>

              {/* User Registering Deposit Bank Details */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <h4 className="font-extrabold text-amber-400 flex items-center gap-1.5 uppercase text-[11px]">
                  <CreditCard className="w-3.5 h-3.5" /> 💳 THÔNG TIN TÀI KHOẢN NGÂN HÀNG NẠP TIỀN CỦA BẠN (DÙNG ĐỂ RÚT TIỀN SAU NÀY)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Tên Ngân Hàng:</label>
                    <input
                      type="text"
                      value={userDepositBank}
                      onChange={e => setUserDepositBank(e.target.value)}
                      placeholder="VD: MB Bank, Vietcombank..."
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Số Tài Khoản Nạp:</label>
                    <input
                      type="text"
                      value={userDepositAccNum}
                      onChange={e => setUserDepositAccNum(e.target.value)}
                      placeholder="Nhập STK của bạn..."
                      className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Tên Chủ Tài Khoản:</label>
                    <input
                      type="text"
                      value={userDepositAccHolder}
                      onChange={e => setUserDepositAccHolder(e.target.value.toUpperCase())}
                      placeholder="VD: NGUYEN VAN A"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* VietQR & Admin Bank Transfer Target */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 rounded-2xl border border-emerald-500/40 space-y-4">
                <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-400" /> THÔNG TIN TÀI KHOẢN NHẬN TIỀN CỦA ADMIN SÀN (VIETQR):
                </h4>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* VietQR Code Image */}
                  <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-800 shrink-0">
                    <img
                      src={vietQrUrl}
                      alt="VietQR Admin Bank"
                      className="w-36 h-36 object-contain"
                    />
                  </div>

                  {/* Bank Details Table */}
                  <div className="space-y-2 text-xs flex-1 w-full">
                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-medium">Ngân hàng:</span>
                      <span className="font-bold text-slate-100">{ADMIN_BANK_CONFIG.bankName}</span>
                    </div>

                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-medium">Số tài khoản:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-amber-400 text-sm">{ADMIN_BANK_CONFIG.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(ADMIN_BANK_CONFIG.accountNumber, 'Số tài khoản')}
                          className="text-slate-400 hover:text-amber-300 transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-medium">Chủ tài khoản:</span>
                      <span className="font-bold text-slate-100">{ADMIN_BANK_CONFIG.accountHolder}</span>
                    </div>

                    <div className="flex justify-between items-center bg-emerald-950/60 p-2 rounded-xl border border-emerald-500/40">
                      <span className="text-emerald-300 font-bold">Nội dung CK:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-amber-300">{transferSyntax}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(transferSyntax, 'Nội dung chuyển khoản')}
                          className="text-emerald-300 hover:text-white transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> 🚀 TÔI ĐÃ CHUYỂN KHOẢN - XÁC NHẬN NẠP TIỀN
              </button>

            </form>
          )}

          {/* TAB 2: WITHDRAW MONEY WITH STRICT BANK VERIFICATION */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleSubmitWithdraw} className="space-y-5 animate-in fade-in duration-200">
              
              {/* Security Error Alert */}
              {securityErrorMsg && (
                <div className="bg-rose-950/80 border-2 border-rose-500 p-4 rounded-2xl space-y-2 text-rose-200 text-xs shadow-xl animate-bounce">
                  <div className="flex items-center gap-2 text-rose-400 font-black uppercase text-sm">
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                    <span>BẢO MẬT TÀI KHOẢN: RÚT TIỀN BỊ TỪ CHỐI</span>
                  </div>
                  <p className="leading-relaxed font-medium">{securityErrorMsg}</p>
                </div>
              )}

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  📤 NHẬP SỐ TIỀN CẦN RÚT VỀ NGÂN HÀNG:
                </h4>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Số tiền rút (VNĐ):</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(Number(e.target.value))}
                    min="50000"
                    max={user.walletBalance || 0}
                    step="10000"
                    className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-mono font-black text-lg rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    (Số dư khả dụng: {(user.walletBalance || 0).toLocaleString('vi-VN')} VNĐ)
                  </span>
                </div>
              </div>

              {/* Destination Bank Account Verification */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-amber-400/40 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-extrabold text-amber-300 flex items-center gap-1.5 uppercase text-[11px]">
                    <Lock className="w-3.5 h-3.5 text-amber-400" /> TÀI KHOẢN NGÂN HÀNG NHẬN TIỀN (PHẢI TRÙNG KHỚP TÀI KHOẢN ĐÃ NẠP)
                  </h4>
                  <span className="bg-amber-500/20 text-amber-300 text-[9px] font-black px-2 py-0.5 rounded border border-amber-400/30">
                    🔒 Khóa bảo mật STK
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Tên Ngân Hàng:</label>
                    <input
                      type="text"
                      value={userWithdrawBank}
                      onChange={e => setUserWithdrawBank(e.target.value)}
                      placeholder="VD: MB Bank"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Số Tài Khoản Nhận:</label>
                    <input
                      type="text"
                      value={userWithdrawAccNum}
                      onChange={e => setUserWithdrawAccNum(e.target.value)}
                      placeholder="Nhập STK nạp tiền của bạn..."
                      className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Tên Chủ Tài Khoản:</label>
                    <input
                      type="text"
                      value={userWithdrawAccHolder}
                      onChange={e => setUserWithdrawAccHolder(e.target.value.toUpperCase())}
                      placeholder="VD: NGUYEN VAN A"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>

                {user.depositBankInfo && (
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 flex items-center justify-between">
                    <span>📌 Tài khoản ngân hàng đã xác thực từ lần nạp trước:</span>
                    <strong className="text-amber-400 font-mono">
                      {user.depositBankInfo.bankName} - {user.depositBankInfo.accountNumber} ({user.depositBankInfo.accountHolder})
                    </strong>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 via-orange to-amber-500 hover:from-amber-500 hover:to-orange text-slate-950 font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowUpCircle className="w-4 h-4" /> 📤 XÁC NHẬN GỬI YÊU CẦU RÚT TIỀN VỀ NGÂN HÀNG
              </button>

            </form>
          )}

          {/* TAB 3: TRANSACTION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <History className="w-4 h-4 text-cyan-400" /> NẠP/RÚT TIỀN TẠI VÍ TQ PAY ({transactions.length} GIAO DỊCH):
              </h4>

              {transactions.length > 0 ? (
                <div className="space-y-2.5">
                  {transactions.map(tx => (
                    <div
                      key={tx.id}
                      className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            tx.type === 'DEPOSIT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {tx.type === 'DEPOSIT' ? '📥 Nạp Tiền' : '📤 Rút Tiền'}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">{tx.timestamp}</span>
                        </div>

                        <p className="text-slate-300 text-[11px] font-medium">
                          🏦 Ngân hàng: <strong>{tx.bankInfo.bankName}</strong> - STK: <strong className="text-amber-300 font-mono">{tx.bankInfo.accountNumber}</strong> ({tx.bankInfo.accountHolder})
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-sm font-black font-mono block ${tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {tx.type === 'DEPOSIT' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')} VNĐ
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          tx.status === 'APPROVED' ? 'bg-emerald-600 text-white' : tx.status === 'REJECTED' ? 'bg-rose-600 text-white' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {tx.status === 'APPROVED' ? '✓ Đã Phê Duyệt' : tx.status === 'REJECTED' ? '✕ Từ Chối' : '⏳ Chờ Admin Duyệt'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-2">
                  <Wallet className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-300">Chưa có lịch sử nạp/rút tiền</p>
                  <p className="text-[11px] text-slate-500">Hãy chuyển sang tab "Nạp Tiền" để nạp tiền vào ví TQ Pay!</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
