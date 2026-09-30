import React, { useState, useEffect } from 'react';
import { 
  X, User, Phone, ShieldCheck, Calendar, Clock, 
  ShoppingBag, LogOut, Check, RefreshCw, AlertCircle, Edit3 
} from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrderHistory: () => void;
  onOpenAuth: () => void;
}

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenOrderHistory,
  onOpenAuth
}) => {
  const { customerUser, logout, updateProfile } = useCustomerAuth();
  const [ordersCount, setOrdersCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(customerUser?.name || '');
  const [telegramInput, setTelegramInput] = useState(customerUser?.telegramUsername || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (customerUser?.phone) {
      setNameInput(customerUser.name);
      setTelegramInput(customerUser.telegramUsername || '');

      // Fetch count of orders placed with this phone number
      const q = query(collection(db, 'orders'), where('whatsappNumber', '==', customerUser.phone));
      getDocs(q).then((snap) => {
        setOrdersCount(snap.size);
      }).catch(() => {});
    }
  }, [customerUser]);

  if (!isOpen) return null;

  if (!customerUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div className="bg-[#0b0e17] text-white border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
            <User className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-black uppercase">লগইন প্রয়োজন</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            আপনার অ্যাকাউন্ট ও অর্ডার হিস্ট্রি দেখতে অনুগ্রহ করে লগইন বা রেজিস্ট্রেশন করুন।
          </p>

          <button
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
          >
            লগইন / রেজিস্টার করুন
          </button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setSaving(true);
    setMessage(null);
    const res = await updateProfile(nameInput, telegramInput);
    setSaving(false);
    if (res.success) {
      setIsEditing(false);
      setMessage('✅ প্রোফাইল সফলভাবে আপডেট হয়েছে!');
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage('❌ ' + (res.error || 'আপডেট করতে সমস্যা হয়েছে।'));
    }
  };

  const formattedJoinDate = customerUser.createdAt 
    ? new Date(customerUser.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'সম্প্রতি';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b0e17] text-white border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-[#131b31] to-[#0b0e17] border-b border-slate-800/80 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-xl shadow-blue-600/30 border-2 border-white/20">
              {customerUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-black text-white">{customerUser.name}</h2>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold block mt-0.5">
                {customerUser.phone}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                <span>যুক্ত হয়েছেন: {formattedJoinDate}</span>
              </span>
            </div>
          </div>
        </div>

        {message && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-center">
            {message}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => {
                onClose();
                onOpenOrderHistory();
              }}
              className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 p-4 rounded-2xl cursor-pointer transition-all group"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">মোট অর্ডার</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-white font-mono group-hover:text-blue-400 transition-colors">
                  {ordersCount}
                </span>
                <span className="text-[10px] font-bold text-blue-400 uppercase">দেখুন →</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">অ্যাকাউন্ট স্ট্যাটাস</span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-black text-emerald-400 uppercase">ভেরিফাইড ইউজার</span>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 bg-black/40 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-black text-white uppercase tracking-wider block">প্রোফাইল পরিবর্তন</span>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">নাম</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  required
                  className="w-full bg-black border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">টেলিগ্রাম ইউজারনেম (Optional)</label>
                <input
                  type="text"
                  value={telegramInput}
                  onChange={e => setTelegramInput(e.target.value)}
                  placeholder="@username"
                  className="w-full bg-black border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                >
                  {saving && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>সেভ করুন</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px] block">আপনার নাম ও বিবরণ</span>
                <span className="font-bold text-white text-xs">{customerUser.name}</span>
                {customerUser.telegramUsername && (
                  <span className="font-mono text-[11px] text-blue-400 block">{customerUser.telegramUsername}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>এডিট</span>
              </button>
            </div>
          )}

          {/* Quick Action: Open Order History */}
          <button
            onClick={() => {
              onClose();
              onOpenOrderHistory();
            }}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-between px-4 transition-all cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span>আমার অর্ডার হিস্ট্রি দেখুন (Order History)</span>
            </div>
            <span className="text-slate-400 text-xs">→</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট করুন (Log Out)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
